# Wireframes: feat-mvp

---
status: APPROVED
project_root: /Users/brach/Documents/THE_FACTORY/projects/Tinyshop
revision_of: none
supersedes: none
superseded_by: none
---

All wireframes represent desktop layouts at 1024px minimum width. These show spatial relationships and content hierarchy. See `ui-spec.md` for exact colors, typography, spacing, and shadcn component mappings.

Legend:
- `░░░` = skeleton/loading shimmer placeholder
- `▌` = left accent border
- `●` = status dot
- `◉` = highlighted/active status dot
- `▸` = collapsed section indicator
- `▾` = expanded section indicator

---

## 1. Welcome Screen (No Project Attached)

The Welcome Screen replaces the full app shell — no sidebar, no navigation.

### 1A. Default State — Two Options

```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│                                                               │
│                                                               │
│                        tinyshop                               │
│                   Your project workshop                       │
│                                                               │
│                                                               │
│            ┌──────────────────┐  ┌──────────────────┐         │
│            │                  │  │                  │         │
│            │   ✨ Start a     │  │   📂 Open an    │         │
│            │   new project    │  │   existing       │         │
│            │                  │  │   project        │         │
│            │  Set up a fresh  │  │  Connect to a    │         │
│            │  project from    │  │  project you     │         │
│            │  scratch         │  │  already have    │         │
│            │                  │  │                  │         │
│            └──────────────────┘  └──────────────────┘         │
│                                                               │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

Both cards: equal visual weight, same border and shadow. Cursor pointer on hover — subtle shadow lift.

---

### 1B. "Start a New Project" Expanded

```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│                        tinyshop                               │
│                   Your project workshop                       │
│                                                               │
│   ┌──────────────────┐          ┌──────────────────┐           │
│   │ ✨ Start a new   │ (active  │ 📂 Open an       │ (dim,    │
│   │ project          │  border) │ existing project │  50% op) │
│   └──────────────────┘          └──────────────────┘           │
│                                                               │
│   ┌─────────────────────────────────────────────────┐          │
│   │                                                 │          │
│   │  Project name                                   │          │
│   │  [_____________________________________________] │          │
│   │                                                 │          │
│   │  Tech stack                                     │          │
│   │  [_____________________________________________] │          │
│   │  e.g., Next.js + Python                         │          │
│   │                                                 │          │
│   │  What are you building?                         │          │
│   │  [_____________________________________________] │          │
│   │  [_____________________________________________] │          │
│   │  [_____________________________________________] │          │
│   │                                                 │          │
│   │  Where should we create it?                     │          │
│   │  [/Users/you/projects/myapp__________________]  │          │
│   │  Paste a full folder path                       │          │
│   │                                                 │          │
│   │                      [ 🔨 Create Project ]      │          │
│   │                                                 │          │
│   └─────────────────────────────────────────────────┘          │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

Form slides in from below the cards over 200ms. Active card has `ts-accent` border. "Create Project" button: `ts-accent` background, white text.

---

### 1C. New Project — Non-Empty Folder Warning (Inline Confirmation)

```
│   │                      [ 🔨 Create Project ]      │
│   │                                                 │
│   │  ┌─────────────────────────────────────────┐   │
│   │  │ ⚠️  This folder already contains files. │   │
│   │  │ Proceed anyway?                          │   │
│   │  │                                         │   │
│   │  │   [ Cancel ]      [ Create Anyway ]     │   │
│   │  └─────────────────────────────────────────┘   │
```

Inline `Alert` variant below the submit button. "Create Anyway" replaces the submit action; "Cancel" dismisses the alert.

---

### 1D. "Open Existing Project" — Path Input

```
┌───────────────────────────────────────────────────────────────┐
│                        tinyshop                               │
│                   Your project workshop                       │
│                                                               │
│   ┌──────────────────┐          ┌──────────────────┐           │
│   │ ✨ Start a new   │ (dim)    │ 📂 Open an       │ (active) │
│   │ project          │          │ existing project  │          │
│   └──────────────────┘          └──────────────────┘           │
│                                                               │
│   ┌─────────────────────────────────────────────────┐          │
│   │                                                 │          │
│   │  Project folder path                            │          │
│   │  [/Users/you/projects/my-factory-proj_________] │          │
│   │                                                 │          │
│   │                     [ 📂 Open Project ]         │          │
│   │                                                 │          │
│   └─────────────────────────────────────────────────┘          │
└───────────────────────────────────────────────────────────────┘
```

