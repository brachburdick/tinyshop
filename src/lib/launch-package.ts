/**
 * Launch package assembler.
 *
 * Reads entity metadata from the pipeline manifest and, for v1.8-style
 * pipelines, parses the startup prompt to resolve context files. For v1.9
 * pipelines, returns a simpler package with just the command template.
 */

import fs from "fs";
import path from "path";
import type { LaunchPackage, LaunchFile } from "@/types/index";
import { getManifest } from "./manifest";

/**
 * Parse "Load These Files" section from a startup prompt.
 */
function parseFilesToLoad(promptContent: string): Array<{ path: string; purpose: string }> {
  const files: Array<{ path: string; purpose: string }> = [];

  const sectionMatch = promptContent.match(
    /##\s*Load These Files\b([\s\S]*?)(?=\n##\s|\s*$)/i
  );
  if (!sectionMatch) return files;

  const section = sectionMatch[1];
  const lines = section.split("\n");

  for (const line of lines) {
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
 * Assemble a LaunchPackage for the given entity.
 *
 * @param entityId     Entity slug (e.g. "architect" or "operator")
 * @param projectPath  Absolute path to the attached project
 * @returns            LaunchPackage, or null if the entity is not found
 */
export function assembleLaunchPackage(
  entityId: string,
  projectPath: string
): LaunchPackage | null {
  const manifest = getManifest(projectPath);

  // Find entity in manifest
  const entity = manifest.entities.find((e) => e.id === entityId);
  if (!entity) return null;

  // Determine terminal command
  const commandTemplate = entity.launchCommand ?? manifest.launch.commandTemplate;

  // Try to read startup prompt (v1.8-style)
  let promptContent = "";
  let promptRelPath = "";
  if (manifest.launch.startupPromptPattern) {
    promptRelPath = manifest.launch.startupPromptPattern.replace("{entityId}", entityId);
    const promptAbsPath = path.join(projectPath, promptRelPath);
    try {
      promptContent = fs.readFileSync(promptAbsPath, "utf-8");
    } catch {
      // No startup prompt — that's fine for v1.9
    }
  }

  // Parse files to load (only meaningful when a startup prompt exists)
  const filesToLoad: LaunchFile[] = promptContent
    ? parseFilesToLoad(promptContent).map(({ path: filePath, purpose }) => ({
        path: filePath,
        purpose,
        missing: !fs.existsSync(path.join(projectPath, filePath)),
      }))
    : [];

  const expectedOutput = promptContent ? parseExpectedOutput(promptContent) : "";
  const completionChecklist = promptContent ? parseCompletionChecklist(promptContent) : [];

  // Build terminal command from template
  const terminalCommand = commandTemplate
    .replace("{startupPromptPath}", promptRelPath)
    .replace("{projectPath}", projectPath)
    .replace("{entityId}", entityId);

  return {
    entityId: entity.id,
    entityLabel: entity.label,
    entityDescription: entity.description,
    entityKind: entity.kind,
    dispatchMode: entity.dispatchMode,
    filesToLoad,
    startupPrompt: promptContent,
    expectedOutput,
    completionChecklist,
    terminalCommand,
  };
}
