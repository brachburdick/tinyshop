// Pipeline manifest types.
// Describes everything version-specific so all modules derive behavior from it.

export interface PipelineManifest {
  version: string;
  displayName: string;
  entities: ManifestEntity[];
  paths: ManifestPaths;
  compatibility: ManifestCompatibility;
  artifactTypes: ManifestArtifactType[];
  decisionMarkers: string[];
  launch: ManifestLaunch;
  parsing: ManifestParsing;
  scaffolding: ManifestScaffolding;
}

export interface ManifestEntity {
  id: string;
  label: string;
  description: string;
  kind: "role" | "skill" | "operator";
  dispatchMode: "DIRECT" | "ORCHESTRATOR" | "ON_DEMAND";
  mascotSprite: string | null;
  launchCommand: string | null;
}

export interface ManifestPaths {
  bootstrap: string;
  stateFile: string | null;
  taskTracker: string | null;
  templatesDir: string;
  startupPromptsDir: string | null;
  preambleDir: string | null;
  commonRules: string | null;
  skillsDir: string | null;
}

export interface ManifestCompatibility {
  requiredFiles: string[];
  requiredDirs: string[];
  entityValidation: ManifestEntityValidation | null;
}

export interface ManifestEntityValidation {
  dir: string;
  pattern: string;
  excludeFiles: string[];
  minCount: number;
}

export interface ManifestArtifactType {
  type: string;
  rules: ManifestArtifactRule[];
}

export interface ManifestArtifactRule {
  matchType: "basename" | "pathContains" | "frontmatterField";
  value: string;
}

export interface ManifestLaunch {
  commandTemplate: string;
  startupPromptPattern: string | null;
}

export interface ManifestParsing {
  stateFormat: "markdown-sections" | "jsonl" | "none";
  nextActionSection: string | null;
  nextActionField: string | null;
}

export interface ManifestScaffolding {
  dirs: string[];
  templateFiles: ManifestTemplateFile[];
}

export interface ManifestTemplateFile {
  path: string;
  templateId: string;
}
