# Learnings — Tinyshop

Append-only log of non-obvious discoveries, bugs, and corrections.
When something bites you, add it here so the next session doesn't repeat the mistake.

**Format:**
```
### Short title
Date: YYYY-MM-DD
Context: What were you doing?
Problem: What went wrong or was surprising?
Fix/Pattern: What's the correct approach?
Prevention: How to avoid in the future?
```

---

## Node / TypeScript

### `node -e "require('pkg')"` is unreliable for checking installed packages
Date: 2026-03-20
Context: Phase 1 foundation — verifying whether npm dependencies were installed.
Problem: The pattern `node -e "require('pkg')" && echo "ok" || echo "MISSING"` is misleading. The error message prints to stderr before the `||` branch fires, making it look like the package was found when it was not.
Fix/Pattern: Check `ls node_modules/pkg/index.d.ts` or inspect `package.json` dependencies directly.
Prevention: Never rely on `node -e require()` in shell one-liners for presence checks.

### tsconfig `include: ["**/*.ts"]` pulls in scripts/ directory
Date: 2026-03-20
Context: Phase 2 artifact engine — `npm run build` failures from files in `scripts/`.
Problem: The default tsconfig `include` pattern includes everything, so test/utility scripts under `scripts/` are type-checked by the Next.js build. Any type error in a script blocks the entire build.
Fix/Pattern: Add `"exclude": ["scripts"]` to tsconfig.json, or keep scripts type-clean.
Prevention: When adding ad-hoc scripts, remember they are part of the type-checked compilation unless explicitly excluded.

### TypeScript `for...of` on Set/Map.values() fails with certain tsconfig targets
Date: 2026-03-20
Context: Phase 2 — pre-existing files used `for (const x of mySet)` and `for (const v of map.values())`.
Problem: Depending on the tsconfig `target` and `lib` settings, iterating over `Set` or `Map.values()` with `for...of` produces a TypeScript error about missing iterator protocol.
Fix/Pattern: Wrap in `Array.from()`: `for (const x of Array.from(mySet))`.
Prevention: Default to `Array.from()` when iterating Sets and Maps in projects with strict/older tsconfig targets.

### JSX text nodes do NOT interpret JS Unicode escapes
Date: 2026-03-20
Context: Phase 4 frontend — SettingsForm displayed literal `\u2713` instead of a checkmark.
Problem: Writing `\u2713` as JSX text content renders the literal characters `\u2713`, not the Unicode checkmark. JS Unicode escapes only work inside JS string literals, not in JSX text nodes.
Fix/Pattern: Use HTML entities (`&#x2713;`), actual Unicode characters, or JS expressions (`{'\u2713'}`).
Prevention: When putting special characters in JSX, use HTML entities or wrap in curly braces.

---

## Next.js App Router

### useSearchParams() requires a Suspense boundary at build time
Date: 2026-03-20
Context: Phase 4 frontend — `/artifacts` page failed during `npm run build` prerendering.
Problem: Any client component that calls `useSearchParams()` must be wrapped in a `<Suspense>` boundary. Without it, the Next.js 14 static prerender fails with a build error. This is enforced at build time, not just runtime.
Fix/Pattern: Wrap the component (or a parent) in `<Suspense fallback={...}>`.
Prevention: Any time you use `useSearchParams()`, add a Suspense boundary immediately.

### SSE disconnect cleanup uses ReadableStream cancel(), not controller.cancel
Date: 2026-03-20
Context: Phase 3 API routes — SSE event stream was leaking subscriptions on client disconnect.
Problem: Patching `controller.cancel` on a `ReadableStreamDefaultController` does nothing. The controller object does not have a user-assignable `cancel` hook in the Web Streams API. Subscriptions leak because cleanup never runs.
Fix/Pattern: Use the `cancel()` method on the `ReadableStream` init object: `new ReadableStream({ start(ctrl) {...}, cancel() { cleanup() } })`. Capture references in the enclosing scope so `cancel()` can access them.
Prevention: For SSE in Next.js App Router route handlers, always wire cleanup through the ReadableStream init's `cancel()`, never through the controller.

