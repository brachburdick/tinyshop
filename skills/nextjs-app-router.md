# Skill: Next.js App Router — Tinyshop

## When This Applies
Load this skill when working on any Next.js routing, API handlers, or page components in Tinyshop.

## Stack Notes
- Next.js with App Router (not Pages Router)
- React Server Components by default; `'use client'` directive for interactive components
- TypeScript strict mode
- Tailwind CSS for styling

## Common Patterns
- Pages: `app/[route]/page.tsx`
- Layouts: `app/[route]/layout.tsx`
- API routes: `app/api/[endpoint]/route.ts` with exported `GET`, `POST`, etc.
- SSE streaming: return `new Response(stream)` with `Content-Type: text/event-stream`
- Static metadata: export `metadata` object from page files

## Known Gotchas
- [TODO: Fill from project experience]
- Server Components cannot use hooks or browser APIs — mark with `'use client'` when needed
- API route handlers must export named HTTP method functions, not default exports
- `cookies()` and `headers()` are async in recent Next.js versions

## Anti-Patterns
- Using Pages Router conventions (`pages/api/`, `getServerSideProps`)
- Importing server-only modules in client components
- Using `fetch` to call your own API routes from Server Components (just call the function directly)

## SSE Pattern
```typescript
// app/api/events/route.ts
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      // Push events via controller.enqueue()
    }
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

[TODO: Fill from project experience]