---

### 1E. "Open Existing Project" — Incompatible Result

```
│   ┌─────────────────────────────────────────────────┐
│   │                                                 │
│   │  Project folder path                            │
│   │  [/Users/you/some-random-folder_______________] │
│   │                                                 │
│   │                     [ 📂 Open Project ]         │
│   │                                                 │
│   │  ┌───────────────────────────────────────────┐  │
│   │  │ ⚠️  This folder is missing some files     │  │
│   │  │                                           │  │
│   │  │  ✗  AGENT_BOOTSTRAP.md                   │  │
│   │  │  ✗  preambles/COMMON_RULES.md            │  │
│   │  │  ✓  templates/                           │  │
│   │  │  ✗  docs/agents/orchestrator-state.md    │  │
│   │  │                                           │  │
│   │  │  You can still browse files, but          │  │
│   │  │  workflow features won't be available.    │  │
│   │  │                                           │  │
│   │  │              [ Open Anyway ]              │  │
│   │  └───────────────────────────────────────────┘  │
│   │                                                 │
│   └─────────────────────────────────────────────────┘
```

Compatible files get a green ✓; missing files get a red ✗. "Open Anyway" is a ghost button that attaches the folder in read-only/degraded mode.

---

### 1F. Submitting State (Either Form)

```
│                     [ ⏳ Creating…  ]       ← spinner + disabled
```
or
```
│                     [ ⏳ Checking…  ]       ← spinner + disabled
```

Button shows loading text + spinner animation. Input fields remain visible but non-interactive.

---

## 2. Workshop Dashboard

The Workshop Dashboard lives inside the full app shell (sidebar + main content).

### 2A. Ready for Work — All Idle, One Recommended

```
┌──────────┬──────────────────────────────────────────────────────┐
│          │                                                      │
│ tinyshop │  Workshop                                            │
│          │                                                      │
│──────────│  ┌────────────────────────────────────────────────┐   │
│          │  │ 🎯 Recommended next: TINY Architect             │   │
│ 🔨       │  │  "Spec is approved — time to create the plan"  │   │
│ Workshop │  │                                       [ Go → ] │   │
│          │  └────────────────────────────────────────────────┘   │
│ 📄       │                                                      │
│ Artifacts│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│          │  │ 🎯        │  │ 📐        │  │ 🔍        │            │
│ ⚙️       │  │ TINY      │  │ TINY      │  │ TINY      │            │
│ Settings │  │ Orchestr. │  │ Architect │  │ Researcher│            │
│          │  │           │  │           │  │           │            │
│          │  │ ● Ready   │  │ ◉ Up next │  │ ● Ready   │            │
│          │  └──────────┘  └──────────┘  └──────────┘            │
│          │                                                      │
│          │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│          │  │ 🎨        │  │ 🛠️        │  │ ✅        │            │
│          │  │ TINY      │  │ TINY      │  │ TINY      │            │
│          │  │ Designer  │  │ Developer │  │ Validator │            │
│          │  │           │  │           │  │           │            │
│          │  │ ● Ready   │  │ ● Ready   │  │ ● Ready   │            │
│          │  └──────────┘  └──────────┘  └──────────┘            │
│          │                                                      │
│          │  ┌──────────┐                                        │
│          │  │ 🧪        │                                        │
│          │  │ TINY      │                                        │
│          │  │ QA Tester │                                        │
│          │  │           │                                        │
│          │  │ ● Ready   │                                        │
│          │  └──────────┘                                        │
│          │                                                      │
│          │  Needs Your Attention  ▾                             │
│          │  ┌────────────────────────────────────────────────┐   │
│          │  │    All clear — no pending decisions.           │   │
│          │  └────────────────────────────────────────────────┘   │
│          │                                                      │
│──────────│                                                      │
│ myproj   │                                                      │
└──────────┴──────────────────────────────────────────────────────┘
```

TINY Architect card: `ts-accent` border (2px), `ts-accent-tint` background, "Up next" label in `ts-accent`. NextActionBanner: `ts-accent-tint` background with `ts-accent` left accent.

---

### 2B. Empty State — No Project Attached

This state renders when the app first loads with no project set, but shows the AppShell (sidebar navigation visible, project badge empty).

