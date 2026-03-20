# Handoff Packet: Developer — Phase 3 API Routes

## Role
Developer

## Objective
Implement all backend API routes and the SSE event stream. These routes expose the Artifact Engine, launch package assembly, next-action derivation, decision scanning, and settings CRUD to the frontend. After this phase, the entire backend is complete.

## Tasks

### TASK-006: SSE Endpoint + Event Bus
- Implement `src/lib/artifact-engine/event-bus.ts` — bridges Artifact Engine index events to SSE connections
- Implement `src/app/api/events/route.ts` — `GET /api/events` returns `text/event-stream`
- EventBus is a singleton that SSE route handlers subscribe to
- On connect: emit `{ type: "connected", data: { projectPath } }`
- On artifact index change: emit `artifact-changed` or `artifact-removed`
- Clean up SSE connection on client disconnect
- SSE `data:` field is single-line JSON

### TASK-007: Artifact API Routes
- Implement `src/app/api/artifacts/route.ts` — `GET /api/artifacts` returns `ArtifactRecord[]`
  - Optional `?type=` query param filters by `ArtifactType`
- Implement `src/app/api/artifacts/[...path]/route.ts` — `GET /api/artifacts/:path` returns `{ artifact: ArtifactRecord; content: string }`
  - 404 if artifact not in index
  - Read raw markdown content from disk
- Response shapes must match `docs/interfaces.md`

### TASK-008: Launch Package Assembly
- Implement `src/lib/launch-package.ts` — `assembleLaunchPackage(role: string, projectPath: string): LaunchPackage`
- Implement `src/app/api/launch-package/route.ts` — `GET /api/launch-package?role=architect`
- Reads startup prompt from `docs/agents/startup-prompts/{role}.md`
- Resolves "Load These Files" section to build `filesToLoad[]`
- Flags missing files with `missing: true`
- Assembles terminal command: `claude --print "$(cat docs/agents/startup-prompts/{role}.md)"`
- Includes plain-language role description
- 404 if role startup prompt not found

### TASK-009: Next-Action Derivation
- Implement `src/lib/next-action.ts` — `deriveNextAction(projectPath: string): NextAction`
- Implement `src/app/api/next-action/route.ts` — `GET /api/next-action`
- Reads and parses `docs/agents/orchestrator-state.md`
- Extracts "Next Session Priorities" section
- Returns first priority as the recommended role with reason
- Graceful fallback: `{ role: "unknown", reason: "Unable to determine — orchestrator state not found", launchPackageUrl: "" }`

### TASK-010: Decision Scanner
- Implement `src/lib/decision-scanner.ts` — `scanDecisions(projectPath: string): DecisionItem[]`
- Implement `src/app/api/decisions/route.ts` — `GET /api/decisions`
- Scans all indexed `.md` files for `[DECISION NEEDED]` and `[ASK OPERATOR]` markers
- Extracts question text following the marker
- Includes source file path, line number, and 1 line of surrounding context
- Generates deterministic ID from source path + line number (e.g., simple hash)

### Settings + Project API Routes
- Implement `src/app/api/settings/route.ts`:
  - `GET /api/settings` → returns `Settings`
  - `PUT /api/settings` → updates settings, returns updated `Settings`
- Implement `src/app/api/projects/scaffold/route.ts`:
  - `POST /api/projects/scaffold` → calls scaffolder, returns `ProjectConfig`
- Implement `src/app/api/projects/attach/route.ts`:
  - `POST /api/projects/attach` → calls compatibility checker, updates settings if compatible, returns `ProjectConfig`

### Server Initialization
- Wire up the Artifact Engine singleton: on first API request (or server start), initialize the watcher + index for the configured project path
- If no project path is configured, engine stays dormant until a project is attached

## Input Files
- Spec: `specs/feat-mvp/spec.md`
- Interfaces: `docs/interfaces.md`
- Types: `src/types/index.ts`
- Tasks: `specs/feat-mvp/tasks.md`
- Phase 2 outputs: `src/lib/artifact-engine/`, `src/lib/compatibility.ts`, `src/lib/scaffolder.ts`

## Validation Criteria
- `npm run build` succeeds with zero errors
- All API routes return correct response shapes per `docs/interfaces.md`
- SSE endpoint streams events when files are added/changed/deleted in the watched directory
- `GET /api/artifacts` returns indexed artifacts with optional type filter
- `GET /api/launch-package?role=architect` returns a valid LaunchPackage
- `GET /api/next-action` returns a NextAction (or graceful fallback)
- `GET /api/decisions` finds decision markers in test files
- Settings CRUD persists across server restarts
- Scaffold → attach round-trip works end-to-end

## Dispatch Mode
FULL — implement everything listed.

## Notes
- All API routes use Next.js App Router route handlers (`export async function GET/POST/PUT`)
- The Artifact Engine singleton pattern: use a module-level variable initialized lazily
- Do NOT implement UI components or frontend pages — that's Phase 4
- Do NOT implement the terminal launcher (`POST /api/launch`) — that's Phase 5 (TASK-020), it depends on the Launch Drawer frontend being ready
