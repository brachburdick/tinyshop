# Handoff Packet: Developer — Phase 4 Frontend

## Role
Developer

## Objective
Implement the entire frontend: app shell, Workshop Dashboard with mascots, Launch Drawer, Artifact Viewer, Decision Queue, Welcome Screen, Settings page, and SSE-powered real-time updates. After this phase, Tinyshop is a fully functional UI.

## Design Inputs
The designer has produced complete UI specifications. Read ALL THREE before writing any code:
- `specs/feat-mvp/design/ui-spec.md` — component hierarchy, color tokens, layout rules, shadcn/ui mappings
- `specs/feat-mvp/design/wireframes.md` — ASCII wireframes for every screen and state
- `specs/feat-mvp/design/interactions.md` — state transitions, animations, drawer behavior

## Tasks

### TASK-016: SSE Hook + Real-Time Frontend Updates
- Implement `src/hooks/useSSE.ts` — manages `EventSource` connection to `/api/events`
  - Auto-reconnects on disconnect (exponential backoff, max 30s)
  - Cleans up on component unmount (no memory leaks)
  - Parses SSE `data:` as JSON, dispatches by event `type`
- Implement `src/hooks/useArtifacts.ts` — client-side artifact index
  - Fetches initial state from `GET /api/artifacts`
  - Updates from SSE `artifact-changed` and `artifact-removed` events
  - Exposes `artifacts`, `getByType()`, `loading`, `error`
- These hooks are consumed by multiple components — build them first

### TASK-011: App Shell + Layout + Navigation
- Implement `src/components/AppShell.tsx` — main layout wrapper
- Implement `src/components/Navigation.tsx` — sidebar navigation
- Update `src/app/layout.tsx` and `src/app/page.tsx`
- Navigation links: Workshop (default), Artifacts, Settings
- Active route visually highlighted
- Follow the design spec for sidebar width, colors, warm workshop aesthetic
- Non-technical labels — no protocol jargon
- If no project is attached (check via `/api/settings`), redirect to Welcome Screen

### TASK-012: Workshop Dashboard — Status Cards + Mascots
- Implement `src/app/workshop/page.tsx`
- Implement `src/components/workshop/StatusBoard.tsx` — milestone + task summary
- Implement `src/components/workshop/MascotCard.tsx` — one per TINY role
- 7 mascot roles: Orchestrator, Architect, Researcher, Designer, Developer, Validator, QA Tester
- Each card shows: role label, plain-language description, status indicator (idle/launched/awaiting-output/complete)
- Next-action role is visually highlighted (fetch from `GET /api/next-action`)
- Status updates via SSE without page refresh
- Follow design spec for mascot colors, card layout, grid arrangement

### TASK-013: Launch Drawer
- Implement `src/components/workshop/LaunchDrawer.tsx`
- Triggered by clicking a mascot card; slides in from the right
- Fetches `GET /api/launch-package?role=` on open
- Displays: role description, files to load (with missing file warnings), startup prompt preview, expected output
- "Copy Command" button copies terminal command to clipboard
- "Launch" button triggers `POST /api/launch` (for now, just copy to clipboard since terminal launcher is Phase 5)
- Loading state while fetching launch package
- Close on click-outside, close button, or clicking the mascot again
- Follow design spec for drawer width, animations, transitions

### TASK-014: Decision Queue
- Implement `src/components/workshop/DecisionQueue.tsx`
- Fetches `GET /api/decisions`
- Displays `[DECISION NEEDED]` and `[ASK OPERATOR]` items as cards
- Each card: marker type badge, question text, source file name, context snippet
- Empty state: "No pending decisions" message
- Amber/yellow card styling for visual distinction

### TASK-015: Artifact Viewer
- Implement `src/app/artifacts/page.tsx`
- Implement `src/components/artifacts/ArtifactSidebar.tsx` — lists artifacts grouped by type
- Implement `src/components/artifacts/ArtifactRenderer.tsx` — markdown rendering with syntax highlighting
- Install `react-markdown`, `remark-gfm`, `rehype-highlight` if not already present
- Clicking an artifact fetches `GET /api/artifacts/:path` and renders content
- Frontmatter fields display as badges above content (status, supersedes, etc.)
- Artifact list updates in real-time via SSE
- Follow design spec for sidebar width, content area layout

### TASK-019: Welcome Screen + Setup Flow
- Implement `src/app/welcome/page.tsx`
- Implement `src/components/welcome/NewProjectForm.tsx` — form: name, stack, description, folder path
- Implement `src/components/welcome/AttachProjectPicker.tsx` — path input + attach button
- Two paths: "Start a new project" / "Open an existing project"
- New project: form → `POST /api/projects/scaffold` → auto-attach → redirect to Workshop
- Existing project: path input → `POST /api/projects/attach` → compatibility check → redirect or show missing files
- Show clear error states for incompatible projects (list missing files)
- Follow design spec for welcome screen layout, warm/inviting aesthetic

### TASK-022: Settings Page
- Implement `src/app/settings/page.tsx`
- Implement `src/components/settings/SettingsForm.tsx`
- Displays current project path
- "Change project" button returns to Welcome Screen
- Anthropic API key field (masked, for future use)
- Save confirmation on successful update
- Fetches from `GET /api/settings`, saves via `PUT /api/settings`

## Input Files
- Design: `specs/feat-mvp/design/ui-spec.md`, `specs/feat-mvp/design/wireframes.md`, `specs/feat-mvp/design/interactions.md`
- Spec: `specs/feat-mvp/spec.md`
- Interfaces: `docs/interfaces.md`
- Types: `src/types/index.ts`, `src/lib/types/index.ts`
- Tasks: `specs/feat-mvp/tasks.md`
- All API routes are implemented and available (Phase 3 complete)

## Validation Criteria
- `npm run build` succeeds with zero errors
- All pages render without console errors
- Workshop Dashboard shows mascot cards with correct role info
- Launch Drawer opens/closes with animation, displays launch package data
- Artifact Viewer renders markdown with syntax highlighting and frontmatter badges
- Welcome Screen both flows work: new project scaffold + existing project attach
- Settings page loads and saves correctly
- SSE updates cause real-time re-renders (no page refresh needed)
- No protocol jargon visible in the UI — plain language everywhere

## Dispatch Mode
FULL — implement everything listed.

## Notes
- Do NOT implement the terminal launcher (`POST /api/launch` side effect) — that's Phase 5
- The "Launch" button should copy the command to clipboard for now
- Use shadcn/ui components wherever possible — don't reinvent buttons, cards, drawers, inputs
- Follow the design spec closely for colors, spacing, and layout
- The app should feel warm and approachable — workshop aesthetic, not corporate
- Keep components focused — one component per file, clear prop interfaces
