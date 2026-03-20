# Spec: feat-mvp

---
status: APPROVED
project_root: /Users/brach/Documents/THE_FACTORY/projects/Tinyshop
revision_of: none
supersedes: none
superseded_by: none
---

## Summary

Tinyshop MVP is a local Next.js web app that gives a non-technical user a visual dashboard for a single THE_FACTORY protocol project. The user can create a new project via a guided form, attach an existing project, browse artifacts, see pipeline status, and launch agent sessions via one-click terminal integration. Tinyshop watches for agent output and updates the dashboard in real time.

## User-Facing Behavior

### Flow 1: New Project Setup
1. User opens Tinyshop for the first time. A welcome screen offers two options: "Start a new project" or "Open an existing project."
2. "Start a new project" opens a simple form: project name, tech stack, short description, and target folder path.
3. On submit, Tinyshop scaffolds the protocol directory structure (preambles, templates, startup prompts, docs, specs) into the chosen folder with the form values populated into the bootstrap files.
4. Tinyshop attaches to the new project and transitions to the Workshop Dashboard.

### Flow 2: Attach Existing Project
1. User selects "Open an existing project" and picks a folder.
2. Tinyshop checks for expected protocol files (`AGENT_BOOTSTRAP.md`, `preambles/`, `templates/`, `docs/agents/`).
3. If compatible: attach and transition to Workshop Dashboard.
4. If incompatible: show a clear message listing what's missing. Do not block read-only browsing — the user can still view whatever artifacts exist.

### Flow 3: Workshop Dashboard (primary view)
1. User sees a visual dashboard showing: active milestone, task status summary, which role is recommended next, and any pending decisions or blockers.
2. Agent roles are represented by TINY mascot labels (e.g., "TINY Architect," "TINY Developer"). Visual style: warm, compact, expressive — role icons or simple illustrated characters. Not photo-realistic.
3. Clicking a mascot opens a **launch drawer** on the side. The drawer shows:
   - Role name and what this role does (plain language)
   - The assembled launch package: files to load, startup prompt, expected output
   - A "Launch" button that opens the user's terminal with the command pre-filled
   - Current status: idle / awaiting output / complete
4. When an agent session completes externally and its output artifact appears on disk, the mascot updates to reflect completion. Tinyshop recommends the next step.
5. Pending `[DECISION NEEDED]` and `[ASK OPERATOR]` items appear as cards in a decision queue. These are read-only awareness items — the user reads them and resolves them in their editor or agent session.

### Flow 4: Artifact Viewer
1. User can browse all artifacts in the project from a sidebar or dedicated view.
2. Artifacts render as formatted markdown with syntax highlighting.
3. Frontmatter metadata (status, relationships) displays as structured badges above the content.

### Flow 5: Settings
1. User can change the attached project path.
2. User can configure their Anthropic API key (stored locally for future TINY Shopkeeper use).
3. Minimal UI — just the fields that matter.

## Technical Requirements

### TR-1: Project Scaffolding
- **Requirement:** Given a project name, stack, description, and folder path, generate a complete protocol directory structure with populated bootstrap files.
- **AC:** Running the scaffolder against an empty folder produces a valid protocol project that passes Tinyshop's own compatibility check.

### TR-2: Project Compatibility Detection
- **Requirement:** Determine whether a folder contains a compatible protocol project by checking for required files and structure.
- **AC:** Returns a structured result: `{ compatible: boolean, missing: string[] }`. Required files: `AGENT_BOOTSTRAP.md`, `preambles/COMMON_RULES.md`, at least one role preamble, `templates/` directory, `docs/agents/orchestrator-state.md`.

### TR-3: Artifact Engine
- **Requirement:** Watch the attached project directory for file changes. Parse artifact frontmatter. Maintain an in-memory index. Push updates to the frontend via SSE.
- **AC:** A file saved to the watched directory triggers an SSE event within 2 seconds. Frontmatter fields (status, supersedes, superseded_by) are parsed and indexed. Debounce rapid saves (100ms window).

### TR-4: Artifact Index API
- **Requirement:** Expose an API route that returns all indexed artifacts with their metadata.
- **AC:** `GET /api/artifacts` returns an array of `ArtifactRecord` objects. Supports optional `?type=spec|plan|task|session|handoff|verdict` filter.

### TR-5: Launch Package Assembly
- **Requirement:** For a given role and project, read the startup prompt, resolve context files, and assemble a launch package.
- **AC:** `GET /api/launch-package?role=architect` returns a `LaunchPackage` object with all fields populated from the project's actual files. If a referenced file is missing, the field is present with a `missing: true` flag rather than silently omitting it.

