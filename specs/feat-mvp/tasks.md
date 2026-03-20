# Tasks: feat-mvp

---
status: APPROVED
project_root: /Users/brach/Documents/THE_FACTORY/projects/Tinyshop
revision_of: none
supersedes: none
superseded_by: none
---

## Dependency Graph

```
TASK-001 → TASK-002 → TASK-003
                    ↘
TASK-003 → TASK-004 → TASK-005 → TASK-006
                              ↘
TASK-005 → TASK-007
TASK-005 → TASK-008
TASK-005 → TASK-009 → TASK-010

TASK-006 + TASK-007 → TASK-011 → TASK-012 → TASK-013
                              ↘ TASK-014
                              ↘ TASK-015
                    → TASK-016

TASK-003 → TASK-017 → TASK-018 → TASK-019

TASK-008 + TASK-013 → TASK-020 → TASK-021

TASK-003 → TASK-022

TASK-021 → TASK-023
```

## Tasks

### TASK-001: Next.js project scaffold + dependencies
- **Layer:** Foundation
- **Estimated effort:** 15 minutes
- **Depends on:** none
- **Scope:** Project root — `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`
- **Inputs:** none
- **Outputs:** A running Next.js dev server with App Router, TypeScript strict mode, and Tailwind CSS configured. Dependencies installed: `better-sqlite3`, `chokidar`, `gray-matter`, `react-markdown`, `remark-gfm`, `rehype-highlight`.
- **Interface Scope:** NONE
- **QA Required:** NO — static verification sufficient
- **State Behavior:** [INLINE — simple]
- **Acceptance Criteria:**
  - [ ] `npm run dev` starts without errors
  - [ ] TypeScript strict mode enabled
  - [ ] Tailwind CSS classes render correctly
  - [ ] All dependencies listed above are in `package.json`
  - [ ] All pre-existing tests pass
- **Context files:** `skills/nextjs-app-router.md`
- **Status:** [ ] Not started

---

### TASK-002: Shared types + interface contract (CONTRACT_ONLY)
- **Layer:** Foundation
- **Estimated effort:** 20 minutes
- **Depends on:** TASK-001
- **Scope:** `src/types/index.ts`, `docs/interfaces.md`
- **Inputs:** Spec interface definitions
- **Outputs:** All shared TypeScript types defined in `src/types/index.ts`. `docs/interfaces.md` updated with full field inventory.
- **Interface Scope:** CONTRACT_ONLY
- **QA Required:** NO — static verification sufficient
- **State Behavior:** [INLINE — simple]
- **Acceptance Criteria:**
  - [ ] All types from spec Interface Definitions exist in `src/types/index.ts`
  - [ ] `docs/interfaces.md` updated with complete field inventory for all SSE events, API routes, and shared types
  - [ ] Types compile without errors
  - [ ] All pre-existing tests pass
- **Context files:** `specs/feat-mvp/spec.md` (Interface Definitions section), `skills/contract-integrity.md`
- **Status:** [ ] Not started

---

### TASK-003: SQLite schema + settings service
- **Layer:** Backend — Data
- **Estimated effort:** 20 minutes
- **Depends on:** TASK-001
- **Scope:** `src/lib/db.ts`, `src/lib/settings.ts`, `.tinyshop/tinyshop.db` (created at runtime)
- **Inputs:** `Settings` type from TASK-002
- **Outputs:** SQLite database initialization, `getSettings()` and `updateSettings()` functions.
- **Interface Scope:** PRODUCER
- **QA Required:** NO — unit testable
- **State Behavior:** [INLINE — simple]
- **Acceptance Criteria:**
  - [ ] SQLite database is created on first access at `.tinyshop/tinyshop.db`
  - [ ] `settings` table stores `projectPath` and `anthropicApiKey`
  - [ ] `getSettings()` returns current settings
  - [ ] `updateSettings()` persists changes
  - [ ] Settings survive server restart
  - [ ] If interface values change, update `docs/interfaces.md` or flag `[INTERFACE IMPACT]`
  - [ ] All pre-existing tests pass
- **Context files:** `specs/feat-mvp/spec.md`, `skills/contract-integrity.md`
- **Status:** [ ] Not started

---

