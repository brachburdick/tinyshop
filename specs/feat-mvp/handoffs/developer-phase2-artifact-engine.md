# Handoff Packet: Developer — Phase 2 Artifact Engine + Project Utilities

## Role
Developer

## Objective
Build the Artifact Engine (file watcher + parser + in-memory index) and the project utility services (compatibility checker + scaffolder). These are pure backend — no UI, no API routes — and form the core data layer that all API endpoints will query.

## Tasks

### TASK-004: File Watcher + Frontmatter Parser
- Implement `src/lib/artifact-engine/watcher.ts` — chokidar-based watcher for `.md` files
- Implement `src/lib/artifact-engine/parser.ts` — frontmatter extraction via `gray-matter`
- Install `gray-matter` as a dependency
- Watcher config:
  - Watch the project directory recursively for `.md` files
  - Ignore `node_modules/`, `.git/`, `.tinyshop/`
  - Debounce rapid file changes with a 100ms window
- Parser behavior:
  - Extract YAML frontmatter fields: `status`, `supersedes`, `superseded_by`, plus full frontmatter object
  - Derive `ArtifactType` from file path conventions and frontmatter
  - Malformed frontmatter → return result with `status: "parse-error"`, do NOT throw
- `startWatcher(projectPath)` returns an event emitter with typed events: `add`, `change`, `unlink`
- `parseArtifact(filePath)` returns an `ArtifactRecord`

### TASK-005: In-Memory Artifact Index
- Implement `src/lib/artifact-engine/index.ts` — `ArtifactIndex` class
- Subscribes to watcher events and maintains a `Map<string, ArtifactRecord>`
- Methods:
  - `getAll(): ArtifactRecord[]`
  - `getByType(type: ArtifactType): ArtifactRecord[]`
  - `getByPath(path: string): ArtifactRecord | null`
- On initial start, performs a full directory scan to populate the index
- On `add`/`change`: parse and upsert into the map
- On `unlink`: remove from the map
- Exposes an event emitter for index changes (used later by SSE)

### TASK-018: Compatibility Checker
- Implement `src/lib/compatibility.ts` — `checkCompatibility(path: string): ProjectConfig`
- Required files:
  - `AGENT_BOOTSTRAP.md`
  - `preambles/COMMON_RULES.md`
  - At least one role preamble in `preambles/`
  - `templates/` directory exists
  - `docs/agents/orchestrator-state.md`
- Returns `{ compatible: boolean, missing: string[], projectPath, projectName }`
- `projectName` derived from folder name or `AGENT_BOOTSTRAP.md` content

### TASK-017: Project Scaffolder
- Implement `src/lib/scaffolder.ts` — `scaffoldProject(data: BootstrapFormData): ProjectConfig`
- Creates protocol directory structure:
  - `preambles/` with `COMMON_RULES.md` and role preambles
  - `templates/` directory
  - `docs/agents/startup-prompts/` with role startup prompts
  - `docs/agents/orchestrator-state.md` with initial state
  - `specs/`, `skills/` directories
  - `AGENT_BOOTSTRAP.md` populated with project name, stack, description
- Template content should be minimal but valid — enough to pass the compatibility checker
- Refuse to scaffold into a non-empty directory (return error, don't throw)

## Input Files
- Spec: `specs/feat-mvp/spec.md`
- Interfaces: `docs/interfaces.md`
- Types: `src/types/index.ts`
- Tasks: `specs/feat-mvp/tasks.md`

## Validation Criteria
- `npm run build` succeeds with zero errors
- All types compile without `any` escapes
- Watcher detects file add/change/delete within 2 seconds (write a test script)
- Parser handles valid frontmatter, missing frontmatter, and malformed frontmatter
- Index populates from a real project directory
- Compatibility checker returns correct results for a valid protocol project and for an empty folder
- Scaffolder output passes the compatibility checker
- No API routes implemented — those come in Phase 3

## Dispatch Mode
FULL — implement everything listed. Write test scripts where noted.

## Notes
- The Artifact Engine is a singleton — it will be initialized once when the server starts (Phase 3 wires that up)
- Use `EventEmitter` from Node.js for internal event plumbing
- Keep the parser simple — `gray-matter` does the heavy lifting
- The scaffolder templates can be simple placeholder content; the protocol structure matters more than the template prose
