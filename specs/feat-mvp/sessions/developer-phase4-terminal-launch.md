# Session Summary: TASK-020, TASK-021

---
status: COMPLETE
project_root: /Users/brach/Documents/THE_FACTORY/projects/Tinyshop
---

## Role
Developer

## Objective
Implement Phase 3 backend tasks:
- TASK-020: Terminal launch integration (macOS) — `POST /api/launch` opens Terminal.app with the assembled Claude command using osascript, falls back to `open -a Terminal`, emits `status-update` launched event.
- TASK-021: Launch-then-watch completion flow — `CompletionTracker` singleton registers the expected output path after launch, listens for ArtifactIndex change events, and emits `status-update` complete event when the watched file appears or is modified.

## Status
COMPLETE

## Work Performed
- Implemented `src/lib/terminal-launcher.ts`: `launchTerminal(command)` escapes the command for AppleScript double-quoted string literals (backslashes then double-quotes), runs `osascript -e 'tell application "Terminal" to do script "..."'`, falls back to `open -a Terminal` on failure.
- Implemented `src/app/api/launch/route.ts`: `POST /api/launch { role }` — assembles launch package, registers expectedOutput watch, broadcasts `status-update launched`, opens terminal, returns `{ success: boolean }`. Returns 404 if startup prompt missing or no project attached.
- Implemented `src/lib/artifact-engine/completion-tracker.ts`: `CompletionTracker` singleton with `watch(role, expectedOutput, projectPath)`. Records existing mtime if the file already exists (re-run guard). Subscribes lazily to `ArtifactIndex` "change" events via `getArtifactIndex()`. On match, broadcasts `status-update complete` and removes the watch entry.
- Ran `npm run build` — clean, no errors or type failures.

## Files Changed
- `src/lib/terminal-launcher.ts` — new file: macOS terminal launch via osascript with fallback
- `src/app/api/launch/route.ts` — new file: POST /api/launch integration route
- `src/lib/artifact-engine/completion-tracker.ts` — new file: singleton completion watcher

## Artifacts Produced
- `specs/feat-mvp/sessions/developer-phase4-terminal-launch.md` — this session summary

## Interfaces Added or Modified
- `POST /api/launch` — new route. Body: `{ role: string }`. Response: `{ success: boolean }`. Errors: 400 (missing role), 404 (no project or missing startup prompt), 500 (terminal open failed). Shape matches `docs/interfaces.md`.
- No changes to existing interfaces or types.

## Decisions Made
- **AppleScript single-quote shell escaping**: The osascript command is wrapped in single quotes for the shell. The AppleScript string literal uses double quotes. I escape the user command for the AppleScript layer (backslash, then double-quote) and escape the resulting AppleScript source for the shell single-quote context using `replace(/'/g, "'\\''")`. This handles the two distinct quoting layers correctly.
- **Lazy subscription in CompletionTracker**: `ensureSubscribed()` is called on first `watch()` rather than at module load, because `getArtifactIndex()` is async and depends on settings/DB being ready. Subsequent calls are no-ops via the `subscribed` flag.
- **Re-run guard via mtime**: The spec requires that if the expected output already exists when Launch is clicked, the tracker watches for modification rather than first creation. Storing the mtime at `watch()` time and comparing against `record.lastModified` satisfies this without requiring a separate file-exists branch.
- **Non-blocking terminal failure**: If `launchTerminal()` fails, the function has already emitted `status-update launched` and registered the CompletionTracker watch. The route returns `{ success: false, error }` with status 500 so the frontend can surface the error, but the watch remains active in case the user launches manually.
- **path normalisation in handleArtifactChange**: Strip leading slashes from both paths before comparing, since `expectedOutput` from a startup prompt might have a leading `/` or might not, and ArtifactIndex stores relative paths without a leading slash.

## Scope Violations
- None

## Remaining Work
- None (TASK-020 and TASK-021 are fully implemented)

## Blocked On
- None

## Missteps
- None

## Learnings
- osascript AppleScript injection requires two independent escaping passes: the AppleScript string context (double-quotes) and the shell single-quote wrapping. Getting the order wrong silently drops parts of the command.
- `ArtifactIndex` emits a single `"change"` event for both add and update paths (watcher events "add" and "change" both call `upsert()` which calls `emit("change")`). The CompletionTracker only needs to subscribe to `"change"` — no separate "add" listener needed.

## Follow-Up Items
- TASK-021 AC mentions "mascot card updates to complete state without page refresh" — this depends on the frontend SSE hook (TASK-016) and MascotCard component (TASK-012) which are frontend tasks not yet started.
- Cross-platform terminal launch (Windows/Linux) is deferred per spec constraints section.
