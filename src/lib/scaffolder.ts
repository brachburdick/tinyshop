/**
 * Project scaffolder.
 *
 * Creates a valid pipeline project directory structure in the target folder.
 * Scaffold layout is driven by the pipeline manifest — supports both v1.8
 * (7-role) and v1.9 (operator + skills) structures.
 *
 * Refuses to scaffold into a non-empty directory — returns an error result
 * rather than throwing.
 */

import fs from "fs";
import path from "path";
import { checkCompatibility } from "./compatibility";
import { DEFAULT_V18, DEFAULT_V19 } from "./manifest";
import type { ProjectConfig } from "@/types/index";
import type { BootstrapFormData } from "@/lib/types/index";
import type { PipelineManifest } from "@/lib/types/manifest";

// ---------------------------------------------------------------------------
// Template content generators — keyed by templateId
// ---------------------------------------------------------------------------

type TemplateGenerator = (data: BootstrapFormData, manifest: PipelineManifest) => string;

const TEMPLATE_GENERATORS: Record<string, TemplateGenerator> = {
  "agent-bootstrap": (data) => `# ${data.name}

${data.description}

## Quick Reference
- **Stack:** ${data.stack}
- **Current milestone:** feat-mvp
- **Active spec:** \`specs/feat-mvp/spec.md\`
- **Active tasks:** \`specs/feat-mvp/tasks.md\`

## Your Role Setup
1. Read this file first.
2. Read \`preambles/COMMON_RULES.md\`.
3. Read your role-specific preamble from \`preambles/[ROLE].md\`.
4. Read any skill files referenced in your handoff packet.

## Project Layout
- \`docs/\` — Architecture, constraints, decisions, glossary
- \`docs/interfaces.md\` — Canonical cross-layer contracts
- \`docs/agents/\` — Orchestrator state, startup prompts
- \`specs/\` — Feature specs, plans, tasks, session logs
- \`skills/\` — Domain knowledge files
- \`templates/\` — Artifact schemas
- \`preambles/\` — Agent role preambles
- \`src/\` — Source code

## Top 3 Things Agents Get Wrong in This Project
1. Skipping the preamble files before starting work.
2. Inventing formats instead of using templates from \`templates/\`.
3. Making changes outside the scope defined in the handoff packet.
`,

  "common-rules": () => `# Common Rules — All Roles

Read \`AGENT_BOOTSTRAP.md\` before anything else.

## Ask, Don't Assume
If the spec, handoff, or skill file does not answer your question, do not infer. Flag it as \`[BLOCKED]\` or \`[DECISION NEEDED]\` and continue with what you can do.

## Research Escalation (2-Attempt Rule)
If you try something twice and it doesn't work, stop. Write a Research Request and flag it in your session summary.

## Artifact Templates
All outputs must use the corresponding template from \`templates/\`. If no template exists for your output, flag it.

## Read Before Edit
Read every file before modifying it.

## Decision Transparency
Every non-trivial decision goes in your session summary under \`## Decisions Made\`.

## Misstep Reporting
Tool failures, wrong commands, retries, environment surprises — report them honestly in \`## Missteps\`.

## Before Ending Your Session
1. Write the required artifact(s) to the exact output path from your handoff packet.
2. If your work produced learnings, append them to \`LEARNINGS.md\`.
3. Tell the operator: "Session summary written to \`[path]\`."
`,

  "orchestrator-state": (data) => {
    const today = new Date().toISOString().split("T")[0];
    return `# Orchestrator State — ${data.name}

---
status: ACTIVE
last_updated: ${today}
---

## Current Milestone
feat-mvp

## Active Sessions
None

## Next Session Priorities
1. Architect — Define initial spec and architecture
2. Developer — Implement foundation

## Blockers
None

## Recent Completions
None

## Notes
Project scaffolded on ${today}.
`;
  },

  "session-summary": () => `# Session Summary: [FILL: TASK_ID]

---
status: [FILL: COMPLETE | PARTIAL | BLOCKED]
project_root: [FILL: /absolute/path/to/project]
---

## Role
[FILL: role name]

## Objective
[FILL: restate the handoff objective]

## Status
[FILL: COMPLETE | PARTIAL | BLOCKED]

## Work Performed
- [FILL: what was actually done]

## Files Changed
- \`[FILL: path/to/file]\` — [FILL: what changed and why]

## Artifacts Produced
- \`[FILL: path/to/artifact]\` — [FILL: what it is]

## Decisions Made
- [FILL: decision]: [FILL: rationale]. Alternative considered: [FILL: rejected option and why].

## Remaining Work
- [FILL: what is left undone, or "None"]

## Blocked On
- [FILL: unresolved dependency, decision, or "None"]

## Missteps
- [FILL: command/tool failure, retry, or environment surprise, or "None"]

## Learnings
- [FILL: durable lesson or skill-file candidate, or "None"]
`,

  // v1.9 templates
  "claude-md": (data) => `# ${data.name} — Project CLAUDE.md

## Stack
${data.stack}

## Build / Test
\`\`\`bash
# Add your build and test commands here
\`\`\`

## Architecture
${data.description}

## Critical Rules
- Read this file before starting work.
- Load skills from the trigger table as needed.
- Update .agent/tasks.jsonl at session end.

## Trigger Table
| Task Pattern | Skill | Notes |
|---|---|---|
| _Add project-specific skills here_ | skills/*.md | |

## Flow Skills
Flow skills are inherited from the portfolio level.

## Gotchas
- _Add project-specific gotchas as you discover them._
`,

  "empty-jsonl": () => "",
};

