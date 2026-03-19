# Skill: Contract Integrity — Tinyshop

## When This Applies
Load this skill when working on tasks tagged with `Interface Scope: PRODUCER` or `CONSUMER`. It applies to any work touching SSE event payloads, API route request/response shapes, or shared TypeScript type definitions.

## Stack Notes
- **Types:** TypeScript interfaces and type aliases in shared type files
- **SSE payloads:** JSON-serialized objects pushed from Next.js API route handlers to the frontend via `EventSource`
- **API routes:** Next.js App Router route handlers (`app/api/*/route.ts`)
- **Database:** SQLite via `better-sqlite3` — stores indexes and settings, NOT canonical artifacts

## Common Patterns
- Define contracts in `docs/interfaces.md` first (CONTRACT_ONLY task)
- Producer (backend) and Consumer (frontend) tasks reference the completed contract
- SSE events use a `type` discriminator field — every event shape must be in the union type
- API responses follow a consistent envelope shape

## Known Gotchas
- [TODO: Fill from project experience]
- SSE `data:` field must be a single line of JSON — no pretty-printing
- `better-sqlite3` is synchronous — do not mix with async patterns expecting callbacks
- `chokidar` file watch events may fire multiple times for a single save — debounce

## Anti-Patterns
- Adding a field to the producer without updating the consumer type
- Adding a field to the consumer type without verifying the producer emits it
- Storing artifact content in SQLite instead of reading from disk
- Defining types inline instead of in the shared type file

## Field Preservation Checklist
When modifying any contract:
1. Read the field inventory in `docs/interfaces.md`
2. Verify every existing field is still emitted by the producer after your change
3. Verify every existing field is still consumed by the consumer after your change
4. Update the field inventory with any additions or removals
5. Update or create test fixtures in `tests/fixtures/`
