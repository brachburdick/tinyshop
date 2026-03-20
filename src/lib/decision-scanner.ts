/**
 * Decision scanner.
 *
 * Scans indexed artifact files for decision markers defined in the pipeline
 * manifest, extracts the question text and surrounding context, and returns
 * a deterministic list of DecisionItem objects.
 *
 * ID generation: djb2 hash of (sourceFile + lineNumber).
 */

import fs from "fs";
import path from "path";
import type { DecisionItem } from "@/types/index";
import type { ArtifactIndex } from "@/lib/artifact-engine/index";
import { getManifest } from "./manifest";

/** Simple djb2 hash -> hex string for deterministic IDs. */
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
 */
function scanFile(absolutePath: string, relativePath: string, markers: string[]): DecisionItem[] {
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
    const lineNumber = i + 1;

    for (const marker of markers) {
      const markerIndex = line.indexOf(marker);
      if (markerIndex === -1) continue;

      const afterMarker = line.slice(markerIndex + marker.length).trim();
      const question = afterMarker.replace(/^[:\s—–-]+/, "").trim() || line.trim();

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
 */
export function scanDecisions(
  index: ArtifactIndex,
  projectPath: string
): DecisionItem[] {
  const manifest = getManifest(projectPath);
  const markers = manifest.decisionMarkers;

  const artifacts = index.getAll();
  const items: DecisionItem[] = [];

  for (const artifact of artifacts) {
    const absolutePath = path.join(projectPath, artifact.path);
    const found = scanFile(absolutePath, artifact.path, markers);
    items.push(...found);
  }

  return items;
}
