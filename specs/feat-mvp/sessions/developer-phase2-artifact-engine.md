# Session Summary: TASK-004 + TASK-005 + TASK-017 + TASK-018

---
status: COMPLETE
project_root: /Users/brach/Documents/THE_FACTORY/projects/Tinyshop
---

## Role
Developer

## Objective
Build the Artifact Engine (file watcher + frontmatter parser + in-memory index) and the project utility services (compatibility checker + scaffolder). Pure backend — no UI, no API routes. Forms the core data layer that all API endpoints will query.

## Status
COMPLETE

## Work Performed
- Implemented `src/lib/artifact-engine/parser.ts`: frontmatter extraction via gray-matter, ArtifactType derivation from path conventions, parse-error fallback on malformed input, "none" string treated as null for supersedes/superseded_by
- Implemented `src/lib/artifact-engine/watcher.ts`: chokidar watcher for .md files, ignores node_modules/.git/.tinyshop, 100ms debounce, typed EventEmitter interface with add/change/unlink/error/ready events, close() method
- Implemented `src/lib/artifact-engine/index.ts`: ArtifactIndex class with initial directory scan, watcher subscription, getAll()/getByType()/getByPath() query API, change/remove/ready event emission
- Implemented `src/lib/compatibility.ts`: checkCompatibility() checks for AGENT_BOOTSTRAP.md, preambles/COMMON_RULES.md, at least one role preamble, templates/ directory, docs/agents/orchestrator-state.md; derives project name from H1 or folder name
- Implemented `src/lib/scaffolder.ts`: scaffoldProject() creates full protocol directory structure, populates AGENT_BOOTSTRAP.md with form data, generates role preambles for 7 roles, refuses non-empty directories, verified by running checkCompatibility() on the output
- Fixed pre-existing issues in untracked Phase 1 files blocking `npm run build`:
  - `scripts/test-db.ts`: imported from a now-deleted path `src/lib/services/settings`; rewrote test to use `src/lib/settings.ts` API
  - `src/lib/artifact-engine/event-bus.ts`: `Set` iteration incompatible with tsconfig target; fixed with `Array.from()`
  - `src/lib/artifact-engine/watcher.ts` (pre-existing in Phase 1 files): `Map.values()` iteration; fixed with `Array.from()`; also resolved dynamic `require("path")` to static import
- Wrote test scripts in `scripts/`: test-parser.ts, test-watcher.ts, test-index.ts, test-compatibility.ts, test-scaffolder.ts

## Files Changed
- `src/lib/artifact-engine/parser.ts` — Created: frontmatter parser
- `src/lib/artifact-engine/watcher.ts` — Created: chokidar watcher
- `src/lib/artifact-engine/index.ts` — Created: in-memory artifact index
- `src/lib/compatibility.ts` — Created: compatibility checker
- `src/lib/scaffolder.ts` — Created: project scaffolder
- `scripts/test-parser.ts` — Created: parser test script
- `scripts/test-watcher.ts` — Created: watcher live test script
- `scripts/test-index.ts` — Created: index test script
- `scripts/test-compatibility.ts` — Created: compatibility checker test script
- `scripts/test-scaffolder.ts` — Created: scaffolder test script
- `scripts/test-db.ts` — Fixed: broken import from deleted path (Scope Violation — see below)
- `src/lib/artifact-engine/event-bus.ts` — Fixed: Set iteration TypeScript error (Scope Violation — see below)

## Artifacts Produced
- `specs/feat-mvp/sessions/developer-phase2-artifact-engine.md` — this session summary

## Interfaces Added or Modified
- None. All types consumed from `src/types/index.ts` and `src/lib/types/index.ts`. No interface changes.

## Decisions Made
- **Type derivation ordering**: More specific patterns (session-summary, handoff, research-*) are checked before broad path prefix checks (/specs/, /plans/) to prevent false matches. Alternative: frontmatter-only derivation — rejected because most artifacts won't have explicit artifact_type fields.
- **"none" treated as null for supersedes/superseded_by**: The spec examples show `supersedes: none` in YAML. Treating the string "none" as null prevents orphan references. Alternative: keep the string — rejected as it complicates consumer code.
- **Scaffolder uses checkCompatibility() for return value**: Rather than constructing the ProjectConfig manually, the scaffolder calls checkCompatibility() on the output directory. This provides a live cross-check that the scaffolded structure is actually valid. Alternative: return a hardcoded success object — rejected as it wouldn't catch structural bugs.
- **Initial directory scan before watcher start**: The scan happens synchronously before attaching the watcher in ArtifactIndex.start(). This means chokidar's ignoreInitial:false "add" events may fire after the scan has already indexed the files. The upsert operation is idempotent so this is harmless. Alternative: use chokidar's initial scan exclusively (ignoreInitial:false) — rejected because it introduces a race condition where start() resolves before all initial files are indexed.

## Scope Violations
- Fixed `scripts/test-db.ts`: imported from `../src/lib/services/settings` which was deleted in Phase 1's refactor. The broken import blocked `npm run build`. Rewriting it was necessary to unblock the primary deliverable. The fix rewrites the test to use the current `src/lib/settings.ts` API.
- Fixed `src/lib/artifact-engine/event-bus.ts` (Phase 1 file): `for...of` over a Set fails with the project's TypeScript target. Fixed with `Array.from()`. Necessary to unblock `npm run build`.

## Remaining Work
- None for this phase.

## Blocked On
- None.

## Missteps
- Initial type derivation ordering had broad `/specs/` check before `session-summary` check; session-summary files inside specs/ were misclassified. Fixed by reordering checks most-specific-first.
- `require("path")` dynamic import inside watcher handler compiled but was not idiomatic; replaced with top-level static import.
- Three separate TypeScript build errors hit in sequence from pre-existing untracked Phase 1 files (test-db.ts import, event-bus.ts Set iteration, watcher.ts Map.values() iteration) — each required a separate build cycle to discover.

## Learnings
- The tsconfig `include: ["**/*.ts"]` pattern includes `scripts/` in the Next.js type check. Script files must be kept type-clean or excluded via `tsconfig.json`. Consider adding `"exclude": ["scripts"]` if scripts intentionally use looser patterns.
- When chokidar v4 fires `ignoreInitial: false` "add" events, they arrive after the "ready" event resolves the Promise. An explicit pre-scan + watcher approach ensures the index is populated synchronously before any async code awaits it.

## Follow-Up Items
- Consider adding `scripts/` to tsconfig exclude if scripts grow in number or need looser typing.
- The ArtifactIndex.start() Promise resolves on "ready" but initial "add" events from chokidar (when ignoreInitial:false) arrive after ready. If the initial scan and chokidar both index files, there will be duplicate upserts — harmless but inefficient. A future optimization could use ignoreInitial:true to skip chokidar's initial scan entirely since we do our own.
