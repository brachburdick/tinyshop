// === Core Types ===

export interface ArtifactRecord {
  path: string; // relative to project root
  name: string; // filename without extension
  type: string; // derived from manifest rules and frontmatter
  status: string; // from frontmatter, e.g. "DRAFT", "APPROVED", "parse-error"
  supersedes: string | null;
  superseded_by: string | null;
  lastModified: string; // ISO 8601
  frontmatter: Record<string, unknown>; // full parsed frontmatter
}

export interface LaunchPackage {
  entityId: string;
  entityLabel: string;
  entityDescription: string;
  entityKind: "role" | "skill" | "operator";
  dispatchMode: string; // "DIRECT" or "ORCHESTRATOR" or "ON_DEMAND"
  filesToLoad: LaunchFile[];
  startupPrompt: string; // content of the startup prompt, or empty for v1.9
  expectedOutput: string; // expected output artifact path
  completionChecklist: string[];
  terminalCommand: string; // assembled CLI command
}

export interface LaunchFile {
  path: string; // relative to project root
  purpose: string; // why this file is included
  missing: boolean; // true if file doesn't exist on disk
}

export interface NextAction {
  entityId: string;
  entityLabel: string;
  reason: string; // plain-language explanation
  launchPackageUrl: string; // link to GET the launch package
}

export interface DecisionItem {
  id: string; // deterministic hash of source + line
  marker: string; // e.g. "[DECISION NEEDED]", "[ASK OPERATOR]", "[BLOCKED]"
  question: string; // extracted question text
  sourceFile: string; // relative path
  lineNumber: number;
  context: string; // surrounding lines for clarity
}

export interface ProjectConfig {
  projectPath: string;
  projectName: string;
  pipelineVersion: string;
  compatible: boolean;
  missing: string[]; // missing required files
}

export interface Settings {
  projectPath: string | null;
  anthropicApiKey: string | null;
}

// === SSE Event Types ===

export type EntityStatus = "idle" | "launched" | "awaiting-output" | "complete";

/** @deprecated Use EntityStatus instead */
export type RoleStatus = EntityStatus;

export type SSEEvent =
  | { type: "artifact-changed"; data: ArtifactRecord }
  | { type: "artifact-removed"; data: { path: string } }
  | { type: "status-update"; data: { entityId: string; status: EntityStatus } }
  | { type: "decision-found"; data: DecisionItem }
  | { type: "connected"; data: { projectPath: string } }
  | { type: "project-error"; data: { message: string } };