```
┌──────────┬──────────────────────────────────────────────────────┐
│          │                                                      │
│ tinyshop │  Workshop                                            │
│          │                                                      │
│──────────│                                                      │
│          │                                                      │
│ 🔨       │                                                      │
│ Workshop │                  🔨                                  │
│          │                                                      │
│ 📄       │        No project attached yet.                      │
│ Artifacts│                                                      │
│          │    Open a project to see your workshop here.         │
│ ⚙️       │                                                      │
│ Settings │         [ Open a Project ]                           │
│          │                                                      │
│          │                                                      │
│──────────│                                                      │
│  —       │                                                      │
└──────────┴──────────────────────────────────────────────────────┘
```

Note: Per spec, AppShell replaces itself with WelcomeScreen when `projectPath === null`. This empty state occurs in the edge case where a project was previously set but the folder was moved — the sidebar remains but the Workshop content shows this nudge. "Open a Project" navigates to `/welcome`.

---

### 2C. Bootstrap in Progress — Some Artifacts Exist, Others Pending

This state shows when a project is attached but foundational artifacts are still being created (e.g., spec exists, but plan and tasks do not yet).

```
┌──────────┬──────────────────────────────────────────────────────┐
│          │                                                      │
│ tinyshop │  Workshop                                            │
│          │                                                      │
│──────────│  ┌────────────────────────────────────────────────┐   │
│          │  │ 🎯 Recommended next: TINY Architect             │   │
│ 🔨       │  │  "Project has a spec — create the plan next"   │   │
│ Workshop │  │                                       [ Go → ] │   │
│          │  └────────────────────────────────────────────────┘   │
│ 📄       │                                                      │
│ Artifacts│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│          │  │ 🎯        │  │ 📐        │  │ 🔍        │            │
│ ⚙️       │  │ TINY      │  │ TINY      │  │ TINY      │            │
│ Settings │  │ Orchestr. │  │ Architect │  │ Researcher│            │
│          │  │           │  │           │  │           │            │
│          │  │ ✓ Done    │  │ ◉ Up next │  │ ● Ready   │            │
│          │  └──────────┘  └──────────┘  └──────────┘            │
│          │  (green bdr)   (accent bdr)  (default)               │
│          │                                                      │
│          │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│          │  │ 🎨        │  │ 🛠️        │  │ ✅        │            │
│          │  │ TINY      │  │ TINY      │  │ TINY      │            │
│          │  │ Designer  │  │ Developer │  │ Validator │            │
│          │  │           │  │           │  │           │            │
│          │  │ ● Ready   │  │ ● Ready   │  │ ● Ready   │            │
│          │  └──────────┘  └──────────┘  └──────────┘            │
│          │                                                      │
│          │  ┌──────────┐                                        │
│          │  │ 🧪 TINY   │                                        │
│          │  │ QA Tester │                                        │
│          │  │ ● Ready   │                                        │
│          │  └──────────┘                                        │
│          │                                                      │
│          │  Needs Your Attention (1)  ▾                         │
│          │  ┌────────────────────────────────────────────────┐   │
│          │  │ ▌[DECISION NEEDED]                            │   │
│          │  │ ▌Which database for the preference store?      │   │
│          │  │ ▌  📄 specs/feat-mvp/spec.md:214              │   │
│          │  └────────────────────────────────────────────────┘   │
│          │                                                      │
│──────────│                                                      │
│ myproj   │                                                      │
└──────────┴──────────────────────────────────────────────────────┘
```

---

### 2D. Active Session — One Role Working

```
         ┌──────────┐  ┌──────────┐  ┌──────────┐
         │ 🎯        │  │ 📐        │  │ 🔍        │
         │ TINY      │  │ TINY      │  │ TINY      │
         │ Orchestr. │  │ Architect │  │ Researcher│
         │           │  │           │  │           │
         │ ✓ Done    │  │ ○ Working…│  │ ● Ready   │
         └──────────┘  └──────────┘  └──────────┘
          (green bdr)   (blue bdr,    (default)
                         pulsing dot)
```

TINY Architect card: `ts-launched` border, `ts-launched-tint` background. Status dot pulses with `animate-pulse`. Label "Working..." in `ts-launched` text.

---

### 2E. Decision Queue — Items Present