// ---------------------------------------------------------------------------
// v1.8 entity file generators
// ---------------------------------------------------------------------------

function rolePreambleContent(role: string): string {
  return `# Role: ${role}

You implement work within the scope defined by your handoff packet. You produce artifacts and a session summary.

## Artifact Output
Session summaries must use \`templates/session-summary.md\`. Every field is required ("None" is valid for empty sections).

## Scope Discipline
- Only read/modify files listed in the handoff packet's Scope Boundary.
- Out-of-scope changes needed? STOP. Document under Scope Violations.

## [BLOCKED] Protocol
On ambiguity not covered by spec or handoff:
1. Do not infer or guess.
2. Write \`[BLOCKED: description]\` in session summary.
3. Complete as much as possible without the blocked decision.
`;
}

function startupPromptContent(role: string, projectName: string): string {
  return `# ${role} Startup Prompt — ${projectName}

## Role
${role}

## Load These Files
- \`AGENT_BOOTSTRAP.md\`
- \`preambles/COMMON_RULES.md\`
- \`preambles/${role.toLowerCase()}.md\`

## Objective
[To be filled in by the Orchestrator before dispatching this role.]

## Expected Output
[To be defined per session.]
`;
}

// ---------------------------------------------------------------------------
// Scaffolder
// ---------------------------------------------------------------------------

export interface ScaffoldOptions {
  pipelineVersion?: "1.8" | "1.9";
}

/**
 * Scaffold a new protocol project into `data.path`.
 *
 * Returns a ProjectConfig. If the directory is non-empty, returns
 * `{ compatible: false, missing: ["Directory is not empty"] }` without
 * writing anything.
 */
export function scaffoldProject(
  data: BootstrapFormData,
  options: ScaffoldOptions = {}
): ProjectConfig {
  const targetPath = path.resolve(data.path);
  const version = options.pipelineVersion ?? "1.9";
  const manifest = version === "1.9" ? DEFAULT_V19 : DEFAULT_V18;

  // Guard: refuse to scaffold into a non-empty directory
  try {
    const entries = fs.readdirSync(targetPath);
    if (entries.length > 0) {
      return {
        projectPath: targetPath,
        projectName: data.name,
        pipelineVersion: version,
        compatible: false,
        missing: [
          "Directory is not empty — scaffolding refused. Clear the directory or choose an empty one.",
        ],
      };
    }
  } catch {
    // Directory doesn't exist yet — that's fine, we'll create it
  }

  // Create directory structure from manifest
  for (const dir of manifest.scaffolding.dirs) {
    fs.mkdirSync(path.join(targetPath, dir), { recursive: true });
  }

  // Write template files from manifest
  for (const tmpl of manifest.scaffolding.templateFiles) {
    const generator = TEMPLATE_GENERATORS[tmpl.templateId];
    if (generator) {
      write(targetPath, tmpl.path, generator(data, manifest));
    }
  }

  // v1.8: also generate per-entity files (preambles + startup prompts)
  if (version === "1.8") {
    for (const entity of manifest.entities) {
      if (manifest.paths.preambleDir) {
        write(
          targetPath,
          `${manifest.paths.preambleDir}/${entity.id}.md`,
          rolePreambleContent(entity.label)
        );
      }
      if (manifest.paths.startupPromptsDir) {
        write(
          targetPath,
          `${manifest.paths.startupPromptsDir}/${entity.id}.md`,
          startupPromptContent(entity.label, data.name)
        );
      }
    }
  }

  // Verify the result passes the compatibility checker
  return checkCompatibility(targetPath);
}

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

function write(base: string, relative: string, content: string): void {
  const fullPath = path.join(base, relative);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf-8");
}
