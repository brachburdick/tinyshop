/**
 * Frontmatter parser for protocol artifacts.
 * Uses gray-matter to extract YAML frontmatter and derives artifact type
 * from the pipeline manifest's artifact type rules. Never throws — returns
 * a parse-error record on malformed input.
 */

import matter from "gray-matter";
import path from "path";
import fs from "fs";
import type { ArtifactRecord } from "@/types/index";
import type { ManifestArtifactType } from "@/lib/types/manifest";
import { getManifest } from "@/lib/manifest";

/**
 * Derive an artifact type from the file path and optional frontmatter data,
 * using manifest-defined rules. Rules are checked in order; first match wins.
 *
 * If artifactTypeRules is not provided, returns the frontmatter override
 * or "unknown".
 */
export function deriveArtifactType(
  filePath: string,
  frontmatter: Record<string, unknown>,
  artifactTypeRules?: ManifestArtifactType[]
): string {
  // Explicit frontmatter override always wins
  const fmType = frontmatter["artifact_type"];
  if (typeof fmType === "string" && fmType.length > 0) {
    return fmType;
  }

  if (!artifactTypeRules) return "unknown";

  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  const basename = path.basename(normalized);

  for (const entry of artifactTypeRules) {
    for (const rule of entry.rules) {
      switch (rule.matchType) {
        case "basename":
          if (basename === rule.value.toLowerCase()) return entry.type;
          break;
        case "pathContains":
          if (normalized.includes(rule.value.toLowerCase())) return entry.type;
          break;
        case "frontmatterField":
          if (frontmatter[rule.value] !== undefined) return entry.type;
          break;
      }
    }
  }

  return "unknown";
}

/**
 * Parse a single markdown artifact file.
 * Returns an ArtifactRecord with status "parse-error" if the file is
 * unreadable or its frontmatter is malformed — never throws.
 *
 * @param filePath         Absolute path to the .md file
 * @param projectRoot      Absolute path to the project root
 * @param artifactTypeRules  Rules from the pipeline manifest (auto-loaded if omitted)
 */
export function parseArtifact(
  filePath: string,
  projectRoot: string,
  artifactTypeRules?: ManifestArtifactType[]
): ArtifactRecord {
  // Auto-load rules from manifest if not provided
  if (!artifactTypeRules) {
    try {
      const manifest = getManifest(projectRoot);
      artifactTypeRules = manifest.artifactTypes;
    } catch {
      // If manifest loading fails, proceed without rules
    }
  }
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
      type: deriveArtifactType(filePath, {}, artifactTypeRules),
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
    type: deriveArtifactType(filePath, fm, artifactTypeRules),
    status,
    supersedes,
    superseded_by,
    lastModified,
    frontmatter: fm,
  };
}