```
         Needs Your Attention (2)  ▾
         ┌────────────────────────────────────────────────┐
         │                                                │
         │ ▌[DECISION NEEDED]                             │
         │ ▌Should auth middleware store tokens in        │
         │ ▌session or use stateless JWTs?                │
         │ ▌  📄 specs/feat-auth/spec.md:42               │
         │ ▌  > ...the middleware intercepts all /api/... │
         │                                                │
         └────────────────────────────────────────────────┘
         ┌────────────────────────────────────────────────┐
         │                                                │
         │ ▌[ASK OPERATOR]                               │
         │ ▌Which database should we use for the          │
         │ ▌user preference store?                        │
         │ ▌  📄 specs/feat-mvp/plan.md:88                │
         │ ▌  > ...consider SQLite vs PostgreSQL...       │
         │                                                │
         └────────────────────────────────────────────────┘
```

Left border: 4px solid `ts-warning`. `[DECISION NEEDED]` badge: amber/warning. `[ASK OPERATOR]` badge: blue/launched. Source file is a clickable link to the Artifact Viewer.

---

## 3. Launch Drawer

The Launch Drawer slides in from the right edge of the screen and overlays the Workshop content. The main content remains visible but is dimmed by a `bg-black/10` scrim.

### 3A. Loaded State — Files Present

```
┌──────────┬──────────────────────┬──────────────────────────┐
│          │                      │                          │
│ tinyshop │  Workshop            │  📐 TINY Architect    ✕  │
│          │                      │                          │
│──────────│  (workshop content   │  Plans your project's    │
│          │   visible but        │  architecture and        │
│ 🔨       │   dimmed behind      │  implementation strategy.│
│ Workshop │   bg-black/10        │                          │
│          │   scrim)             │  ── Files to Load ─────  │
│ 📄       │                      │                          │
│ Artifacts│                      │  📄 AGENT_BOOTSTRAP.md   │
│          │                      │     Project overview     │
│ ⚙️       │                      │                          │
│ Settings │                      │  📄 preambles/           │
│          │                      │     COMMON_RULES.md      │
│          │                      │     Shared rules         │
│          │                      │                          │
│          │                      │  📄 preambles/           │
│          │                      │     ARCHITECT.md         │
│          │                      │     Role preamble        │
│          │                      │                          │
│          │                      │  ⚠️ specs/feat-mvp/      │
│          │                      │     spec.md   [Missing]  │
│          │                      │                          │
│          │                      │  ── Startup Prompt ────  │
│          │                      │                          │
│          │                      │  Read all provided files │
│          │                      │  before acting. You are  │
│          │                      │  the Architect role...   │
│          │                      │  ▸ Show full prompt      │
│          │                      │                          │
│          │                      │  ── Expected Output ───  │
│          │                      │                          │
│          │                      │  specs/feat-mvp/plan.md  │
│          │                      │                          │
│          │                      │  ━━━━━━━━━━━━━━━━━━━━━━  │
│          │                      │                          │
│          │                      │  [ 📋 Copy Command ]     │
│          │                      │  [ 🚀 Launch           ] │
│          │                      │                          │
│──────────│                      │                          │
│ myproj   │                      │                          │
└──────────┴──────────────────────┴──────────────────────────┘
```

Drawer width: 420px fixed. Sticky footer with "Copy Command" (outline) and "Launch" (accent) buttons, full width, stacked.

---

### 3B. Loaded State — Missing Files Warning Banner

```
│  📐 TINY Architect    ✕  │
│                          │
│  Plans your project's    │
│  architecture and        │
│  implementation strategy.│
│                          │
│  ┌──────────────────────┐ │
│  │ ⚠️  Some required    │ │
│  │ files are missing.   │ │
│  │ This role may not    │ │
│  │ work correctly.      │ │
│  └──────────────────────┘ │
│                          │
│  ── Files to Load ─────  │
│  ...                     │
```

Warning `Alert` renders above the file list when any `LaunchFile.missing === true`. Uses `ts-warning-tint` background.

---

### 3C. Loading State — Skeleton

```
                           ┌──────────────────────────┐
                           │                          │
                           │  📐 TINY Architect    ✕  │
                           │                          │
                           │  ░░░░░░░░░░░░░░░░░░░░    │
                           │  ░░░░░░░░░░░░            │
                           │                          │
                           │  ── Files to Load ─────  │
                           │                          │
                           │  ░░░░░░░░░░░░░░░░░░░░    │
                           │  ░░░░░░░░░░░░░░░░         │
                           │  ░░░░░░░░░░░░░░░░░░░░    │
                           │                          │
                           │  ── Startup Prompt ────  │
                           │                          │
                           │  ░░░░░░░░░░░░░░░░░░░░    │
                           │  ░░░░░░░░░░░░░░░░░        │
                           │                          │
                           │  ━━━━━━━━━━━━━━━━━━━━━━  │
                           │                          │
                           │  [ 📋 Copy Command ]     │  ← disabled
                           │  [ 🚀 Launch           ] │  ← disabled
                           │                          │
                           └──────────────────────────┘
```

