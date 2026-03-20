# Session Summary: Phase 3 — API Routes

---
status: COMPLETE
project_root: /Users/brach/Documents/THE_FACTORY/projects/Tinyshop
---

## Role
Developer

## Objective
Implement all backend API routes and the SSE event stream for the Tinyshop MVP. This includes the event bus, artifact routes, launch package assembly, next-action derivation, decision scanner, settings and project routes, and server initialization wiring for the Artifact Engine singleton.

## Status
COMPLETE

## Work Performed
- Audited all files listed in the handoff packet — found that Phase 2 had already produced stub or complete files for all required modules and routes. All libs and routes were present.
- Verified correctness of each file against the spec contracts in `docs/interfaces.md`.
- Identified a real bug in `src/app/api/events/route.ts`: the SSE disconnect cleanup was attempting to assign a `cancel` property directly onto the `ReadableStream` controller object via a type cast, which does not hook into the Web Streams API's `cancel` lifecycle. Fixed the cleanup by capturing the `send` reference in the enclosing function scope and referencing it from the `cancel()` method on the `ReadableStream` init object, which is the correct disconnect hook.
- Ran `npm run build` before and after the fix — both pass with zero errors. All 11 routes registered correctly.

## Files Changed
- `src/app/api/events/route.ts` — Fixed SSE client disconnect cleanup. Moved `send` variable to outer scope so the `ReadableStream.cancel()` hook can unsubscribe it from the EventBus. The previous implementation patched `controller.cancel` via an unsafe cast, which is not a valid Web Streams API hook.

## Artifacts Produced
- `specs/feat-mvp/sessions/developer-phase3-api-routes.md` — This session summary

## Interfaces Added or Modified
- None. All interfaces match `docs/interfaces.md` and `src/types/index.ts` exactly.

## Decisions Made
- SSE cancel fix via outer-scope variable capture: the correct place to run cleanup when a ReadableStream client disconnects is the `cancel()` callback on the `ReadableStream` initialization object — not on the controller. Capturing `send` in the enclosing scope and nulling it on unsubscribe prevents double-unsubscribe on both the error path and the disconnect path. Alternative considered: AbortSignal from `_req.signal` — rejected because ReadableStream `cancel()` is the standard idiom and avoids coupling to Next.js request internals.

## Scope Violations
- None

## Remaining Work
- None — all TASK-006 through TASK-010, Settings routes, and Project routes are implemented and building.
- POST /api/launch (terminal launcher) is intentionally excluded per handoff instructions — that is Phase 5 / TASK-020.

## Blocked On
- None

## Missteps
- None. Files were already present from prior work; the only change needed was the SSE disconnect fix.

## Learnings
- When implementing SSE with the Web Streams `ReadableStream` API in Next.js App Router route handlers, the disconnect cleanup hook is the `cancel()` method on the init object passed to `new ReadableStream({ start, cancel })` — not any property set on the `ReadableStreamDefaultController`. Patching `controller.cancel` does nothing and the subscription will leak.

## Follow-Up Items
- The `force` flag in `POST /api/projects/scaffold` currently has no effect because `scaffoldProject()` does not accept a force parameter. The route acknowledges this with an inline comment. Could be addressed in a future hardening pass.
