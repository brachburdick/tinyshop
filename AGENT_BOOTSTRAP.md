# Tinyshop

A local web UI for THE_FACTORY multi-agent development pipeline — makes the artifact-driven workflow visible and approachable without replacing the underlying protocol.

## Quick Reference
- **Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS, SSE, chokidar, SQLite (better-sqlite3), Anthropic SDK
- **Current milestone:** feat-mvp
- **Active spec:** `specs/feat-mvp/spec.md`
- **Active tasks:** `specs/feat-mvp/tasks.md`

## Your Role Setup
1. Read this file first.
2. Read `preambles/COMMON_RULES.md`.
3. Read your role-specific preamble from `preambles/[ROLE].md`.
4. Read any skill files referenced in your handoff packet.

## Project Layout
- `docs/` — Architecture, constraints, decisions, glossary
- `docs/interfaces.md` — Canonical cross-layer contracts (SSE payloads, API routes, WebSocket shapes)
- `docs/agents/` — Orchestrator state, startup prompts
- `specs/` — Feature specs, plans, tasks, session logs
- `skills/` — Domain knowledge files
- `templates/` — Artifact schemas (use these for all outputs)
- `preambles/` — Agent role preambles
- `src/` — Source code (Next.js app)
- `.tinyshop/` — App-level config (not per-project)

## Key Concepts
- **TINY prefix:** In-app mascots use the TINY prefix (TINY Shopkeeper, TINY Orchestrator) to distinguish from protocol roles (Orchestrator, Architect, etc.)
- **V1 is watcher-first:** Tinyshop prepares launch packages and monitors artifacts. It does NOT spawn Claude Code sessions.
- **Filesystem is source of truth:** SQLite stores settings and lightweight indexes only. All artifacts live on disk.
- **TINY Shopkeeper:** The only LLM-powered agent in V1 — uses Anthropic API directly for bootstrap Q&A.

## Top 3 Things Agents Get Wrong in This Project
1. **Trying to build runtime/session spawning too early.** V1 is watcher-first. Prepare launch packages and monitor artifact outcomes — do not attempt live Claude session execution.
2. **Storing canonical artifact content in SQLite.** SQLite stores settings and lightweight indexes only. The filesystem is the source of truth for all artifacts.
3. **Assuming every project is perfectly machine-parseable.** Tinyshop must support graceful fallback when projects drift from expected structure instead of silently guessing.
