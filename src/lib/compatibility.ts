/**
 * Compatibility checker.
 *
 * Determines whether a folder contains a compatible THE_FACTORY protocol
 * project by verifying the presence of required files and directories.
 *
 * Required:
 *   - AGENT_BOOTSTRAP.md
 *   - preambles/COMMON_RULES.md
 *   - At least one role preamble in preambles/ (any .md other than COMMON_RULES.md)
 *   - templates/  (directory)
 *   - docs/agents/orchestrator-state.md
 *
 * Returns a ProjectConfig — never throws.
 */

import fs from "fs";
import path from "path";
import type { ProjectConfig } from "@/types/index";

const REQUIRED_FILES = [
  "AGENT_BOOTSTRAP.md",
  "preambles/COMMON_RULES.md",
  "templates",                         // directory
  "docs/agents/orchestrator-state.md",
] as const;

/**
 * Attempt to derive a human-readable project name from the folder or from
 * the first heading in AGENT_BOOTSTRAP.md.
 */
function deriveProjectName(projectPath: string): string {
  // Try to read the first H1 from AGENT_BOOTSTRAP.md
  const bootstrapPath = path.join(projectPath, "AGENT_BOOTSTRAP.md");
  try {
    const content = fs.readFileSync(bootstrapPath, "utf-8");
    const match = content.match(/^#\s+(.+)$/m);
    if (match && match[1]) {
      return match[1].trim();
    }
  } catch {
    // Fall through to folder name
  }

  return path.basename(projectPath);
}

/**
 * Check whether the directory at `projectPath` contains a compatible
 * protocol project structure.
 *
 * @param projectPath  Absolute path to the directory to check
 */
export function checkCompatibility(projectPath: string): ProjectConfig {
  const missing: string[] = [];

  // Check each required file/directory
  for (const required of REQUIRED_FILES) {
    const fullPath = path.join(projectPath, required);
    try {
      const stat = fs.statSync(fullPath);
      // "templates" must be a directory
      if (required === "templates" && !stat.isDirectory()) {
        missing.push(required);
      }
    } catch {
      missing.push(required);
    }
  }

  // Check for at least one role preamble
  const preambleDir = path.join(projectPath, "preambles");
  let hasRolePreamble = false;
  try {
    const entries = fs.readdirSync(preambleDir);
    hasRolePreamble = entries.some(
      (e) => e.endsWith(".md") && e !== "COMMON_RULES.md"
    );
  } catch {
    // preambles dir missing — already flagged above via COMMON_RULES.md check
  }

  if (!hasRolePreamble) {
    missing.push("preambles/<role>.md (at least one role preamble required)");
  }

  const projectName = deriveProjectName(projectPath);

  return {
    projectPath,
    projectName,
    compatible: missing.length === 0,
    missing,
  };
}
