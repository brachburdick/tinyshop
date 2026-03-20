/**
 * Next-action derivation.
 *
 * Reads docs/agents/orchestrator-state.md and extracts the first item
 * from the "Next Session Priorities" section to determine the recommended
 * next role to dispatch.
 *
 * Graceful fallback: returns a safe default if the file is missing or
 * unparseable.
 */

import fs from "fs";
import path from "path";
import type { NextAction } from "@/types/index";

const FALLBACK: NextAction = {
  role: "unknown",
  reason: "Unable to determine — orchestrator state not found",
  launchPackageUrl: "",
};

/**
 * Extract the first "Next Session Priorities" entry from orchestrator state
 * content.
 *
 * Looks for a section like:
 *   ## Next Session Priorities
 *   1. Developer — implement X
 *   2. Validator — verify Y
 *
 * Returns { role, reason } or null if the section cannot be found.
 */
function parseNextPriority(content: string): { role: string; reason: string } | null {
  // Find the "Next Session Priorities" section
  const sectionMatch = content.match(
    /##\s*Next Session Priorities\b([\s\S]*?)(?=\n##\s|\s*$)/i
  );
  if (!sectionMatch) return null;

  const section = sectionMatch[1];

  // Match ordered or unordered list item: "1. Role — reason" or "- Role — reason"
  const itemMatch = section.match(
    /^\s*(?:\d+\.|[-*])\s+([A-Za-z][A-Za-z0-9 _-]*)(?:\s*[—–-]+\s*(.+))?/m
  );
  if (!itemMatch) return null;

  const role = itemMatch[1].trim().toLowerCase().replace(/\s+/g, "-");
  const reason = itemMatch[2]
    ? itemMatch[2].trim()
    : `${itemMatch[1].trim()} is next in the pipeline`;

  return { role, reason };
}

/**
 * Derive the next recommended action from the orchestrator state file.
 *
 * @param projectPath  Absolute path to the attached project
 */
export function deriveNextAction(projectPath: string): NextAction {
  const stateFilePath = path.join(projectPath, "docs/agents/orchestrator-state.md");

  let content: string;
  try {
    content = fs.readFileSync(stateFilePath, "utf-8");
  } catch {
    return FALLBACK;
  }

  const priority = parseNextPriority(content);
  if (!priority) {
    return {
      role: "unknown",
      reason: "Unable to determine — Next Session Priorities section not found",
      launchPackageUrl: "",
    };
  }

  return {
    role: priority.role,
    reason: priority.reason,
    launchPackageUrl: `/api/launch-package?role=${encodeURIComponent(priority.role)}`,
  };
}