### TR-6: Terminal Launch Integration
- **Requirement:** The "Launch" button opens the user's default terminal application with a command pre-filled to start a Claude Code session with the appropriate startup prompt.
- **AC:** On macOS, clicking Launch opens Terminal.app (or iTerm if configured) with the command ready. The command includes `claude` with the startup prompt path. Platform-specific: macOS only for MVP.

### TR-7: Artifact Watcher — Completion Detection
- **Requirement:** When a launch package specifies an expected output artifact path, the Artifact Engine watches for that file's appearance or modification. When detected, update the role's status to "complete" and surface the next recommended action.
- **AC:** A new file appearing at the expected output path triggers a status update SSE event within 2 seconds.

### TR-8: Next-Action Derivation
- **Requirement:** Read the orchestrator state file and artifact index to determine the recommended next action (which role to dispatch next).
- **AC:** `GET /api/next-action` returns a `NextAction` object identifying the recommended role and reason. Derivation reads `docs/agents/orchestrator-state.md` and checks task status.

### TR-9: Decision Queue
- **Requirement:** Scan indexed artifacts for `[DECISION NEEDED]` and `[ASK OPERATOR]` markers. Surface them as structured items.
- **AC:** `GET /api/decisions` returns an array of `DecisionItem` objects with source file, line context, and the question text.

### TR-10: SSE Event Stream
- **Requirement:** A single SSE endpoint pushes all real-time updates to the frontend: artifact changes, status updates, completion events.
- **AC:** `GET /api/events` returns a `text/event-stream` response. Events use a `type` discriminator. Frontend connects via `EventSource` and receives updates without polling.

### TR-11: Settings Persistence
- **Requirement:** Store project path and user preferences in SQLite.
- **AC:** Settings survive app restart. `GET /api/settings` and `PUT /api/settings` for CRUD.

### TR-12: Markdown Rendering
- **Requirement:** Render artifact markdown with syntax highlighting and frontmatter badge display.
- **AC:** Code blocks have syntax highlighting. Frontmatter fields render as labeled badges above the content. Standard GitHub-flavored markdown is supported.

## Interface Definitions

```typescript
// === Shared Types ===

interface ArtifactRecord {
  path: string;              // relative to project root
  name: string;              // filename without extension
  type: ArtifactType;        // derived from path and frontmatter
  status: string;            // from frontmatter, e.g. "DRAFT", "APPROVED"
  supersedes: string | null;
  superseded_by: string | null;
  lastModified: string;      // ISO 8601
  frontmatter: Record<string, unknown>; // full parsed frontmatter
}

type ArtifactType =
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

interface LaunchPackage {
  role: string;
  roleDescription: string;   // plain-language description of what this role does
  dispatchMode: string;       // "DIRECT" or "ORCHESTRATOR"
  filesToLoad: LaunchFile[];
  startupPrompt: string;      // content of the startup prompt
  expectedOutput: string;     // expected output artifact path
  completionChecklist: string[];
  terminalCommand: string;    // the assembled CLI command
}

interface LaunchFile {
  path: string;               // relative to project root
  purpose: string;            // why this file is included
  missing: boolean;           // true if file doesn't exist on disk
}

interface NextAction {
  role: string;
  reason: string;             // plain-language explanation
  launchPackageUrl: string;   // link to GET the launch package
}

interface DecisionItem {
  id: string;                 // deterministic hash of source + line
  marker: "[DECISION NEEDED]" | "[ASK OPERATOR]";
  question: string;           // extracted question text
  sourceFile: string;         // relative path
  lineNumber: number;
  context: string;            // surrounding lines for clarity
}

interface ProjectConfig {
  projectPath: string;
  projectName: string;
  compatible: boolean;
  missing: string[];          // missing required files
}

interface Settings {
  projectPath: string | null;
  anthropicApiKey: string | null; // stored for future Shopkeeper use
}

// === SSE Event Types ===

type SSEEvent =
  | { type: "artifact-changed"; data: ArtifactRecord }
  | { type: "artifact-removed"; data: { path: string } }
  | { type: "status-update"; data: { role: string; status: RoleStatus } }
  | { type: "decision-found"; data: DecisionItem }
  | { type: "connected"; data: { projectPath: string } };

type RoleStatus = "idle" | "launched" | "awaiting-output" | "complete";

// === API Routes ===

// GET  /api/artifacts         → ArtifactRecord[]
// GET  /api/artifacts/:path   → { artifact: ArtifactRecord; content: string }
// GET  /api/launch-package    → LaunchPackage         (query: ?role=string)
// POST /api/launch            → { success: boolean }  (body: { role: string })
// GET  /api/next-action       → NextAction
// GET  /api/decisions         → DecisionItem[]
// GET  /api/events            → SSE stream
// GET  /api/settings          → Settings
// PUT  /api/settings          → Settings
// POST /api/projects/scaffold → ProjectConfig         (body: { name, stack, description, path })
// POST /api/projects/attach   → ProjectConfig         (body: { path })
```

