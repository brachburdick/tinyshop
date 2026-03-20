# Tinyshop — Project CLAUDE.md

## What Is This
Pipeline-agnostic local web UI for THE_FACTORY. Browse artifacts, manage projects,
launch terminal sessions, view settings. Supports both v1.8 (7-role) and v1.9
(operator + skills) pipeline structures via a manifest-driven architecture.
Not deployed — runs on localhost only.

## Stack
- **Framework:** Next.js 14 (App Router, `src/` directory)
- **Language:** TypeScript (strict)
- **UI:** React 18, Tailwind CSS 3, shadcn/ui (Base UI), Lucide icons
- **Data:** better-sqlite3 (local `.tinyshop/` dir), chokidar file watcher
- **Rendering:** Markdown via react-markdown + remark-gfm + rehype-highlight

## Build & Run
```bash
npm run dev          # local dev server
npm run build        # production build (catches type errors)
npm run lint         # ESLint
```

## Architecture
```
src/
  app/               # Next.js App Router pages + API routes
    api/              # REST: artifacts, settings, launch, projects, events (SSE), manifest
  components/         # React components (ui/, settings/, workshop/, artifacts/, welcome/)
  hooks/              # Custom React hooks
  lib/                # Core logic
    manifest.ts       # Pipeline manifest loader (auto-detect v1.8/v1.9, caching)
    types/manifest.ts # PipelineManifest type definitions
    engine/           # Artifact indexing engine (chokidar-based)
  types/              # Top-level type declarations
```

## Key Patterns
- **Pipeline manifest**: All version-specific behavior (roles, paths, artifact types,
  markers, parsing rules) is derived from a PipelineManifest — never hardcoded. Auto-
  detects v1.8 vs v1.9 from sentinel files; can be overridden with pipeline-manifest.json.
- SSE for real-time events via `/api/events` route
- Artifact engine uses chokidar watcher + in-memory index
- All data stored project-relative in `.tinyshop/` (not home dir)
- API routes return JSON; no tRPC or GraphQL

## Trigger Table
| Task Pattern | Skill | Notes |
|---|---|---|
| Anthropic SDK / Claude API / streaming | skills/anthropic-sdk.md | SDK usage, system prompt, history |
| Contract integrity / SSE events / API shapes | skills/contract-integrity.md | PRODUCER/CONSUMER, field preservation |
| Next.js routing / API routes / App Router / RSC | skills/nextjs-app-router.md | Server vs client, SSE streaming |

## Flow Skills
Flow skills (spec, plan, implement, test, verify gates) are inherited from the
portfolio level (`skills/`). No project-specific flow modifications needed.

## Gotchas

### Manifest cache must be cleared on project-path change
`clearManifestCache()` is called in singleton.ts when the project path changes.
If you add new code that reads the manifest and caches derived state, ensure it
also invalidates when the project path changes.

### chokidar initial scan is async — do your own pre-scan
`ignoreInitial: false` fires "add" events after "ready" resolves. If you need the
index populated synchronously after `start()`, do an explicit directory scan first.
The watcher handles duplicates idempotently via upsert.

### useSearchParams() needs a Suspense boundary at build time
Any client component calling `useSearchParams()` must be wrapped in `<Suspense>`.
Next.js 14 enforces this during static prerender — fails at build, not runtime.

### SSE cleanup goes on ReadableStream init, not controller
Use `new ReadableStream({ start(ctrl) {...}, cancel() { cleanup() } })`.
Patching `controller.cancel` does nothing — subscriptions leak silently.

### Two-layer escaping for osascript terminal launch
Commands pass through AppleScript string escaping then shell single-quote escaping.
Apply innermost context first: backslash double-quotes, then break/re-enter singles.

### Superseded files cause silent data splits
When moving a module to a new path, delete the old file in the same PR. Two
implementations at different paths silently split data.
