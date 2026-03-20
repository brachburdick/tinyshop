// === Core Types ===

export interface ArtifactRecord {
  path: string; // relative to project root
  name: string; // filename without extension
  type: ArtifactType; // derived from path and frontmatter
  status: string; // from frontmatter, e.g. "DRAFT", "APPROVED", "parse-error"
  supersedes: string | null;
  superseded_by: string | null;
  lastModified: string; // ISO 8601
  frontmatter: Record<string, unknown>; // full parsed frontmatter
}

export type ArtifactType =
  | "spec"
  | "plan"
  | "tasks"
  | "session-summary"
  | "handoff-packet"
  | "validator-verdict"
  | "qa-verdict"
  | "research-request"
  | "research-findings"
  | "orchestrator-state"
  | "unknown";

export interface LaunchPackage {
  role: string;
  roleDescription: string; // plain-language description
  dispatchMode: string; // "DIRECT" or "ORCHESTRATOR"
  filesToLoad: LaunchFile[];
  startupPrompt: string; // content of the startup prompt
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
  role: string;
  reason: string; // plain-language explanation
  launchPackageUrl: string; // link to GET the launch package
}

export interface DecisionItem {
  id: string; // deterministic hash of source + line
  marker: "[DECISION NEEDED]" | "[ASK OPERATOR]";
  question: string; // extracted question text
  sourceFile: string; // relative path
  lineNumber: number;
  context: string; // surrounding lines for clarity
}

export interface ProjectConfig {
  projectPath: string;
  projectName: string;
  compatible: boolean;
  missing: string[]; // missing required files
}

export interface Settings {
  projectPath: string | null;
  anthropicApiKey: string | null;
}

// === SSE Event Types ===

export type RoleStatus = "idle" | "launched" | "awaiting-output" | "complete";

export type SSEEvent =
  | { type: "artifact-changed"; data: ArtifactRecord }
  | { type: "artifact-removed"; data: { path: string } }
  | { type: "status-update"; data: { role: string; status: RoleStatus } }
  | { type: "decision-found"; data: DecisionItem }
  | { type: "connected"; data: { projectPath: string } }
  | { type: "project-error"; data: { message: string } };
