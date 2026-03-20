# Plan: feat-mvp

---
status: APPROVED
project_root: /Users/brach/Documents/THE_FACTORY/projects/Tinyshop
revision_of: none
supersedes: none
superseded_by: none
---

## Summary

Build Tinyshop MVP bottom-up: data layer first (SQLite, file watching, artifact parsing), then API routes, then frontend views. The terminal launch integration and SSE real-time updates are vertical slices that cross all layers and are built after the core CRUD paths work. The project scaffolder is a standalone utility that can be built in parallel with the dashboard work.

## Workstreams

- **WS-1: Foundation** — Next.js project setup, SQLite schema, shared types, project config. Must complete first; everything depends on it.
- **WS-2: Artifact Engine** — File watching, frontmatter parsing, in-memory index, SSE event emission. This is the core backend service.
- **WS-3: API Layer** — REST endpoints for artifacts, launch packages, decisions, next-action, settings. Consumes the Artifact Engine.
- **WS-4: Frontend — Workshop Dashboard** — Primary view with mascot roles, status display, launch drawer, decision queue. Consumes API + SSE.
- **WS-5: Frontend — Artifact Viewer** — Markdown rendering with syntax highlighting and frontmatter badges. Can be built in parallel with WS-4.
- **WS-6: Project Setup Flow** — Welcome screen, scaffolder, attach flow, compatibility check. Can be built in parallel with WS-4/WS-5 after WS-1.
- **WS-7: Terminal Launch Integration** — macOS terminal opening, command assembly, launch-then-watch flow. Vertical slice after WS-2 + WS-3 are stable.
- **WS-8: Frontend — Settings** — Minimal settings view. Low priority, built last.

## Interfaces and Contracts

- All cross-layer contracts are defined in `docs/interfaces.md` and must be created as the first task (CONTRACT_ONLY).
- SSE event shapes: `SSEEvent` union type — defined in contract, produced by Artifact Engine, consumed by frontend `EventSource` hook.
- API response shapes: each route returns a typed response matching the spec's Interface Definitions.
- Shared types (`ArtifactRecord`, `LaunchPackage`, `DecisionItem`, etc.) live in `src/types/` and are imported by both API routes and frontend components.

## Sequencing

```
Phase 1 — Foundation (sequential)
  ├── TASK-001: Next.js scaffold + dependencies
  ├── TASK-002: Shared types + interface contract
  └── TASK-003: SQLite schema + settings service

Phase 2 — Core Backend (sequential, then parallel)
  ├── TASK-004: Artifact Engine — file watcher + parser
  ├── TASK-005: Artifact Engine — in-memory index
  ├── TASK-006: SSE endpoint
  ├── TASK-007: Artifact API routes
  ├── TASK-008: Launch package assembly
  ├── TASK-009: Next-action derivation
  └── TASK-010: Decision scanner

Phase 3 — Frontend (parallel after Phase 2)
  ├── TASK-011: App shell + layout + navigation
  ├── TASK-012: Workshop Dashboard — status + mascots
  ├── TASK-013: Launch Drawer component
  ├── TASK-014: Decision Queue component
  ├── TASK-015: Artifact Viewer — sidebar + renderer
  └── TASK-016: SSE hook + real-time updates

Phase 4 — Project Setup (parallel with Phase 3)
  ├── TASK-017: Project scaffolder utility
  ├── TASK-018: Compatibility checker
  ├── TASK-019: Welcome screen + setup flow

Phase 5 — Integration (after Phases 3 + 4)
  ├── TASK-020: Terminal launch integration (macOS)
  ├── TASK-021: Launch-then-watch flow (end-to-end)
  └── TASK-022: Settings view

Phase 6 — Polish
  └── TASK-023: Edge case handling + error states
```

## Risks

- **chokidar reliability on macOS:** chokidar v3 uses FSEvents on macOS which is generally reliable, but large directories can cause performance issues. **Mitigation:** Watch only the project root with appropriate ignore patterns (node_modules, .git). Debounce aggressively.
- **Terminal launch is platform-specific:** Using AppleScript or `open -a Terminal` ties us to macOS. **Mitigation:** Isolate behind a `TerminalLauncher` interface so it can be swapped later. Accept macOS-only for MVP.
- **Frontmatter parsing edge cases:** Not all project files will have valid YAML frontmatter. **Mitigation:** Wrap `gray-matter` in a try-catch. Files that fail parsing are still indexed with `status: "parse-error"`.
- **Orchestrator state file format drift:** The orchestrator state file is semi-structured markdown, not a machine-readable format. **Mitigation:** Parse conservatively. Extract task status table and section headers. Degrade to "unknown" for unparseable sections.
- **SSE connection management:** Browser `EventSource` reconnects automatically but can accumulate stale connections. **Mitigation:** Server-side connection tracking with cleanup on disconnect.

## Validation Strategy

- **Static validation:** Validator confirms all API routes return typed responses matching `docs/interfaces.md`. Shared types are used consistently across layers. No artifact content stored in SQLite. All frontmatter parsing is wrapped in error handling.
- **QA verification:** Required for: SSE real-time updates (verify events arrive in browser within 2s of file change), terminal launch integration (verify Terminal.app opens with correct command), launch-then-watch flow (verify mascot status updates after artifact appears), project scaffolding (verify generated structure passes compatibility check).

## Open Questions

- None — all questions resolved in Feature Rationale session.