### TASK-004: Artifact Engine — file watcher + frontmatter parser
- **Layer:** Backend — Artifact Engine
- **Estimated effort:** 25 minutes
- **Depends on:** TASK-002
- **Scope:** `src/lib/artifact-engine/watcher.ts`, `src/lib/artifact-engine/parser.ts`
- **Inputs:** Shared types, a project path
- **Outputs:** A `startWatcher(projectPath)` function that emits parsed artifact events. A `parseArtifact(filePath)` function that extracts frontmatter and derives `ArtifactType`.
- **Interface Scope:** PRODUCER
- **QA Required:** YES — file watching behavior must be verified live
- **State Behavior:** [INLINE — simple]
- **Acceptance Criteria:**
  - [ ] chokidar watches the project directory for `.md` file changes
  - [ ] Ignores `node_modules/`, `.git/`, `.tinyshop/`
  - [ ] `parseArtifact()` extracts YAML frontmatter via `gray-matter`
  - [ ] Malformed frontmatter produces a result with `status: "parse-error"` instead of throwing
  - [ ] File changes are debounced (100ms window)
  - [ ] Watcher emits typed events: `add`, `change`, `unlink`
  - [ ] If interface values change, update `docs/interfaces.md` or flag `[INTERFACE IMPACT]`
  - [ ] All pre-existing tests pass
- **Context files:** `specs/feat-mvp/spec.md`, `skills/contract-integrity.md`
- **Status:** [ ] Not started

---

### TASK-005: Artifact Engine — in-memory index
- **Layer:** Backend — Artifact Engine
- **Estimated effort:** 20 minutes
- **Depends on:** TASK-004
- **Scope:** `src/lib/artifact-engine/index.ts`
- **Inputs:** Watcher events from TASK-004
- **Outputs:** `ArtifactIndex` class with `getAll()`, `getByType()`, `getByPath()` methods. Subscribes to watcher events and maintains an up-to-date `Map<string, ArtifactRecord>`.
- **Interface Scope:** PRODUCER
- **QA Required:** NO — unit testable
- **State Behavior:** [INLINE — simple]
- **Acceptance Criteria:**
  - [ ] Index populates on initial directory scan
  - [ ] Index updates on watcher `add`, `change`, `unlink` events
  - [ ] `getAll()` returns all artifacts
  - [ ] `getByType(type)` filters correctly
  - [ ] `getByPath(path)` returns single artifact or null
  - [ ] Removed files are removed from index
  - [ ] If interface values change, update `docs/interfaces.md` or flag `[INTERFACE IMPACT]`
  - [ ] All pre-existing tests pass
- **Context files:** `specs/feat-mvp/spec.md`, `skills/contract-integrity.md`
- **Status:** [ ] Not started

---

### TASK-006: SSE endpoint
- **Layer:** Backend — API
- **Estimated effort:** 20 minutes
- **Depends on:** TASK-005
- **Scope:** `src/app/api/events/route.ts`, `src/lib/artifact-engine/event-bus.ts`
- **Inputs:** Artifact Engine index events
- **Outputs:** `GET /api/events` returns a `text/event-stream`. An `EventBus` class bridges Artifact Engine events to SSE connections.
- **Interface Scope:** PRODUCER
- **QA Required:** YES — SSE connection behavior must be verified in browser
- **State Behavior:** [INLINE — simple]
- **Acceptance Criteria:**
  - [ ] `GET /api/events` returns `Content-Type: text/event-stream`
  - [ ] Emits `connected` event on initial connection with project path
  - [ ] Emits `artifact-changed` when a watched file is added or modified
  - [ ] Emits `artifact-removed` when a watched file is deleted
  - [ ] SSE `data:` field is single-line JSON
  - [ ] Server cleans up connection on client disconnect
  - [ ] If interface values change, update `docs/interfaces.md` or flag `[INTERFACE IMPACT]`
  - [ ] All pre-existing tests pass
- **Context files:** `specs/feat-mvp/spec.md`, `skills/nextjs-app-router.md`, `skills/contract-integrity.md`
- **Status:** [ ] Not started

---

