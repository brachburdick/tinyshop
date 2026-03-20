/**
 * Launch package assembler.
 *
 * Reads a role's startup prompt from docs/agents/startup-prompts/{role}.md,
 * parses the "Load These Files" section to resolve context files, checks
 * which files exist, and assembles a LaunchPackage.
 */

import fs from "fs";
import path from "path";
import type { LaunchPackage, LaunchFile } from "@/types/index";

/** Role descriptions in plain language. */
const ROLE_DESCRIPTIONS: Record<string, string> = {
  orchestrator:
    "Plans and coordinates the overall project, dispatches other roles, and tracks progress.",
  architect:
    "Designs the system architecture, defines technical decisions, and creates the structural plan.",
  researcher:
    "Gathers information, conducts investigations, and produces research findings for the team.",
  designer:
    "Designs the user experience, creates UI specifications, and establishes visual patterns.",
  developer:
    "Implements features by writing code based on the spec and handoff packet.",
  validator:
    "Reviews completed work against acceptance criteria and produces a verdict.",
  "qa-tester":
    "Tests the implementation end-to-end and verifies quality against requirements.",
};

/** Default dispatch mode per role. */
const DISPATCH_MODE: Record<string, string> = {
  orchestrator: "ORCHESTRATOR",
  architect: "DIRECT",
  researcher: "DIRECT",
  designer: "DIRECT",
  developer: "DIRECT",
  validator: "DIRECT",
  "qa-tester": "DIRECT",
};

/**
 * Parse "Load These Files" section from a startup prompt.
 * Returns an array of { path, purpose } entries.
 *
 * Recognises bullet-list items of the form:
 *   - `path/to/file.md` — purpose description
 *   - `path/to/file.md` (purpose description)
 *   - `path/to/file.md`
 */
function parseFilesToLoad(promptContent: string): Array<{ path: string; purpose: string }> {
  const files: Array<{ path: string; purpose: string }> = [];

  // Find the "Load These Files" section
  const sectionMatch = promptContent.match(
    /##\s*Load These Files\b([\s\S]*?)(?=\n##\s|\s*$)/i
  );
  if (!sectionMatch) return files;

  const section = sectionMatch[1];
  const lines = section.split("\n");

  for (const line of lines) {
    // Match: - `path` — purpose  OR  - `path` (purpose)  OR  - `path`
    const match = line.match(
      /^\s*[-*]\s*`([^`]+)`(?:\s*[—–-]+\s*(.+)|\s*\(([^)]+)\))?/
    );
    if (match) {
      const filePath = match[1].trim();
      const purpose = (match[2] ?? match[3] ?? "Context file").trim();
      files.push({ path: filePath, purpose });
    }
  }

  return files;
}

/**
 * Parse "Expected Output" from startup prompt content.
 * Returns the path string or empty string if not found.
 */
function parseExpectedOutput(promptContent: string): string {
  const match = promptContent.match(/##\s*Expected Output\b[\s\S]*?`([^`]+\.md)`/i);
  return match ? match[1].trim() : "";
}

/**
 * Parse "Completion Checklist" items from startup prompt.
 */
function parseCompletionChecklist(promptContent: string): string[] {
  const sectionMatch = promptContent.match(
    /##\s*Completion Checklist\b([\s\S]*?)(?=\n##\s|\s*$)/i
  );
  if (!sectionMatch) return [];

  const section = sectionMatch[1];
  const items: string[] = [];
  for (const line of section.split("\n")) {
    const match = line.match(/^\s*[-*]\s*\[[ x]\]\s*(.+)/i);
    if (match) {
      items.push(match[1].trim());
    }
  }
  return items;
}

/**
 * Assemble a LaunchPackage for the given role.
 *
 * @param role         Role slug (e.g. "architect")
 * @param projectPath  Absolute path to the attached project
 * @returns            LaunchPackage, or null if the startup prompt doesn't exist
 */
export function assembleLaunchPackage(
  role: string,
  projectPath: string
): LaunchPackage | null {
  const promptRelPath = `docs/agents/startup-prompts/${role}.md`;
  const promptAbsPath = path.join(projectPath, promptRelPath);

  let promptContent: string;
  try {
    promptContent = fs.readFileSync(promptAbsPath, "utf-8");
  } catch {
    return null;
  }

  // Parse files to load
  const rawFiles = parseFilesToLoad(promptContent);
  const filesToLoad: LaunchFile[] = rawFiles.map(({ path: filePath, purpose }) => {
    const absPath = path.join(projectPath, filePath);
    const missing = !fs.existsSync(absPath);
    return { path: filePath, purpose, missing };
  });

  const expectedOutput = parseExpectedOutput(promptContent);
  const completionChecklist = parseCompletionChecklist(promptContent);

  const roleDescription =
    ROLE_DESCRIPTIONS[role.toLowerCase()] ??
    `The ${role} role handles its designated stage of the protocol pipeline.`;

  const dispatchMode = DISPATCH_MODE[role.toLowerCase()] ?? "DIRECT";

  // Assembled terminal command
  const terminalCommand = `claude --print "$(cat ${promptRelPath})"`;

  return {
    role,
    roleDescription,
    dispatchMode,
    filesToLoad,
    startupPrompt: promptContent,
    expectedOutput,
    completionChecklist,
    terminalCommand,
  };
}
