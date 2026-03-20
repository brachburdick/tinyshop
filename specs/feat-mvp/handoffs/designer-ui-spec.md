# Handoff Packet: Designer — UI Spec for MVP

## Role
Designer

## Objective
Produce UI specifications (wireframes, component hierarchy, layout rules, interaction patterns) for the 4 designer-dependent tasks. Output should be detailed enough for a Developer to implement without further design input.

## Tasks Covered
- **TASK-011:** App Shell + Layout + Navigation
- **TASK-012:** Workshop Dashboard — status cards + mascot grid
- **TASK-013:** Launch Drawer component (mascot click → drawer with launch package + "Launch" button)
- **TASK-019:** Welcome Screen + Setup Flow (project folder picker + simple scaffold form)

## Key Context

### Users
- **Non-technical.** No protocol jargon. Plain language throughout. Inline tooltips or help text where concepts need explaining.

### Design Constraints
- **Tech stack:** Next.js 14 (App Router), Tailwind CSS, shadcn/ui components
- **Platform:** Desktop only (macOS primary, cross-platform secondary)
- **Theme:** Warm, workshop/craftsman aesthetic. The TINY mascots are central characters.
- **Single mode:** No Guided/Ops toggle. One approachable mode for everyone.

### TINY Mascots (5 roles)
Each mascot represents a protocol agent role. Clicking a mascot opens a Launch Drawer.

| Mascot | Role | Color/Vibe |
|--------|------|------------|
| Architect | Specs, plans, task breakdowns | Blueprint blue |
| Developer | Code implementation | Hammer/tool orange |
| Validator | Quality checks | Magnifying glass green |
| QA Tester | Integration testing | Bug-net purple |
| Orchestrator | Pipeline coordination | Conductor gold |

### Interaction: Mascot → Launch Drawer
1. User clicks a mascot on the Workshop Dashboard
2. Drawer slides out showing that role's launch package (plain-language summary of what the agent does, files it needs, startup prompt)
3. "Launch" button opens the user's terminal with the command pre-filled
4. Mascot updates status when output artifacts are detected (idle → working → done)
5. Click mascot again to dismiss drawer

### Workshop Dashboard States
- **Empty state:** No project attached yet → nudge to Welcome Screen
- **Bootstrap in progress:** Show which artifacts exist, which are pending
- **Ready for work:** All mascots available, next-action card visible
- **Active session:** One or more mascots show "working" state

### Welcome Screen Flow
1. Choose: "Open existing project" or "Start new project"
2. Existing → folder picker → compatibility check → attach
3. New → folder picker → simple form (project name, tech stack, description) → scaffold → attach

## Input Files
- Spec: `specs/feat-mvp/spec.md`
- Tasks: `specs/feat-mvp/tasks.md`
- Interfaces: `specs/feat-mvp/interfaces.md`

## Expected Output
- `specs/feat-mvp/design/ui-spec.md` — component hierarchy, layout rules, responsive behavior
- `specs/feat-mvp/design/wireframes.md` — ASCII or descriptive wireframes for each screen/state
- `specs/feat-mvp/design/interactions.md` — state transitions, animations, drawer behavior

## Dispatch Mode
FULL — produce complete design artifacts, no code.
