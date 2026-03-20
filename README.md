# Tinyshop

Local web UI for THE_FACTORY agent pipeline. Browse artifacts, manage projects, launch terminal sessions, and track pipeline state — all from localhost.

Pipeline-version-agnostic: works with both v1.8 (7-role) and v1.9 (operator + skills) project structures. Version detection is automatic.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

On first launch you'll see the Welcome screen. Either:
- **Scaffold** a new project (creates the directory structure for you)
- **Attach** an existing project (point it at a directory like `projects/CRUCIBLE`)

## What It Does

### Workshop
The main dashboard. Shows entity cards (roles in v1.8, operator in v1.9) with live status indicators. A banner recommends the next entity to dispatch based on pipeline state. Click a card to open the Launch Drawer — view context files, startup prompts, and launch a terminal session.

### Artifacts
Browse all markdown files in the attached project. Files are grouped by type (specs, plans, tasks, handoffs, etc.) with YAML frontmatter badges. Types are derived from the pipeline manifest's rules, not hardcoded.

### Decisions
Surfaces `[DECISION NEEDED]`, `[ASK OPERATOR]`, and `[BLOCKED]` markers found across all artifacts. Click through to view the source file.

### Settings
Change the attached project path or configure an API key.

## Architecture

```
src/
  app/                  Next.js App Router
    api/                REST endpoints
      artifacts/        GET artifact list and individual artifacts
      decisions/        GET pending decision markers
      events/           SSE stream for real-time updates
      launch/           POST to open a terminal session
      launch-package/   GET assembled launch context for an entity
      manifest/         GET resolved pipeline manifest
      next-action/      GET recommended next entity
      projects/         POST scaffold or attach a project
      settings/         GET/PUT app settings
    artifacts/          Artifact browser page
    settings/           Settings page
    welcome/            Onboarding page
    workshop/           Workshop dashboard page
  components/           React components
  hooks/                Custom hooks (SSE, artifacts, entity statuses)
  lib/                  Core logic
    manifest.ts         Pipeline manifest loader + auto-detection
    compatibility.ts    Project structure validation
    scaffolder.ts       New project scaffolding
    launch-package.ts   Launch context assembly
    next-action.ts      Next-action derivation (markdown or JSONL)
    decision-scanner.ts Decision marker scanning
    artifact-engine/    File watcher + in-memory index + SSE bridge
  types/                Shared type definitions
```

## Pipeline Manifest

All version-specific behavior is driven by a `PipelineManifest` — entity lists, file paths, artifact type rules, decision markers, parsing config, and scaffolding templates.

**Auto-detection**: When you attach a project, Tinyshop checks for sentinel files:
- `CLAUDE.md` + `.agent/` directory → v1.9 (Operator + Skills)
- `AGENT_BOOTSTRAP.md` + `preambles/` → v1.8 (7-Role Pipeline)

**Override**: Place a `pipeline-manifest.json` in your project root to customize entities, paths, artifact types, or markers beyond the defaults.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| UI | React 18, Tailwind CSS, shadcn/ui, Lucide icons |
| Data | SQLite (better-sqlite3), chokidar file watcher |
| Real-time | Server-Sent Events (SSE) |
| Markdown | react-markdown + remark-gfm + rehype-highlight |

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build (catches type errors)
npm run start        # Start production server
npm run lint         # ESLint
```

## Data Storage

All app data is stored project-relative in a `.tinyshop/` directory (SQLite database for settings). Nothing is written to your home directory.

## Limitations

- macOS only for terminal launch (uses osascript / Terminal.app)
- Single project at a time
- Read-only artifact browsing (no editing)
- No authentication (localhost only)
