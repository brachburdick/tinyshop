/**
 * Next-action derivation.
 *
 * Reads the pipeline state source (orchestrator-state.md for v1.8, or
 * tasks.jsonl for v1.9) and determines the recommended next entity to
 * dispatch. Behavior is driven by the pipeline manifest.
 *
 * Graceful fallback: returns a safe default if the source is missing or
 * unparseable.
 */

import fs from "fs";
import path from "path";
import type { NextAction } from "@/types/index";
import { getManifest } from "./manifest";

const FALLBACK: NextAction = {
  entityId: "unknown",
  entityLabel: "Unknown",
  reason: "Unable to determine — state source not found",
  launchPackageUrl: "",
};

// ---------------------------------------------------------------------------
// Markdown-sections parser (v1.8)
// ---------------------------------------------------------------------------

function parseMarkdownNextPriority(
  content: string,
  sectionName: string
): { entityId: string; reason: string } | null {
  const escaped = sectionName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`##\\s*${escaped}\\b([\\s\\S]*?)(?=\\n##\\s|\\s*$)`, "i");
  const sectionMatch = content.match(re);
  if (!sectionMatch) return null;

  const section = sectionMatch[1];
  const itemMatch = section.match(
    /^\s*(?:\d+\.|[-*])\s+([A-Za-z][A-Za-z0-9 _-]*)(?:\s*[—–-]+\s*(.+))?/m
  );
  if (!itemMatch) return null;

  const entityId = itemMatch[1].trim().toLowerCase().replace(/\s+/g, "-");
  const reason = itemMatch[2]
    ? itemMatch[2].trim()
    : `${itemMatch[1].trim()} is next in the pipeline`;

  return { entityId, reason };
}

// ---------------------------------------------------------------------------
// JSONL parser (v1.9)
// ---------------------------------------------------------------------------

function parseJsonlNextAction(
  content: string
): { entityId: string; reason: string } | null {
  const lines = content.trim().split("\n").filter(Boolean);

  for (const line of lines) {
    try {
      const task = JSON.parse(line) as Record<string, unknown>;
      const status = String(task["status"] ?? "");
      if (status === "pending" || status === "ready") {
        const taskId = String(task["id"] ?? "unknown");
        const summary = String(task["summary"] ?? "Next pending task");
        return { entityId: taskId, reason: summary };
      }
    } catch {
      continue;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Derive the next recommended action for the project.
 */
export function deriveNextAction(projectPath: string): NextAction {
  const manifest = getManifest(projectPath);
  const { stateFormat, nextActionSection } = manifest.parsing;

  if (stateFormat === "none") {
    return { ...FALLBACK, reason: "No automated next-action for this pipeline version" };
  }

  // Determine which file to read
  const stateFilePath = stateFormat === "jsonl"
    ? manifest.paths.taskTracker
    : manifest.paths.stateFile;

  if (!stateFilePath) return FALLBACK;

  let content: string;
  try {
    content = fs.readFileSync(path.join(projectPath, stateFilePath), "utf-8");
  } catch {
    return FALLBACK;
  }

  let result: { entityId: string; reason: string } | null = null;

  if (stateFormat === "markdown-sections" && nextActionSection) {
    result = parseMarkdownNextPriority(content, nextActionSection);
  } else if (stateFormat === "jsonl") {
    result = parseJsonlNextAction(content);
  }

  if (!result) {
    return {
      ...FALLBACK,
      reason: "Unable to determine — state section not found or empty",
    };
  }

  // Resolve entity label from manifest
  const entity = manifest.entities.find((e) => e.id === result!.entityId);
  const entityLabel = entity?.label ?? result.entityId;

  return {
    entityId: result.entityId,
    entityLabel,
    reason: result.reason,
    launchPackageUrl: `/api/launch-package?entity=${encodeURIComponent(result.entityId)}`,
  };
}
