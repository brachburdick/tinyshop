# Handoff Packet: Developer — Phase 1 Foundation

## Role
Developer

## Objective
Set up the project scaffold, define the shared type system, and implement the SQLite persistence layer. These 3 tasks have zero designer dependency and form the foundation all later work builds on.

## Tasks

### TASK-001: Next.js Scaffold + Dependencies
- Initialize Next.js 14 project with App Router
- Install and configure: Tailwind CSS, shadcn/ui, better-sqlite3, chokidar
- Set up project structure:
  ```
  src/
    app/           # Next.js App Router pages
    components/    # React components
    lib/           # Shared utilities
      engine/      # Artifact Engine (Phase 2)
      services/    # Business logic services
      types/       # Shared TypeScript types
    api/           # API route handlers
  ```
- Configure TypeScript strict mode
- Add basic dev scripts to package.json

### TASK-002: Shared Types + Interface Contract (CONTRACT_ONLY)
- Implement all TypeScript interfaces from `specs/feat-mvp/interfaces.md`
- This is CONTRACT_ONLY — define types, don't implement logic
- Types go in `src/lib/types/`
- Key interfaces: ProjectConfig, ArtifactRecord, LaunchPackage, DecisionCard, MascotState, BootstrapFormData

### TASK-003: SQLite Schema + Settings Service
- Create SQLite database schema:
  - `projects` table (id, name, path, stack, description, created_at, updated_at)
  - `settings` table (key, value, updated_at)
  - `artifact_cache` table (id, project_id, file_path, artifact_type, parsed_data, last_modified, hash)
- Implement SettingsService:
  - `getProjectPath(): string | null`
  - `setProjectPath(path: string): void`
  - `getSetting(key: string): string | null`
  - `setSetting(key: string, value: string): void`
- Database file location: `~/.tinyshop/tinyshop.db`
- Use better-sqlite3 (synchronous, no async complexity)

## Input Files
- Spec: `specs/feat-mvp/spec.md`
- Interfaces: `specs/feat-mvp/interfaces.md`
- Tasks: `specs/feat-mvp/tasks.md`

## Validation Criteria
- `npm run build` succeeds with zero errors
- All types compile without `any` escapes
- SQLite database creates on first run
- SettingsService CRUD operations work (write a simple test or demo script)
- Project structure matches the layout above

## Dispatch Mode
FULL — implement everything listed. Write tests where noted.

## Notes
- Do NOT implement API routes, UI components, or the Artifact Engine — those come in later phases
- The shared types in TASK-002 are the contract other phases build against. Get them right.
- Keep dependencies minimal. Don't add anything not listed unless strictly necessary.
