# Handoff Packet: Developer — Phase 5 Integration + Polish

## Role
Developer

## Objective
Implement the terminal launch integration, the launch-then-watch completion flow, and edge case handling across all layers. After this phase, the MVP is feature-complete.

## Tasks

### TASK-020: Terminal Launch Integration (macOS)
- Implement `src/lib/terminal-launcher.ts` — `launchTerminal(command: string): Promise<boolean>`
- Implement `src/app/api/launch/route.ts` — `POST /api/launch` with body `{ role: string }`
- Uses `osascript` (AppleScript) to open Terminal.app with the command pre-filled
- Falls back to `open -a Terminal` if AppleScript fails
- The command comes from the LaunchPackage's `terminalCommand` field
- On success, update the role's status to "launched" (emit SSE `status-update` event)
- Returns `{ success: boolean }`
- macOS only — no cross-platform support needed

### TASK-021: Launch-Then-Watch Completion Flow
- Implement `src/lib/artifact-engine/completion-tracker.ts`
- When `POST /api/launch` succeeds, register the expected output path from the LaunchPackage
- The Artifact Engine watcher already detects file changes — hook into it:
  - When the expected output file appears or is modified, emit `status-update` SSE event with `status: "complete"`
  - Re-derive the next action and push an update
- If the expected output already exists when Launch is clicked, watch for modification (not just creation)
- Track active watches in memory (singleton, cleared on server restart)
- Update the Launch Drawer's mascot card status in real-time via SSE

### TASK-023: Edge Case Handling + Error States
- Audit and ensure graceful handling across all layers:
  - **Malformed frontmatter:** artifact renders with "parse-error" badge, raw content shown (verify parser already does this)
  - **Missing orchestrator state:** "Unable to determine next action" message, no crash (verify next-action already handles this)
  - **Project folder deleted while running:** chokidar error → show "Project folder not found" message, prompt re-attachment
  - **Non-protocol folder attached:** compatibility check shows missing files, read-only browsing still works
  - **Scaffold into non-empty folder:** warning/error returned, don't overwrite
  - **All API routes:** return appropriate error responses (4xx/5xx) with message body
  - **All frontend views:** have loading states and error states
  - **SSE disconnect:** frontend reconnects automatically (verify useSSE hook handles this)
- Add React error boundary at the app shell level
- Add loading skeletons for Workshop Dashboard, Artifact Viewer, and Launch Drawer

## Input Files
- Spec: `specs/feat-mvp/spec.md` (edge cases section)
- Tasks: `specs/feat-mvp/tasks.md` (TASK-020, 021, 023 acceptance criteria)
- Design: `specs/feat-mvp/design/interactions.md` (error state designs)
- All existing source code from Phases 1-4

## Validation Criteria
- `npm run build` succeeds with zero errors
- `POST /api/launch` opens Terminal.app with the correct command on macOS
- After launch, mascot status updates to "launched" via SSE
- When expected output artifact appears on disk, mascot status updates to "complete" via SSE
- Next-action re-derives after completion
- Error boundary catches and displays component errors gracefully
- Loading states visible during data fetches
- All edge cases from the spec are handled without crashes

## Dispatch Mode
FULL — implement everything listed.

## Notes
- The terminal launcher uses `child_process.execFile` to run `osascript` — this is a server-side operation
- The completion tracker is stateful (in-memory) — it resets on server restart, which is acceptable for MVP
- For TASK-023, much of the edge case handling may already exist from prior phases. Audit first, then fill gaps. Don't duplicate work.
- After this phase, the app is feature-complete and ready for QA
