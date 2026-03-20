/**
 * Pipeline manifest loader.
 *
 * Resolves the PipelineManifest for a project by:
 *   1. Checking for an explicit pipeline-manifest.json in the project root
 *   2. Auto-detecting the pipeline version from sentinel files
 *   3. Returning the embedded default for that version
 *
 * Caches per projectPath + mtime. Call clearManifestCache() when the
 * project path changes.
 */

import fs from "fs";
import path from "path";
import type { PipelineManifest } from "./types/manifest";

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

interface CacheEntry {
  manifest: PipelineManifest;
  mtime: number; // mtime of pipeline-manifest.json, or 0 for auto-detected
}

const cache = new Map<string, CacheEntry>();

export function clearManifestCache(): void {
  cache.clear();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getManifest(projectPath: string): PipelineManifest {
  const manifestPath = path.join(projectPath, "pipeline-manifest.json");

  // Try explicit manifest file
  try {
    const stat = fs.statSync(manifestPath);
    const mtime = stat.mtimeMs;
    const cached = cache.get(projectPath);
    if (cached && cached.mtime === mtime) return cached.manifest;

    const raw = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(raw) as PipelineManifest;
    cache.set(projectPath, { manifest, mtime });
    return manifest;
  } catch {
    // No explicit manifest — fall through to auto-detection
  }

  // Check cache for auto-detected manifest
  const cached = cache.get(projectPath);
  if (cached && cached.mtime === 0) return cached.manifest;

  // Auto-detect
  const version = detectPipelineVersion(projectPath);
  const manifest = version === "1.9" ? DEFAULT_V19 : DEFAULT_V18;
  cache.set(projectPath, { manifest, mtime: 0 });
  return manifest;
}

/**
 * Detect pipeline version from sentinel files.
 * Returns "1.9" if CLAUDE.md + .agent/ exist, "1.8" otherwise.
 */
export function detectPipelineVersion(projectPath: string): string {
  const hasClaudeMd = fileExists(path.join(projectPath, "CLAUDE.md"));
  const hasAgentDir = dirExists(path.join(projectPath, ".agent"));

  if (hasClaudeMd && hasAgentDir) return "1.9";
  return "1.8";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fileExists(p: string): boolean {
  try { return fs.statSync(p).isFile(); } catch { return false; }
}

function dirExists(p: string): boolean {
  try { return fs.statSync(p).isDirectory(); } catch { return false; }
}

// ---------------------------------------------------------------------------
// Default manifests
// ---------------------------------------------------------------------------

const DEFAULT_V18: PipelineManifest = {
  version: "1.8",
  displayName: "7-Role Pipeline",
  entities: [
    { id: "orchestrator", label: "TINY Orchestrator", description: "Coordinates the project, maintains state, and decides what happens next.", kind: "role", dispatchMode: "ORCHESTRATOR", mascotSprite: "orchestrator", launchCommand: null },
    { id: "architect", label: "TINY Architect", description: "Plans your project's architecture and implementation strategy.", kind: "role", dispatchMode: "DIRECT", mascotSprite: "architect", launchCommand: null },
    { id: "researcher", label: "TINY Researcher", description: "Investigates unknowns, gathers context, and surfaces findings.", kind: "role", dispatchMode: "DIRECT", mascotSprite: "researcher", launchCommand: null },
    { id: "designer", label: "TINY Designer", description: "Defines UI/UX specs, component hierarchy, and visual language.", kind: "role", dispatchMode: "DIRECT", mascotSprite: "designer", launchCommand: null },
    { id: "developer", label: "TINY Developer", description: "Implements features from task definitions and handoff packets.", kind: "role", dispatchMode: "DIRECT", mascotSprite: "developer", launchCommand: null },
    { id: "validator", label: "TINY Validator", description: "Reviews work against acceptance criteria and flags issues.", kind: "role", dispatchMode: "DIRECT", mascotSprite: "validator", launchCommand: null },
    { id: "qa-tester", label: "TINY QA Tester", description: "Tests live features, verifies behavior, and checks edge cases.", kind: "role", dispatchMode: "DIRECT", mascotSprite: "qa-tester", launchCommand: null },
  ],
  paths: {
    bootstrap: "AGENT_BOOTSTRAP.md",
    stateFile: "docs/agents/orchestrator-state.md",
    taskTracker: null,
    templatesDir: "templates",
    startupPromptsDir: "docs/agents/startup-prompts",
    preambleDir: "preambles",
    commonRules: "preambles/COMMON_RULES.md",
    skillsDir: "skills",
  },
  compatibility: {
    requiredFiles: ["AGENT_BOOTSTRAP.md", "preambles/COMMON_RULES.md", "docs/agents/orchestrator-state.md"],
    requiredDirs: ["templates"],
    entityValidation: { dir: "preambles", pattern: "*.md", excludeFiles: ["COMMON_RULES.md"], minCount: 1 },
  },
  artifactTypes: [
    { type: "orchestrator-state", rules: [{ matchType: "basename", value: "orchestrator-state.md" }, { matchType: "pathContains", value: "orchestrator-state" }] },
    { type: "session-summary", rules: [{ matchType: "pathContains", value: "session-summary" }, { matchType: "pathContains", value: "session_summary" }] },
    { type: "handoff-packet", rules: [{ matchType: "pathContains", value: "handoff" }] },
    { type: "validator-verdict", rules: [{ matchType: "pathContains", value: "validator-verdict" }] },
    { type: "qa-verdict", rules: [{ matchType: "pathContains", value: "qa-verdict" }] },
    { type: "research-request", rules: [{ matchType: "pathContains", value: "research-request" }] },
    { type: "research-findings", rules: [{ matchType: "pathContains", value: "research-findings" }] },
    { type: "spec", rules: [{ matchType: "pathContains", value: "/specs/" }, { matchType: "basename", value: "spec.md" }] },
    { type: "plan", rules: [{ matchType: "pathContains", value: "/plans/" }, { matchType: "basename", value: "plan.md" }] },
    { type: "tasks", rules: [{ matchType: "basename", value: "tasks.md" }, { matchType: "pathContains", value: "/tasks/" }] },
  ],
  decisionMarkers: ["[DECISION NEEDED]", "[ASK OPERATOR]"],
  launch: {
    commandTemplate: "claude --print \"$(cat {startupPromptPath})\"",
    startupPromptPattern: "docs/agents/startup-prompts/{entityId}.md",
  },
  parsing: {
    stateFormat: "markdown-sections",
    nextActionSection: "Next Session Priorities",
    nextActionField: null,
  },
  scaffolding: {
    dirs: ["preambles", "templates", "docs/agents/startup-prompts", "specs", "skills"],
    templateFiles: [
      { path: "AGENT_BOOTSTRAP.md", templateId: "agent-bootstrap" },
      { path: "preambles/COMMON_RULES.md", templateId: "common-rules" },
      { path: "docs/agents/orchestrator-state.md", templateId: "orchestrator-state" },
      { path: "templates/session-summary.md", templateId: "session-summary" },
    ],
  },
};

const DEFAULT_V19: PipelineManifest = {
  version: "1.9",
  displayName: "Operator + Skills",
  entities: [
    { id: "operator", label: "Operator Agent", description: "Single default agent. Loads skills on demand from the trigger table.", kind: "operator", dispatchMode: "DIRECT", mascotSprite: null, launchCommand: null },
  ],
  paths: {
    bootstrap: "CLAUDE.md",
    stateFile: null,
    taskTracker: ".agent/tasks.jsonl",
    templatesDir: "templates",
    startupPromptsDir: null,
    preambleDir: null,
    commonRules: null,
    skillsDir: "skills",
  },
  compatibility: {
    requiredFiles: ["CLAUDE.md"],
    requiredDirs: [".agent"],
    entityValidation: null,
  },
  artifactTypes: [
    { type: "task-tracker", rules: [{ matchType: "basename", value: "tasks.jsonl" }] },
    { type: "run-log", rules: [{ matchType: "basename", value: "runs.jsonl" }] },
    { type: "incident-log", rules: [{ matchType: "basename", value: "incidents.jsonl" }] },
    { type: "eval", rules: [{ matchType: "pathContains", value: "/evals/" }] },
    { type: "skill", rules: [{ matchType: "pathContains", value: "/skills/" }] },
    { type: "spec", rules: [{ matchType: "pathContains", value: "/specs/" }, { matchType: "basename", value: "spec.md" }] },
    { type: "plan", rules: [{ matchType: "pathContains", value: "/plans/" }, { matchType: "basename", value: "plan.md" }] },
    { type: "adr", rules: [{ matchType: "pathContains", value: "/adr/" }] },
  ],
  decisionMarkers: ["[BLOCKED]", "[DECISION NEEDED]", "[ASK OPERATOR]"],
  launch: {
    commandTemplate: "claude",
    startupPromptPattern: null,
  },
  parsing: {
    stateFormat: "jsonl",
    nextActionSection: null,
    nextActionField: "status",
  },
  scaffolding: {
    dirs: [".agent", ".agent/evals", "skills", "templates"],
    templateFiles: [
      { path: "CLAUDE.md", templateId: "claude-md" },
      { path: ".agent/tasks.jsonl", templateId: "empty-jsonl" },
      { path: ".agent/runs.jsonl", templateId: "empty-jsonl" },
      { path: ".agent/incidents.jsonl", templateId: "empty-jsonl" },
    ],
  },
};

export { DEFAULT_V18, DEFAULT_V19 };
