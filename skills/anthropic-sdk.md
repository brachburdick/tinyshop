# Skill: Anthropic SDK — Tinyshop

## When This Applies
Load this skill when working on the TINY Shopkeeper agent — the only LLM-powered component in V1.

## Stack Notes
- `@anthropic-ai/sdk` (TypeScript/Node.js)
- Used server-side only (Next.js API route handler)
- Requires `ANTHROPIC_API_KEY` environment variable
- TINY Shopkeeper is purely conversational — no tool use in V1

## Common Patterns
- Streaming responses via `client.messages.stream()`
- System prompt defines the Shopkeeper's personality and protocol knowledge
- Conversation history persisted to SQLite for session resumability
- Messages follow the Anthropic `role: 'user' | 'assistant'` format

## Known Gotchas
- [TODO: Fill from project experience]
- API key must never be committed to source control — use `.env.local`
- Streaming requires careful error handling — the stream can close unexpectedly
- Token limits: be mindful of conversation history length when loading from SQLite

## Anti-Patterns
- Exposing the API key to the frontend
- Using the Anthropic SDK for anything other than the TINY Shopkeeper in V1
- Giving the Shopkeeper tool-use capabilities (V1 is conversational only)
- Storing the full conversation in memory instead of SQLite

[TODO: Fill from project experience]