### TASK-007: Artifact API routes
- **Layer:** Backend — API
- **Estimated effort:** 15 minutes
- **Depends on:** TASK-005
- **Scope:** `src/app/api/artifacts/route.ts`, `src/app/api/artifacts/[path]/route.ts`
- **Inputs:** Artifact Engine index
- **Outputs:** `GET /api/artifacts` returns `ArtifactRecord[]`. `GET /api/artifacts/:path` returns artifact record + rendered content.
- **Interface Scope:** PRODUCER
- **QA Required:** NO — static verification sufficient
- **State Behavior:** [INLINE — simple]
- **Acceptance Criteria:**
  - [ ] `GET /api/artifacts` returns all indexed artifacts
  - [ ] `?type=` query param filters by artifact type
  - [ ] `GET /api/artifacts/:path` returns artifact metadata + raw markdown content
  - [ ] 404 for non-existent artifact paths
  - [ ] Response shapes match `docs/interfaces.md`
  - [ ] If interface values change, update `docs/interfaces.md` or flag `[INTERFACE IMPACT]`
  - [ ] All pre-existing tests pass
- **Context files:** `specs/feat-mvp/spec.md`, `skills/nextjs-app-router.md`, `skills/contract-integrity.md`
- **Status:** [ ] Not started

---

### TASK-008: Launch package assembly
- **Layer:** Backend — API
- **Estimated effort:** 25 minutes
- **Depends on:** TASK-005
- **Scope:** `src/lib/launch-package.ts`, `src/app/api/launch-package/route.ts`
- **Inputs:** Project structure, startup prompts, preambles
- **Outputs:** `GET /api/launch-package?role=architect` returns a `LaunchPackage`. `assembleLaunchPackage(role, projectPath)` reads the project's startup prompt, preambles, and context files to build the package.
- **Interface Scope:** PRODUCER
- **QA Required:** YES — must verify against real project structure
- **State Behavior:** [INLINE — simple]
- **Acceptance Criteria:**
  - [ ] Reads startup prompt from `docs/agents/startup-prompts/{role}.md`
  - [ ] Resolves files to load from the startup prompt's "Load These Files" section
  - [ ] Flags missing files with `missing: true` instead of omitting
  - [ ] Assembles terminal command: `claude --print "$(cat docs/agents/startup-prompts/{role}.md)"`
  - [ ] Includes role description in plain language
  - [ ] Response shape matches `LaunchPackage` in `docs/interfaces.md`
  - [ ] If interface values change, update `docs/interfaces.md` or flag `[INTERFACE IMPACT]`
  - [ ] All pre-existing tests pass
- **Context files:** `specs/feat-mvp/spec.md`, `skills/contract-integrity.md`
- **Status:** [ ] Not started

---

### TASK-009: Next-action derivation
- **Layer:** Backend — API
- **Estimated effort:** 20 minutes
- **Depends on:** TASK-005
- **Scope:** `src/lib/next-action.ts`, `src/app/api/next-action/route.ts`
- **Inputs:** Orchestrator state file, artifact index
- **Outputs:** `GET /api/next-action` returns a `NextAction` identifying the recommended role and reason.
- **Interface Scope:** PRODUCER
- **QA Required:** YES — derivation logic must be tested against real orchestrator state
- **State Behavior:** [INLINE — simple]
- **Acceptance Criteria:**
  - [ ] Reads and parses `docs/agents/orchestrator-state.md`
  - [ ] Extracts "Next Session Priorities" section
  - [ ] Returns the first priority as the recommended role
  - [ ] If orchestrator state is missing or unparseable, returns `{ role: "unknown", reason: "Unable to determine — orchestrator state not found" }`
  - [ ] Response shape matches `NextAction` in `docs/interfaces.md`
  - [ ] If interface values change, update `docs/interfaces.md` or flag `[INTERFACE IMPACT]`
  - [ ] All pre-existing tests pass
- **Context files:** `specs/feat-mvp/spec.md`, `skills/contract-integrity.md`
- **Status:** [ ] Not started

---