Footer buttons visible but disabled during load. `Skeleton` shimmer fills the content sections.

---

### 3D. Startup Prompt Expanded

```
│  ── Startup Prompt ────  │
│                          │
│  Read all provided files │
│  before acting. You are  │
│  the Architect role for  │
│  this project. Your job  │
│  is to read the spec and │
│  produce a detailed      │
│  implementation plan...  │
│  [full prompt text]      │
│                          │
│  ▴ Hide prompt           │
```

Expanded state: `max-h-64 overflow-y-auto` scroll area. Full prompt in `<pre>` monospace block.

---

### 3E. Post-Launch State

```
│  [ ✓ Launched          ] │  ← disabled, ts-success text
│                          │
│  (drawer auto-closes     │
│   in 1.5 seconds)        │
```

---

## 4. Artifact Viewer

### 4A. Artifact Selected — Standard View

```
┌──────────┬───────────────┬────────────────────────────────────┐
│          │               │                                    │
│ tinyshop │  Artifacts    │  ┌────────┐ ┌──────┐ ┌──────────┐  │
│          │               │  │APPROVED│ │ spec │ │feat-mvp  │  │
│──────────│  🔍 Filter…   │  └────────┘ └──────┘ └──────────┘  │
│          │               │                                    │
│ 🔨       │  ▾ Specs (3)  │  # Spec: feat-mvp                  │
│ Workshop │    feat-mvp ◀ │                                    │
│          │    feat-auth  │  ## Summary                        │
│ 📄       │    feat-ui    │                                    │
│ Artifacts│               │  Tinyshop MVP is a local Next.js   │
│          │  ▾ Plans (1)  │  web app that gives a non-technical│
│ ⚙️       │    feat-mvp   │  user a visual dashboard...        │
│ Settings │               │                                    │
│          │  ▾ Tasks (1)  │  ## User-Facing Behavior           │
│          │    feat-mvp   │                                    │
│          │               │  ### Flow 1: New Project Setup     │
│          │  ▸ Sessions   │                                    │
│          │    (0)        │  1. User opens Tinyshop...         │
│          │               │                                    │
│          │  ▸ Handoffs   │  ```typescript                     │
│          │    (2)        │  ┌──────────────────────────┐      │
│          │               │  │ interface ArtifactRecord │      │
│          │  ▸ Other (1)  │  │   path: string;          │      │
│          │               │  └──────────────────────────┘      │
│          │               │                                    │
│──────────│               │                                    │
│ myproj   │               │                                    │
└──────────┴───────────────┴────────────────────────────────────┘
```

Active artifact (`feat-mvp` under Specs): `border-l-2 border-ts-accent font-semibold`. Sidebar: 260px fixed. Reader: fills remaining width, `p-8`, scrollable.

---

### 4B. No Artifact Selected — Empty Reader State

```
┌──────────┬───────────────┬────────────────────────────────────┐
│          │               │                                    │
│ tinyshop │  Artifacts    │                                    │
│          │               │                                    │
│──────────│  🔍 Filter…   │                                    │
│          │               │                                    │
│ 🔨       │  ▾ Specs (3)  │                                    │
│ Workshop │    feat-mvp   │                                    │
│          │    feat-auth  │              📄                    │
│ 📄       │    feat-ui    │                                    │
│ Artifacts│               │   Select an artifact from the     │
│          │  ▾ Plans (1)  │   sidebar to view it here.        │
│ ⚙️       │    feat-mvp   │                                    │
│ Settings │               │                                    │
│          │               │                                    │
│──────────│               │                                    │
│ myproj   │               │                                    │
└──────────┴───────────────┴────────────────────────────────────┘
```

---

### 4C. Artifact with Parse Error

```
                            ┌────────────────────────────────────┐
                            │                                    │
                            │  ┌─────────────┐ ┌─────────┐      │
                            │  │ parse-error │ │ unknown │      │
                            │  └─────────────┘ └─────────┘      │
                            │  (red badge)                       │
                            │                                    │
                            │  ⚠️  Frontmatter could not be      │
                            │     parsed. Showing raw content.   │
                            │                                    │
                            │  ---                               │
                            │  status: DRAFT                     │
                            │  broken: [this line is invalid     │
                            │  ---                               │
                            │                                    │
                            │  # Rest of Content                 │
                            │  Normal markdown below the         │
                            │  broken frontmatter...             │
                            │                                    │
                            └────────────────────────────────────┘
```

---

### 4D. Filter Active — Search Results

```
│  🔍 plan               │  ← typed filter text, clear ✕ button
│                        │
│  ▾ Plans (1)           │
│    feat-mvp ◀ (active) │
│                        │
│  ▾ Handoffs (1)        │
│    feat-mvp-plan-hoff  │
│                        │
│  (all other groups     │
│   hidden — no matches) │
```

Filter is case-insensitive substring match against artifact name. Groups with zero matching items are fully hidden.

---

## 5. Settings

```
┌──────────┬──────────────────────────────────────────────────────┐
│          │                                                      │
│ tinyshop │  Settings                                            │
│          │                                                      │
│──────────│       ┌──────────────────────────────────┐           │
│          │       │                                  │           │
│ 🔨       │       │  Project                         │           │
│ Workshop │       │                                  │           │
│          │       │  /Users/you/projects/myapp       │           │
│ 📄       │       │  (read-only, monospace, muted)   │           │
│ Artifacts│       │                                  │           │
│          │       │  [ Change Project ]              │           │
│ ⚙️       │       │                                  │           │
│ Settings │       │  ──────────────────────────────  │           │
│          │       │                                  │           │
│          │       │  Anthropic API Key               │           │
│          │       │                                  │           │
│          │       │  [••••••••••••••••••••________]  │           │
│          │       │  For future TINY Shopkeeper use. │           │
│          │       │  Not required for MVP.           │           │
│          │       │                                  │           │
│          │       │                  [ Save Settings]│           │
│          │       │                                  │           │
│          │       └──────────────────────────────────┘           │
│          │                                                      │
│──────────│                                                      │
│ myproj   │                                                      │
└──────────┴──────────────────────────────────────────────────────┘
```

---

### 5B. Settings — After Save (Confirmation)

```
│  [••••••••••••••••••••________]  │
│  For future TINY Shopkeeper use. │
│                                  │
│                  [ Save Settings]│
│                                  │
│  ✓  Settings saved.              │  ← ts-success text, fades after 3s
│                                  │
```

---

## 6. Global Error and Status States

### 6A. Project Folder Not Found

Replaces the Workshop content (sidebar still visible).

```
┌──────────┬──────────────────────────────────────────────────────┐
│          │                                                      │
│ tinyshop │  Workshop                                            │
│          │                                                      │
│──────────│  ┌────────────────────────────────────────────────┐   │
│          │  │                                                │   │
│ 🔨       │  │  ⚠️  Project folder not found                  │   │
│ Workshop │  │                                                │   │
│          │  │  The folder at /Users/you/old-path             │   │
│ 📄       │  │  no longer exists or can't be accessed.        │   │
│ Artifacts│  │                                                │   │
│          │  │       [ Open a Different Project ]             │   │
│ ⚙️       │  │                                                │   │
│ Settings │  └────────────────────────────────────────────────┘   │
│          │                                                      │
│──────────│                                                      │
│ myproj   │                                                      │
└──────────┴──────────────────────────────────────────────────────┘
```

---

### 6B. SSE Disconnected — Reconnecting Banner

Appears as a fixed banner at the top of the main content area (above all other page content).

```
┌──────────────────────────────────────────────────────────────────┐
│ ⚠️  Live updates disconnected. Reconnecting…                      │
└──────────────────────────────────────────────────────────────────┘
```

Banner: `bg-ts-warning-tint border-b border-ts-warning text-ts-warning text-sm py-2 px-4`. Disappears automatically on SSE reconnect.

---

### 6C. Next-Action Unavailable (Banner Fallback)

Rendered in the NextActionBanner slot when `role === "unknown"`.

```
┌────────────────────────────────────────────────────────────────┐
│  Unable to determine the next step. Check the orchestrator     │
│  state or pick a role manually.                                │
└────────────────────────────────────────────────────────────────┘
```

Muted style: `bg-ts-surface border-ts-border text-ts-text-muted`. No "Go" button.