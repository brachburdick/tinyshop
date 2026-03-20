/**
 * Decision scanner.
 *
 * Scans indexed artifact files for [DECISION NEEDED] and [ASK OPERATOR]
 * markers, extracts the question text and surrounding context, and returns
 * a deterministic list of DecisionItem objects.
 *
 * ID generation: sha256-like deterministic hash of (sourceFile + lineNumber).
 * We use a simple djb2 hash to avoid a crypto dependency.
 */

import fs from "fs";
import path from "path";
import type { DecisionItem } from "@/types/index";
import type { ArtifactIndex } from "@/lib/artifact-engine/index";

type Marker = "[DECISION NEEDED]" | "[ASK OPERATOR]";

const MARKERS: Marker[] = ["[DECISION NEEDED]", "[ASK OPERATOR]"];

/** Simple djb2 hash → hex string for deterministic IDs. */
function djb2(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
    hash = hash >>> 0; // keep 32-bit unsigned
  }
  return hash.toString(16).padStart(8, "0");
}

function makeId(sourceFile: string, lineNumber: number): string {
  return djb2(`${sourceFile}:${lineNumber}`);
}

/**
 * Scan a single file for decision markers.
 *
 * @param absolutePath  Absolute path to the file
 * @param relativePath  Relative path (used for sourceFile field)
 * @returns             Array of DecisionItem found in the file
 */
function scanFile(absolutePath: string, relativePath: string): DecisionItem[] {
  let content: string;
  try {
    content = fs.readFileSync(absolutePath, "utf-8");
  } catch {
    return [];
  }

  const lines = content.split("\n");
  const items: DecisionItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1; // 1-based

    for (const marker of MARKERS) {
      const markerIndex = line.indexOf(marker);
      if (markerIndex === -1) continue;

      // Extract question text: everything after the marker on the same line
      const afterMarker = line.slice(markerIndex + marker.length).trim();
      // Strip leading punctuation like ": " or "— "
      const question = afterMarker.replace(/^[:\s—–-]+/, "").trim() || line.trim();

      // Surrounding context: 1 line before and after (clamped to array bounds)
      const contextLines: string[] = [];
      if (i > 0) contextLines.push(lines[i - 1]);
      contextLines.push(line);
      if (i < lines.length - 1) contextLines.push(lines[i + 1]);
      const context = contextLines.join("\n");

      items.push({
        id: makeId(relativePath, lineNumber),
        marker,
        question,
        sourceFile: relativePath,
        lineNumber,
        context,
      });
    }
  }

  return items;
}

/**
 * Scan all indexed artifacts for decision markers.
 *
 * @param index        The ArtifactIndex to enumerate file paths from
 * @param projectPath  Absolute path to the project root
 */
export function scanDecisions(
  index: ArtifactIndex,
  projectPath: string
): DecisionItem[] {
  const artifacts = index.getAll();
  const items: DecisionItem[] = [];

  for (const artifact of artifacts) {
    const absolutePath = path.join(projectPath, artifact.path);
    const found = scanFile(absolutePath, artifact.path);
    items.push(...found);
  }

  return items;
}