### TASK-010: Decision scanner
- **Layer:** Backend — API
- **Estimated effort:** 20 minutes
- **Depends on:** TASK-005
- **Scope:** `src/lib/decision-scanner.ts`, `src/app/api/decisions/route.ts`
- **Inputs:** Artifact index (for file paths), filesystem (for content scanning)
- **Outputs:** `GET /api/decisions` returns `DecisionItem[]`.
- **Interface Scope:** PRODUCER
- **QA Required:** NO — unit testable with fixture files
- **State Behavior:** [INLINE — simple]
- **Acceptance Criteria:**
  - [ ] Scans all indexed artifact files for `[DECISION NEEDED]` and `[ASK OPERATOR]` markers
  - [ ] Extracts the question text following the marker
  - [ ] Includes source file path and line number
  - [ ] Includes surrounding context (1 line before and after)
  - [ ] Generates deterministic ID from source + line number
  - [ ] Response shape matches `DecisionItem[]` in `docs/interfaces.md`
  - [ ] If interface values change, update `docs/interfaces.md` or flag `[INTERFACE IMPACT]`
  - [ ] All pre-existing tests pass
- **Context files:** `specs/feat-mvp/spec.md`, `skills/contract-integrity.md`
- **Status:** [ ] Not started

---

### TASK-011: App shell + layout + navigation
- **Layer:** Frontend
- **Estimated effort:** 25 minutes
- **Depends on:** TASK-006, TASK-007
- **Scope:** `src/app/layout.tsx`, `src/app/page.tsx`, `src/components/AppShell.tsx`, `src/components/Navigation.tsx`
- **Inputs:** API routes available
- **Outputs:** App shell with sidebar navigation: Workshop, Artifacts, Settings. Responsive enough for desktop use. Warm, approachable visual style with Tailwind.
- **Interface Scope:** CONSUMER
- **QA Required:** NO — visual verification by operator
- **State Behavior:** [REQUIRES DESIGNER]
- **Acceptance Criteria:**
  - [ ] App shell renders with sidebar navigation
  - [ ] Navigation links: Workshop (default), Artifacts, Settings
  - [ ] Active route is visually highlighted
  - [ ] Layout uses Tailwind with warm, approachable color palette
  - [ ] Non-technical-friendly: no protocol jargon in navigation labels
  - [ ] All pre-existing tests pass
- **Context files:** `specs/feat-mvp/spec.md`, `skills/nextjs-app-router.md`
- **Status:** [ ] Not started

---

### TASK-012: Workshop Dashboard — status display + mascots
- **Layer:** Frontend
- **Estimated effort:** 30 minutes
- **Depends on:** TASK-011
- **Scope:** `src/app/workshop/page.tsx`, `src/components/workshop/StatusBoard.tsx`, `src/components/workshop/MascotCard.tsx`
- **Inputs:** `/api/next-action`, `/api/artifacts`, SSE events
- **Outputs:** Workshop page showing: active milestone, task status summary, mascot cards for each role with status indicators, next-action highlight.
- **Interface Scope:** CONSUMER
- **QA Required:** YES — real-time updates must be verified
- **State Behavior:** [REQUIRES DESIGNER]
- **Acceptance Criteria:**
  - [ ] Displays active milestone from orchestrator state
  - [ ] Shows mascot card for each TINY role (Orchestrator, Architect, Researcher, Designer, Developer, Validator, QA Tester)
  - [ ] Each mascot card shows role name, plain-language description, and status (idle/launched/awaiting-output/complete)
  - [ ] Recommended next role is visually highlighted
  - [ ] Status updates via SSE without page refresh
  - [ ] All pre-existing tests pass
- **Context files:** `specs/feat-mvp/spec.md`, `skills/nextjs-app-router.md`, `skills/contract-integrity.md`
- **Status:** [ ] Not started

---

### TASK-013: Launch Drawer component
- **Layer:** Frontend
- **Estimated effort:** 25 minutes
- **Depends on:** TASK-012
- **Scope:** `src/components/workshop/LaunchDrawer.tsx`
- **Inputs:** `/api/launch-package?role=`
- **Outputs:** A slide-out drawer triggered by clicking a mascot card. Shows role description, files to load, startup prompt, expected output, and a "Launch" button.
- **Interface Scope:** CONSUMER
- **QA Required:** YES — launch flow must be verified end-to-end
- **State Behavior:** [REQUIRES DESIGNER]
- **Acceptance Criteria:**
  - [ ] Drawer opens when mascot card is clicked, closes on second click or close button
  - [ ] Displays all LaunchPackage fields in plain language
  - [ ] Missing files are flagged visually (warning badge)
  - [ ] "Copy to Clipboard" button copies the terminal command
  - [ ] "Launch" button triggers `POST /api/launch`
  - [ ] Loading state while launch package is being fetched
  - [ ] All pre-existing tests pass