---

## Chokidar / File Watching

### Chokidar ignoreInitial:false "add" events arrive after "ready"
Date: 2026-03-20
Context: Phase 2 — ArtifactIndex needed a fully populated index before returning from `start()`.
Problem: When using `ignoreInitial: false`, chokidar's initial "add" events for existing files fire asynchronously and arrive after the "ready" event resolves. Code that awaits "ready" and then queries the index may find it empty.
Fix/Pattern: Do an explicit synchronous directory scan before attaching the watcher. The watcher's duplicate "add" events are handled idempotently via upsert. Alternatively, use `ignoreInitial: true` and rely solely on the manual scan.
Prevention: Never depend on chokidar's initial scan for synchronous index population. Always do your own pre-scan if you need data available immediately after start().

---

## macOS / AppleScript

### osascript command injection requires two escaping passes
Date: 2026-03-20
Context: Phase 4 — terminal launcher using `osascript` to open Terminal.app with a command.
Problem: The command string passes through two layers: (1) the AppleScript double-quoted string literal, and (2) the shell single-quote wrapping around the osascript `-e` argument. Getting the escape order wrong silently drops parts of the command or produces syntax errors.
Fix/Pattern: First escape for AppleScript (backslash double-quotes), then escape the result for shell single-quotes (`replace(/'/g, "'\\''")` to break out and re-enter single quotes).
Prevention: When building osascript commands, always think about both escaping layers independently and apply them in order: innermost context first.

---

## TypeScript EventEmitter Patterns

### Typed EventEmitter overloads require generic fallback for unlisted events
Date: 2026-03-20
Context: Phase 5 — wiring ArtifactIndex error events to EventBus in singleton.ts.
Problem: The codebase uses typed `EventEmitter.on()` overloads (overload 1 for known event names with typed signatures, overload 2 for generic string events). The generic overload requires `(...args: unknown[]) => void`. You cannot directly type the parameters when using the generic string overload.
Fix/Pattern: Use the generic overload and cast `args[0]` inside the listener body.
Prevention: When adding listeners for events not in the typed enum, expect to use the generic overload and cast internally.

---

## Project / Process

### shadcn init auto-generates component files
Date: 2026-03-20
Context: QA phase 1 — found unexpected `button.tsx` in components directory.
Problem: `npx shadcn@latest init` generates `src/components/ui/button.tsx` automatically. This can look like a scope violation if the task specifies "no UI components yet."
Fix/Pattern: Document that shadcn init produces stub files as scaffolding side effects.
Prevention: If a phase explicitly prohibits UI work, either skip shadcn init or note in the handoff that generated stubs are acceptable.

### Handoff references to non-existent canonical paths cause confusion
Date: 2026-03-20
Context: QA phase 1 — handoff referenced `specs/feat-mvp/interfaces.md` which did not exist.
Problem: The handoff template referenced a spec-local interfaces file, but the canonical source was at `docs/interfaces.md`. QA flagged this as a potential missing deliverable.
Fix/Pattern: Always reference the canonical path in handoffs. If a spec-local copy is desired, create it as a pointer/symlink.
Prevention: Audit handoff templates for path references and verify they resolve to real files.

### Superseded service files left behind cause import confusion
Date: 2026-03-20
Context: Phase 1/2 — old `src/lib/services/db.ts` and `src/lib/services/settings.ts` coexisted with new `src/lib/db.ts` and `src/lib/settings.ts`.
Problem: Two implementations of the same service at different paths. Scripts importing the old path broke when the old implementation was refactored but not deleted. The old files used `~/.tinyshop/` while the new ones used `.tinyshop/` (project-relative), creating silent data split.
Fix/Pattern: When replacing a module, delete or redirect the old file in the same phase. Do not leave two competing implementations.
Prevention: Include "remove superseded files" as an explicit task when refactoring module locations.
