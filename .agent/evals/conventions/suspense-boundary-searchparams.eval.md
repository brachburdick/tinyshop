# Eval: suspense-boundary-searchparams

## Should: Wrap useSearchParams in a Suspense boundary
- Input: "Add URL query parameter filtering to the artifacts page"
- Expected: Agent wraps the component using `useSearchParams()` in a `<Suspense>` boundary, or uses it within an already-wrapped component
- Fail if: Agent uses `useSearchParams()` in a client component without a Suspense boundary — this passes in dev but fails at build time with Next.js 14

## Should: Prefer server-side searchParams prop when possible
- Input: "Read the project filter from the URL on the workshop page"
- Expected: Agent considers using the page-level `searchParams` prop (server component) before reaching for the client-side hook
- Fail if: Agent defaults to useSearchParams when the page component could read params server-side