## Layer Boundaries

- **Artifact Engine (backend service)** is responsible for: file watching (chokidar), frontmatter parsing, maintaining the in-memory artifact index, pushing SSE events, and debouncing rapid file changes. It runs as a singleton service initialized when the Next.js server starts.
- **API Layer (Next.js route handlers)** is responsible for: exposing REST endpoints, querying the Artifact Engine, assembling launch packages, reading orchestrator state, scanning for decisions, and managing settings via SQLite.
- **Frontend (React)** is responsible for: rendering the Workshop Dashboard, Artifact Viewer, launch drawers, decision queue, and settings. Connects to SSE for real-time updates. Does not read the filesystem directly.
- **Interface between Artifact Engine and API Layer:** The API layer imports and calls Artifact Engine functions directly (same process). No network boundary.
- **Interface between API Layer and Frontend:** HTTP REST + SSE. All shapes defined in the Interface Definitions above.
- **Interface between Backend and Filesystem:** chokidar watches + `fs.readFileSync` for artifact content. `better-sqlite3` for settings and lightweight indexes.

## Constraints

- **Local-first.** No auth, no remote storage, no hosted services. The only planned external API call is the Anthropic API for the future TINY Shopkeeper (deferred from MVP).
- **Filesystem is source of truth.** SQLite stores settings and lightweight indexes only. All artifact content is read from disk.
- **No session spawning.** Tinyshop opens the user's terminal app with a pre-filled command. It does not manage Claude Code process lifecycle.
- **macOS only for terminal integration.** The Launch button uses macOS-specific APIs (`open -a Terminal` or AppleScript). Cross-platform support is deferred.
- **Single project.** MVP supports one attached project at a time.
- **Non-technical user.** All UI copy uses plain language. Protocol terms (handoff, dispatch, preamble) are either avoided or explained inline.
- **Read-only for project artifacts.** Tinyshop reads and indexes artifacts but never writes to the project directory (except during initial scaffolding).

## Out of Scope

- TINY Shopkeeper (LLM-powered bootstrap agent) — deferred post-MVP
- Direct Claude Code process spawning or session management
- Live terminal output streaming or chat embedding
- Tool approval interception
- Parallel agent session tracking
- Multi-project dashboard
- Guided vs Ops mode toggle (single approachable mode)
- Diff/comparison view for superseded artifacts
- Tiered compatibility degradation (binary compatible/not)
- Custom mascot artwork or user-configurable mascots
- Mobile or responsive layout
- Cross-platform terminal launch (Windows, Linux)
- Protocol modification from the UI
- Decision resolution (write-back to artifacts)

## Open Questions

- None — all questions resolved in Feature Rationale session.

## Edge Cases

- **Empty project folder with non-empty subfolders:** Scaffolding should warn if the target folder contains existing files and ask for confirmation before proceeding.
- **Artifact with malformed frontmatter:** Parse what's possible, flag the artifact as `status: "parse-error"` in the index, and render the raw content. Do not crash or skip the file.
- **Watched file deleted:** Emit an `artifact-removed` SSE event and remove from the index.
- **Multiple rapid saves (e.g., editor auto-save):** Debounce file change events with a 100ms window to avoid flooding the frontend.
- **Expected output artifact already exists when Launch is clicked:** Treat as a re-run. Reset the role status to "launched" and watch for modification (not just creation).
- **Orchestrator state file missing or unparseable:** Degrade gracefully — show "Unable to determine next action" instead of crashing. The artifact viewer and manual launch still work.
- **User attaches a non-protocol folder:** Compatibility check returns `{ compatible: false, missing: [...] }`. User can still browse files in read-only mode but gets no workflow guidance.
- **Project folder moved or deleted while Tinyshop is running:** chokidar emits an error. Show a clear "Project folder not found" message and prompt re-attachment.