- **Context files:** `specs/feat-mvp/spec.md`, `skills/contract-integrity.md`
- **Status:** [ ] Not started

---

### TASK-014: Decision Queue component
- **Layer:** Frontend
- **Estimated effort:** 20 minutes
- **Depends on:** TASK-011
- **Scope:** `src/components/workshop/DecisionQueue.tsx`
- **Inputs:** `/api/decisions`
- **Outputs:** A card list showing pending decisions with source file, question text, and context. Read-only — no resolution flow.
- **Interface Scope:** CONSUMER
- **QA Required:** NO — static verification sufficient
- **State Behavior:** [INLINE — simple]
- **Acceptance Criteria:**
  - [ ] Displays all `[DECISION NEEDED]` and `[ASK OPERATOR]` items as cards
  - [ ] Each card shows: marker type, question text, source file name, and context snippet
  - [ ] Cards are visually distinct (e.g., yellow/amber for decisions)
  - [ ] Empty state: "No pending decisions" message
  - [ ] All pre-existing tests pass
- **Context files:** `specs/feat-mvp/spec.md`
- **Status:** [ ] Not started

---

### TASK-015: Artifact Viewer — sidebar + markdown renderer
- **Layer:** Frontend
- **Estimated effort:** 25 minutes
- **Depends on:** TASK-011
- **Scope:** `src/app/artifacts/page.tsx`, `src/components/artifacts/ArtifactSidebar.tsx`, `src/components/artifacts/ArtifactRenderer.tsx`
- **Inputs:** `/api/artifacts`, `/api/artifacts/:path`
- **Outputs:** A view with a sidebar listing all artifacts (grouped by type) and a main panel rendering the selected artifact as formatted markdown with frontmatter badges.
- **Interface Scope:** CONSUMER
- **QA Required:** NO — visual verification by operator
- **State Behavior:** [INLINE — simple]
- **Acceptance Criteria:**
  - [ ] Sidebar lists artifacts grouped by type
  - [ ] Clicking an artifact loads and renders its content
  - [ ] Markdown renders with syntax highlighting for code blocks
  - [ ] Frontmatter fields display as badges above content (status, supersedes, etc.)
  - [ ] Artifact list updates in real time via SSE (new/changed/removed)
  - [ ] All pre-existing tests pass
- **Context files:** `specs/feat-mvp/spec.md`, `skills/nextjs-app-router.md`
- **Status:** [ ] Not started

---

### TASK-016: SSE hook + real-time frontend updates
- **Layer:** Frontend
- **Estimated effort:** 20 minutes
- **Depends on:** TASK-006
- **Scope:** `src/hooks/useSSE.ts`, `src/hooks/useArtifacts.ts`
- **Inputs:** `GET /api/events` SSE stream
- **Outputs:** React hooks: `useSSE()` manages EventSource connection lifecycle. `useArtifacts()` maintains a client-side artifact index that updates from SSE events.
- **Interface Scope:** CONSUMER
- **QA Required:** YES — must verify real-time updates in browser
- **State Behavior:** [INLINE — simple]
- **Acceptance Criteria:**
  - [ ] `useSSE()` connects to `/api/events` and reconnects on disconnect
  - [ ] `useArtifacts()` provides current artifact list and updates on SSE events
  - [ ] Components re-render within 2 seconds of a file change on disk
  - [ ] No memory leaks — EventSource cleaned up on component unmount
  - [ ] If interface values change, update `docs/interfaces.md` or flag `[INTERFACE IMPACT]`
  - [ ] All pre-existing tests pass
- **Context files:** `specs/feat-mvp/spec.md`, `skills/contract-integrity.md`
- **Status:** [ ] Not started

---

