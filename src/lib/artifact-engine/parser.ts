/**
 * Frontmatter parser for protocol artifacts.
 * Uses gray-matter to extract YAML frontmatter and derives ArtifactType
 * from file path conventions. Never throws — returns a parse-error record
 * on malformed input.
 */

import matter from "gray-matter";
import path from "path";
import fs from "fs";
import type { ArtifactRecord, ArtifactType } from "@/types/index";

/**
 * Derive an ArtifactType from the file path and optional frontmatter data.
 * Path conventions take precedence; frontmatter can refine the result.
 */
export function deriveArtifactType(
  filePath: string,
  frontmatter: Record<string, unknown>
): ArtifactType {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  const basename = path.basename(normalized);

  // Explicit frontmatter override
  const fmType = frontmatter["artifact_type"] as string | undefined;
  if (fmType) {
    const valid: ArtifactType[] = [
      "spec",
      "plan",
      "tasks",
      "session-summary",
      "handoff-packet",
      "validator-verdict",
      "qa-verdict",
      "research-request",
      "research-findings",
      "orchestrator-state",
    ];
    if (valid.includes(fmType as ArtifactType)) {
      return fmType as ArtifactType;
    }
  }

  // Path-based derivation — more specific patterns checked first to avoid
  // a broad match (e.g. /specs/) swallowing a session-summary inside specs/.

  if (basename === "orchestrator-state.md" || normalized.includes("orchestrator-state")) {
    return "orchestrator-state";
  }
  if (normalized.includes("session-summary") || normalized.includes("session_summary")) {
    return "session-summary";
  }
  if (normalized.includes("handoff")) {
    return "handoff-packet";
  }
  if (normalized.includes("validator-verdict")) {
    return "validator-verdict";
  }
  if (normalized.includes("qa-verdict")) {
    return "qa-verdict";
  }
  if (normalized.includes("research-request")) {
    return "research-request";
  }
  if (normalized.includes("research-findings")) {
    return "research-findings";
  }
  if (normalized.includes("/specs/") || basename.startsWith("spec-") || basename === "spec.md") {
    return "spec";
  }
  if (normalized.includes("/plans/") || basename.startsWith("plan-") || basename === "plan.md") {
    return "plan";
  }
  if (basename === "tasks.md" || basename.startsWith("tasks-") || normalized.includes("/tasks/")) {
    return "tasks";
  }

  return "unknown";
}

/**
 * Parse a single markdown artifact file.
 * Returns an ArtifactRecord with status "parse-error" if the file is
 * unreadable or its frontmatter is malformed — never throws.
 *
 * @param filePath  Absolute path to the .md file
 * @param projectRoot  Absolute path to the project root (for relative path calculation)
 */
export function parseArtifact(filePath: string, projectRoot: string): ArtifactRecord {
  const name = path.basename(filePath, ".md");
  const relativePath = path.relative(projectRoot, filePath);

  let lastModified: string;
  try {
    const stat = fs.statSync(filePath);
    lastModified = stat.mtime.toISOString();
  } catch {
    lastModified = new Date().toISOString();
  }

  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf-8");
  } catch {
    return {
      path: relativePath,
      name,
      type: "unknown",
      status: "parse-error",
      supersedes: null,
      superseded_by: null,
      lastModified,
      frontmatter: {},
    };
  }

  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(raw);
  } catch {
    return {
      path: relativePath,
      name,
      type: deriveArtifactType(filePath, {}),
      status: "parse-error",
      supersedes: null,
      superseded_by: null,
      lastModified,
      frontmatter: {},
    };
  }

  const fm = (parsed.data ?? {}) as Record<string, unknown>;

  const status =
    typeof fm["status"] === "string" && fm["status"].length > 0
      ? fm["status"]
      : "unknown";

  const supersedes =
    typeof fm["supersedes"] === "string" &&
    fm["supersedes"].length > 0 &&
    fm["supersedes"].toLowerCase() !== "none"
      ? fm["supersedes"]
      : null;

  const superseded_by =
    typeof fm["superseded_by"] === "string" &&
    fm["superseded_by"].length > 0 &&
    fm["superseded_by"].toLowerCase() !== "none"
      ? fm["superseded_by"]
      : null;

  return {
    path: relativePath,
    name,
    type: deriveArtifactType(filePath, fm),
    status,
    supersedes,
    superseded_by,
    lastModified,
    frontmatter: fm,
  };
}