### TASK-017: Project scaffolder utility
- **Layer:** Backend — Utility
- **Estimated effort:** 25 minutes
- **Depends on:** TASK-003
- **Scope:** `src/lib/scaffolder.ts`, `src/app/api/projects/scaffold/route.ts`
- **Inputs:** Project name, stack, description, target path
- **Outputs:** `POST /api/projects/scaffold` creates a complete protocol directory structure in the target folder. Returns `ProjectConfig`.
- **Interface Scope:** PRODUCER
- **QA Required:** YES — must verify generated structure passes compatibility check
- **State Behavior:** [INLINE — simple]
- **Acceptance Criteria:**
  - [ ] Creates directory structure: `preambles/`, `templates/`, `docs/agents/startup-prompts/`, `docs/agents/`, `specs/`, `skills/`
  - [ ] Generates `AGENT_BOOTSTRAP.md` populated with project name, stack, and description
  - [ ] Generates `preambles/COMMON_RULES.md` and role preambles from templates
  - [ ] Generates `docs/agents/orchestrator-state.md` with initial state
  - [ ] Returns `{ compatible: true, missing: [] }` when checked by compatibility checker
  - [ ] Refuses to scaffold into a non-empty directory without confirmation
  - [ ] If interface values change, update `docs/interfaces.md` or flag `[INTERFACE IMPACT]`
  - [ ] All pre-existing tests pass
- **Context files:** `specs/feat-mvp/spec.md`
- **Status:** [ ] Not started

---

### TASK-018: Compatibility checker
- **Layer:** Backend — Utility
- **Estimated effort:** 15 minutes
- **Depends on:** TASK-002
- **Scope:** `src/lib/compatibility.ts`, `src/app/api/projects/attach/route.ts`
- **Inputs:** A folder path
- **Outputs:** `POST /api/projects/attach` checks compatibility and returns `ProjectConfig`. `checkCompatibility(path)` returns `{ compatible: boolean, missing: string[] }`.
- **Interface Scope:** PRODUCER
- **QA Required:** NO — unit testable
- **State Behavior:** [INLINE — simple]
- **Acceptance Criteria:**
  - [ ] Checks for: `AGENT_BOOTSTRAP.md`, `preambles/COMMON_RULES.md`, at least one role preamble, `templates/` directory, `docs/agents/orchestrator-state.md`
  - [ ] Returns `compatible: true` only when all required files exist
  - [ ] Returns `missing` array listing all absent required files
  - [ ] If compatible, updates settings with the project path
  - [ ] If interface values change, update `docs/interfaces.md` or flag `[INTERFACE IMPACT]`
  - [ ] All pre-existing tests pass
- **Context files:** `specs/feat-mvp/spec.md`, `skills/contract-integrity.md`
- **Status:** [ ] Not started

---

### TASK-019: Welcome screen + project setup flow
- **Layer:** Frontend
- **Estimated effort:** 25 minutes
- **Depends on:** TASK-017, TASK-018
- **Scope:** `src/app/welcome/page.tsx`, `src/components/welcome/NewProjectForm.tsx`, `src/components/welcome/AttachProjectPicker.tsx`
- **Inputs:** `/api/projects/scaffold`, `/api/projects/attach`
- **Outputs:** Welcome page with two paths: "Start a new project" (form) and "Open an existing project" (folder picker). On success, transitions to Workshop Dashboard.
- **Interface Scope:** CONSUMER
- **QA Required:** YES — must verify both setup paths end-to-end
- **State Behavior:** [REQUIRES DESIGNER]
- **Acceptance Criteria:**
  - [ ] Welcome page displays when no project is attached
  - [ ] "Start new project" shows form: name, stack, description, folder path
  - [ ] Form submission calls scaffold API and then attaches the project
  - [ ] "Open existing project" shows folder picker (or text input for path)
  - [ ] Attach calls compatibility checker; shows missing files if incompatible
  - [ ] Successful setup redirects to Workshop Dashboard
  - [ ] All pre-existing tests pass
- **Context files:** `specs/feat-mvp/spec.md`, `skills/nextjs-app-router.md`
- **Status:** [ ] Not started

---

### TASK-020: Terminal launch integration (macOS)
- **Layer:** Backend — Integration
- **Estimated effort:** 25 minutes
- **Depends on:** TASK-008, TASK-013
- **Scope:** `src/lib/terminal-launcher.ts`, `src/app/api/launch/route.ts`
- **Inputs:** LaunchPackage with terminal command
- **Outputs:** `POST /api/launch` opens Terminal.app (or iTerm) with the command pre-filled. Returns `{ success: boolean }`.
- **Interface Scope:** END_TO_END
- **QA Required:** YES — must verify terminal opens with correct command
- **State Behavior:** [INLINE — simple]
- **Acceptance Criteria:**
  - [ ] `POST /api/launch` with `{ role: "architect" }` opens Terminal.app
  - [ ] Terminal opens with the assembled Claude command pre-filled
  - [ ] Uses `osascript` (AppleScript) to open terminal and run command
  - [ ] Falls back to `open -a Terminal` if AppleScript fails
  - [ ] Updates role status to "launched" on success
  - [ ] If interface values change, update `docs/interfaces.md` or flag `[INTERFACE IMPACT]`
  - [ ] All pre-existing tests pass
- **Context files:** `specs/feat-mvp/spec.md`
- **Status:** [ ] Not started

---

### TASK-021: Launch-then-watch flow (end-to-end)
- **Layer:** Integration
- **Estimated effort:** 20 minutes
- **Depends on:** TASK-020
- **Scope:** `src/lib/artifact-engine/completion-tracker.ts`, updates to `src/lib/artifact-engine/index.ts` and SSE event bus
- **Inputs:** LaunchPackage `expectedOutput`, Artifact Engine watcher events
- **Outputs:** When a launch is triggered, the system watches for the expected output artifact. When it appears, emits a `status-update` SSE event changing the role to "complete" and derives the next action.
- **Interface Scope:** END_TO_END
- **QA Required:** YES — must verify mascot updates after artifact appears
- **State Behavior:** [INLINE — simple]
- **Acceptance Criteria:**
  - [ ] After `POST /api/launch`, the system registers the expected output path
  - [ ] When the expected output file appears or is modified, emits `status-update` with `status: "complete"`
  - [ ] Mascot card updates to "complete" state without page refresh
  - [ ] Next-action derivation re-runs and dashboard updates
  - [ ] If the expected output already existed, watches for modification (not just creation)
  - [ ] If interface values change, update `docs/interfaces.md` or flag `[INTERFACE IMPACT]`
  - [ ] All pre-existing tests pass
- **Context files:** `specs/feat-mvp/spec.md`, `skills/contract-integrity.md`
- **Status:** [ ] Not started

---

### TASK-022: Settings view
- **Layer:** Frontend
- **Estimated effort:** 15 minutes
- **Depends on:** TASK-003, TASK-011
- **Scope:** `src/app/settings/page.tsx`, `src/components/settings/SettingsForm.tsx`
- **Inputs:** `/api/settings`
- **Outputs:** Settings page with project path display, option to change project, and Anthropic API key field (for future use).
- **Interface Scope:** CONSUMER
- **QA Required:** NO — static verification sufficient
- **State Behavior:** [INLINE — simple]
- **Acceptance Criteria:**
  - [ ] Displays current project path
  - [ ] "Change project" button returns to Welcome screen
  - [ ] API key field saves to settings (masked display)
  - [ ] Save confirmation shown on successful update
  - [ ] All pre-existing tests pass
- **Context files:** `specs/feat-mvp/spec.md`
- **Status:** [ ] Not started

---

### TASK-023: Edge case handling + error states
- **Layer:** All layers
- **Estimated effort:** 25 minutes
- **Depends on:** TASK-021
- **Scope:** Error boundaries, loading states, and edge case handling across all components and API routes
- **Inputs:** Edge cases from spec
- **Outputs:** Graceful handling for: malformed frontmatter, missing orchestrator state, deleted project folder, non-protocol folder attachment, rapid file saves, already-existing expected output.
- **Interface Scope:** NONE
- **QA Required:** YES — edge cases must be tested manually
- **State Behavior:** [INLINE — simple]
- **Acceptance Criteria:**
  - [ ] Malformed frontmatter: artifact renders with "parse-error" badge, raw content shown
  - [ ] Missing orchestrator state: "Unable to determine next action" message, no crash
  - [ ] Project folder deleted: clear error message, prompt to re-attach
  - [ ] Non-protocol folder: compatibility check shows missing files, read-only browsing still works
  - [ ] Scaffold into non-empty folder: warning + confirmation prompt
  - [ ] All API routes return appropriate error responses (4xx/5xx) with message
  - [ ] All frontend views have loading and error states
  - [ ] All pre-existing tests pass
- **Context files:** `specs/feat-mvp/spec.md`
- **Status:** [ ] Not started
