# Interactions: feat-mvp

---
status: APPROVED
project_root: /Users/brach/Documents/THE_FACTORY/projects/Tinyshop
revision_of: none
supersedes: none
superseded_by: none
---

## Transition Map

This document defines every state transition, animation, and interaction pattern in the MVP. Organized by view. All animations use CSS transitions — no JavaScript animation libraries.

---

## Global Transitions

### App-Level Routing Logic

```
App loads
  → GET /api/settings
    → settings.projectPath === null?
        YES → render WelcomeScreen (full-page, no sidebar)
        NO  → check if folder exists (server-side, on settings load)
          → exists?
              YES → render AppShell + redirect to /workshop
              NO  → render AppShell + show "Project folder not found" error
                    in Workshop content area
```

### Navigation

| Trigger | Action | Animation |
|---------|--------|-----------|
| Click nav link (Workshop/Artifacts/Settings) | Next.js App Router route change | None (instant) |
| Active nav highlight | Left border 3px `ts-accent` + `ts-accent` text | None (static) |
| Sidebar hover on nav item | `bg-ts-border/40` background | 100ms ease |

### SSE Connection Lifecycle

```
AppShell mounts
  → useSSE() connects to GET /api/events
    → EventSource established
      → receive { type: "connected", data: { projectPath } }
        → store projectPath in state
      → on message → dispatch to registered handlers
    → on error / close
      → show "Live updates disconnected" banner (top of main content)
      → begin auto-reconnect: 2s delay, then exponential backoff (×2 each attempt, max 30s)
      → on successful reconnect
        → hide banner
        → re-fetch GET /api/artifacts (full resync — SSE may have missed events)
        → re-fetch GET /api/next-action
        → re-fetch GET /api/decisions
```

---

## Welcome Screen Interactions

### Form Selection

```
State: DEFAULT
  Two cards rendered at equal visual weight.

  Trigger: Click "Start a new project" card
    → State: NEW_PROJECT_FORM
    → "Start a new" card: adds border-2 border-ts-accent (100ms ease border-color)
    → "Open existing" card: opacity → 0.5 (150ms ease opacity)
    → NewProjectForm slides in below the cards
        Animation: max-height 0 → auto + opacity 0 → 1 (200ms ease-out)

  Trigger: Click "Open an existing project" card
    → State: ATTACH_FORM
    → "Open existing" card: adds border-2 border-ts-accent
    → "Start a new" card: opacity → 0.5
    → AttachProjectPicker slides in below the cards (200ms ease-out)

State: NEW_PROJECT_FORM
  Trigger: Click "Open existing" card
    → NewProjectForm collapses: max-height → 0 + opacity → 0 (150ms ease-in)
    → After collapse completes → switch to State: ATTACH_FORM
    → AttachProjectPicker slides in (200ms ease-out)
    → Card highlights swap

State: ATTACH_FORM
  Trigger: Click "Start a new" card
    → AttachProjectPicker collapses (150ms ease-in)
    → After collapse → switch to State: NEW_PROJECT_FORM
    → NewProjectForm slides in (200ms ease-out)
    → Card highlights swap
```

### New Project Submit

```
State: NEW_PROJECT_FORM

Trigger: Click "Create Project"
  → Client-side validation:
      → Empty fields: add red border (border-ts-error) + show error text below field
      → If any invalid → stop, do not submit
  → All fields valid:
      → Button state: "Creating…" + spinner (disabled)
      → Input fields: non-interactive (pointer-events-none, opacity-75)
      → POST /api/projects/scaffold { name, stack, description, path }
        → Success response (ProjectConfig)
            → POST /api/projects/attach { path: scaffoldedPath }
              → redirect to /workshop (instant Next.js navigation)
        → Error: { message: "directory not empty" }
            → Show inline confirmation Alert:
                "This folder already contains files. Proceed anyway?"
                [ Cancel ] [ Create Anyway ]
              → Click "Cancel":
                  → Dismiss Alert, button returns to normal "Create Project"
              → Click "Create Anyway":
                  → Re-submit POST /api/projects/scaffold with { forceOverwrite: true }
                  → On success → attach → redirect
        → Error (other):
            → Button returns to "Create Project" (normal)
            → Show error text below button: "Something went wrong. {error.message}"
            → Input fields re-enabled
```

### Attach Project Submit

```
State: ATTACH_FORM

Trigger: Click "Open Project"
  → Validate path non-empty (inline error if empty)
  → Button state: "Checking…" + spinner (disabled)
  → POST /api/projects/attach { path }
    → Response: { compatible: true }
        → redirect to /workshop (instant)
    → Response: { compatible: false, missing: string[] }
        → CompatibilityResult panel slides in below the button (200ms ease-out)
        → Panel shows checklist (✓ green / ✗ red for each required file)
        → "Open Anyway" ghost button present
          → Trigger: Click "Open Anyway"
              → PUT /api/settings { projectPath: path }
              → redirect to /workshop (degraded mode — no workflow guidance)
        → Button returns to "Open Project" (normal)
    → Error: folder not found
        → Show inline error text below path input: "Folder not found at this path"
        → Button returns to normal
```

---

## Workshop Dashboard Interactions

### Initial Load

```
WorkshopPage mounts
  → Render skeleton state:
      → NextActionBanner: skeleton shimmer h-14 rounded-xl
      → MascotGrid: 7 skeleton cards h-[120px] rounded-xl in 3-col grid
      → DecisionQueue: 2 skeleton blocks
  → Parallel fetches:
      → GET /api/next-action
      → GET /api/decisions
      → useRoleStatuses() reads initial statuses from SSE (or defaults all to "idle")
  → As responses arrive:
      → Fade in real content (150ms ease opacity)
      → Each section can independently transition out of skeleton
```

### Workshop Empty State

```
State: No project attached (projectPath === null after settings load)
  → AppShell renders WelcomeScreen in place of the full shell.
  → No sidebar rendered.

State: Project attached but folder deleted/moved
  → AppShell renders with sidebar.
  → WorkshopPage renders "Project folder not found" full-content alert.
  → MascotGrid, NextActionBanner, DecisionQueue do NOT render.
  → "Open a Different Project" button → PUT /api/settings { projectPath: null }
      → redirect to /welcome
```

### Bootstrap in Progress State

```
State: Project attached, orchestrator state file exists, but some expected
       artifacts are missing (e.g., no plan.md yet, no tasks.md yet).

  → WorkshopPage renders normally.
  → GET /api/next-action returns the appropriate role to run next.
  → MascotCards render with statuses derived from artifact existence:
      → Orchestrator: "complete" if orchestrator-state.md exists
      → Architect: "up next" (recommended) if spec exists but plan does not
      → Others: "idle"
  → DecisionQueue shows any [DECISION NEEDED] items found in existing artifacts.
  → No special "bootstrap mode" banner — the NextActionBanner alone guides the user.
```

### MascotCard Click

```
State A: LaunchDrawer closed

  Trigger: Click MascotCard(role)
    → Set selectedRole = role
    → LaunchDrawer opens:
        → Sheet slides in from right edge (250ms ease-out)
            translateX(100%) → translateX(0)
        → Scrim fades in: opacity 0 → 0.1 (200ms ease)
        → Focus trap activates inside drawer
        → Start loading launch package: GET /api/launch-package?role={role}

State B: LaunchDrawer open for a DIFFERENT role

  Trigger: Click MascotCard(otherRole)
    → Set selectedRole = otherRole
    → Drawer content cross-fades:
        → Old content: opacity 1 → 0 (100ms ease)
        → Update role label in drawer header immediately
        → New content fetches: GET /api/launch-package?role={otherRole}
        → Show skeleton in body during fetch
        → New content: opacity 0 → 1 (150ms ease) when loaded
    → Scrim stays visible (no animation)
    → Drawer position unchanged (stays open)

State C: LaunchDrawer open for THIS role

  Trigger: Click same MascotCard again
    → Close drawer:
        → Sheet slides out: translateX(0) → translateX(100%) (200ms ease-in)
        → Scrim fades out: opacity 0.1 → 0 (150ms ease)
        → Focus returns to the MascotCard that was clicked
        → selectedRole = null
```

### MascotCard Status Updates (SSE-Driven)

```
Receive SSE event: { type: "status-update", data: { role, status } }
  → useRoleStatuses() updates Map<string, RoleStatus>
  → MascotCard(role) re-renders:
      → border-color: 300ms ease transition
      → background-color: 300ms ease transition
      → StatusDot color: 300ms ease transition
      → StatusDot animation: added/removed (no transition — animation class toggle)
      → Status label text: instant change (no fade)
```

### NextActionBanner "Go" Button

```
Trigger: Click "Go →" button in NextActionBanner
  → Smooth scroll to MascotGrid section (behavior: "smooth")
  → After scroll completes (~300ms):
      → Target MascotCard: brief highlight pulse
          ring-2 ring-ts-accent ring-offset-2, 1 full pulse cycle (600ms ease-in-out)
          ring opacity: 1 → 0 over 600ms
      → Open LaunchDrawer for the recommended role (same as MascotCard click)
```

### NextActionBanner Updates (SSE-Driven)

```
Receive SSE event: { type: "status-update", data: { role, status: "complete" } }
  → Re-fetch GET /api/next-action
  → On response:
      → Banner content cross-fades:
          → Current content: opacity 1 → 0 (200ms ease)
          → New content: opacity 0 → 1 (200ms ease)
      → Update isRecommended flag on all MascotCards
          → Previous recommended card: border/bg transitions to normal (300ms ease)
          → New recommended card: border/bg transitions to accent (300ms ease)
```

### DecisionQueue Expand/Collapse

```
Default state: expanded if decision count > 0, collapsed if empty.

Trigger: Click section header "Needs Your Attention"
  → Toggle Collapsible open/closed
  → Content: max-height transition (200ms ease for open, 150ms ease-in for close)
  → Chevron icon (ChevronDown): rotate 0deg ↔ 180deg (200ms ease)
```

### DecisionQueue Source Link Click

```
Trigger: Click source file path on a decision card
  → Navigate to /artifacts (Next.js router.push)
  → Pass artifact path as query param: /artifacts?select={encodedPath}
  → ArtifactsPage reads query param on mount
      → Auto-selects the artifact in sidebar (sets active item)
      → Fetches and renders the artifact content
      → Note: scrolling to the specific line number is best-effort and may not
        be implemented in MVP if the markdown renderer does not support anchor IDs
        per line. If unavailable, just load the artifact — do not block the navigation.
```

### DecisionQueue SSE Update

```
Receive SSE event: { type: "decision-found", data: DecisionItem }
  → Add new decision card to the queue list
  → If queue was empty:
      → Section auto-expands (Collapsible opens, 200ms ease)
      → Section header count badge: "0" → "1" (instant)
  → New card: brief background highlight flash (bg-ts-warning/20, 500ms ease-out)
```

---

## Launch Drawer Interactions

### Open / Close (Full Detail)

```
Open trigger: MascotCard click or NextActionBanner "Go" button

  Entry animation:
    → Sheet: translateX(420px) → translateX(0), 250ms ease-out
    → Scrim: opacity 0 → 0.1, 200ms ease
    → Focus: moves to drawer container (focus trap)
    → Scroll: main content body scroll NOT locked

Close triggers and animations:
  → Click ✕ button (SheetClose)
  → Press Escape key (Sheet handles natively)
  → Click scrim area (pointer-events on scrim div → call onClose)
  → Re-click the same MascotCard
  → Auto-close after successful launch (1500ms delay)

  Exit animation:
    → Sheet: translateX(0) → translateX(420px), 200ms ease-in
    → Scrim: opacity 0.1 → 0, 150ms ease
    → Focus: returns to the MascotCard that last opened the drawer
             (store ref before opening; restore on close)
```

### Content Loading

```
Drawer opened → fetch immediately triggered

  Loading state (immediate, shown before fetch resolves):
    → Header: role emoji + role name (known from click context, no fetch needed)
    → Body: Skeleton shimmer blocks for each section
    → Footer: "Copy Command" + "Launch" buttons visible but disabled
    → Expected duration: < 500ms on local machine (files are local)

  Fetch: GET /api/launch-package?role={role}
    → Success:
        → Body content fades in: opacity 0 → 1, 150ms ease
        → Buttons become enabled
    → Error (network or 404):
        → Replace skeleton with error state:
            Alert variant="destructive": "Couldn't load launch package for this role."
            Button: "Retry" (outline)
          → Trigger: Click "Retry" → re-fetch (same loading flow)
```

### Missing Files Warning

```
After launch package loads:
  → Check if any LaunchFile has missing === true
  → If yes:
      → Render warning Alert above file list (no animation — renders with content)
      → Warning text: "Some required files are missing. This role may not work correctly."
  → If no: no warning rendered
```

### Startup Prompt Expand/Collapse

```
Default: collapsed — shows first 3 lines as a preview, clipped with line-clamp-3
         "▸ Show full prompt" text button below preview

Trigger: Click "▸ Show full prompt"
  → Collapsible opens:
      → Remove line-clamp-3 class
      → max-height: 0 → 256px (max-h-64), 200ms ease
      → Label changes to "▴ Hide prompt"

Trigger: Click "▴ Hide prompt"
  → Collapsible closes:
      → max-height: 256px → 0, 150ms ease-in
      → Add line-clamp-3 class back
      → Label changes to "▸ Show full prompt"
```

### Copy Command

```
Trigger: Click "Copy Command" button
  → navigator.clipboard.writeText(launchPackage.terminalCommand)
    → Success:
        → Button text: "Copy Command" → "Copied!" (instant)
        → Button text color: default → ts-success (instant)
        → After 2000ms: revert text and color (instant revert)
    → Failure (clipboard API unavailable):
        → Button text: "Copy Command" → "Copy failed" (instant)
        → After 2000ms: revert
        → Note: on macOS with localhost, clipboard should always succeed
```

### Launch

```
Trigger: Click "Launch" button

  Step 1 — Loading state:
    → Button: "🚀 Launch" → "Launching…" + spinner (disabled)

  Step 2 — POST /api/launch { role }
    → Success ({ success: true }):
        → Button: "Launching…" → "Launched ✓" (ts-success text, disabled)
        → MascotCard status update arrives via SSE within ~1s:
            { type: "status-update", data: { role, status: "launched" } }
            → Card border/bg transitions to launched colors (300ms ease)
        → After 1500ms: auto-close drawer
            → Exit animation (200ms ease-in)
    → Error ({ success: false } or network error):
        → Button returns to "🚀 Launch" (enabled)
        → Show inline error below footer buttons:
            "Terminal launch failed. Try copying the command instead."
            (ts-error text, text-sm)
        → Error persists until next attempt or drawer close
```

---

## Artifact Viewer Interactions

### Initial Load

```
ArtifactsPage mounts
  → useArtifacts() provides artifact list (already populated from AppShell SSE)
  → If query param ?select={path} present:
      → Auto-select that artifact
      → Fetch and render immediately
  → If no query param:
      → Render empty reader state (centered prompt text)
  → Sidebar renders immediately from cached artifact list (no loading skeleton needed
    if AppShell's useArtifacts() is already hydrated)
  → If artifact list not yet loaded: show sidebar skeleton (8 Skeleton h-6 items)
```

### Sidebar Navigation

```
Trigger: Click ArtifactListItem

  → Set as active item:
      → border-l-2 border-ts-accent + font-semibold + bg-ts-accent/5
      → Previous active item loses these classes (150ms ease border transition)
  → Fetch artifact content:
      → GET /api/artifacts/{encodedPath}
      → Reader panel: show Skeleton lines (5 lines at varying widths)
  → On response:
      → Parse frontmatter badges
      → Render markdown content
      → FrontmatterBadges and MarkdownContent: opacity 0 → 1 (150ms ease)
      → Scroll reader panel to top (instant)
```

### Sidebar Group Collapse/Expand

```
Trigger: Click ArtifactGroupHeader (CollapsibleTrigger)
  → Toggle Collapsible state
  → Content: max-height transition (150ms ease for both open and close)
  → ChevronDown icon: rotate 0 ↔ 180deg (150ms ease)
  → Note: collapsed state lives in React component state only, not persisted
```

### Sidebar Search/Filter

```
Trigger: Type in filter input
  → Debounce: 100ms after last keystroke
  → Filter artifact names client-side (case-insensitive substring match)
  → Groups with zero matching items: display: none (instant)
  → Clear button (Lucide X icon): appears when input.length > 0 (instant)
  → All filtering is instant/client-side — no API call

Trigger: Click clear button
  → Clear input value
  → Restore full artifact list
  → Hide clear button
```

### Sidebar Real-Time Updates (SSE-Driven)

```
Receive SSE event: { type: "artifact-changed", data: ArtifactRecord }
  → Is artifact new (not in current list)?
      YES → Add to correct group in sidebar
            New item: opacity 0 → 1 (150ms ease)
            Group count badge increments
      NO  → Update artifact metadata in list
  → Is this the currently selected artifact?
      YES → Re-fetch content: GET /api/artifacts/{path}
            Silently update reader (no loading state for re-renders — content
            replaces in place with opacity 0 → 1, 150ms ease)
  → Either way: sidebar item briefly highlights (background-color flash to
    bg-ts-warning/10, 500ms ease-out, then returns to normal)

Receive SSE event: { type: "artifact-removed", data: { path } }
  → Remove item from sidebar list:
      → opacity 1 → 0, 150ms ease, then remove from DOM
      → Group count badge decrements
  → Is this the currently selected artifact?
      YES → Reader panel shows message:
                "This artifact has been removed."
                (ts-text-muted, centered, with Lucide Trash2 icon)
            Clear active selection
```

### Artifact Reader — Deep Link from Decision Queue

```
Navigation arrives: /artifacts?select={encodedPath}

  → On mount, read query param
  → Find matching artifact in list
    → Found: auto-select, fetch, render (same as click)
    → Not found: render empty reader with message:
        "Artifact not found: {path}"
```

---

## Settings Interactions

### Initial Load

```
SettingsPage mounts
  → GET /api/settings (via useSettings hook)
  → Loading: show Skeleton placeholders for the path display and API key field
  → On response: populate fields, fade in (150ms ease)
```

### Save Settings

```
Trigger: Click "Save Settings"
  → Validate API key field (no validation rules for MVP — any string is valid,
    including empty)
  → Button state: "Saving…" + spinner (disabled)
  → PUT /api/settings { anthropicApiKey: fieldValue }
    → Success:
        → Button returns to "Save Settings" (enabled)
        → Show inline success: "✓ Settings saved." (ts-success text, text-sm)
        → After 3000ms: success message fades out (opacity 1 → 0, 300ms ease)
    → Error:
        → Button returns to "Save Settings" (enabled)
        → Show inline error: "Failed to save. Please try again." (ts-error text)
        → Error persists until next attempt
```

### Change Project

```
Trigger: Click "Change Project"
  → PUT /api/settings { projectPath: null }
    → On success:
        → Navigate to /welcome (Next.js router.push)
        → AppShell re-evaluates: projectPath is null → renders WelcomeScreen
        → Sidebar disappears (full re-render)
    → On error:
        → Show inline error: "Failed to detach project. Please try again."
```

### API Key Field Masking

```
Default: <Input type="password" /> — value displayed as ••••••••••

Trigger: Input receives focus
  → type attribute: "password" → "text" (value revealed instantly)
  → No animation

Trigger: Input loses focus (blur)
  → type attribute: "text" → "password" (value re-masked instantly)

Trigger: Paste event
  → Accepted normally regardless of input type
```

---

## Animation Summary

All animations use CSS transitions or Tailwind animation classes. No JavaScript animation libraries (no Framer Motion, no GSAP) for MVP.

| Animation | Duration | Easing | CSS Property |
|-----------|----------|--------|-------------|
| LaunchDrawer slide in | 250ms | ease-out | transform: translateX |
| LaunchDrawer slide out | 200ms | ease-in | transform: translateX |
| Scrim fade in | 200ms | ease | opacity |
| Scrim fade out | 150ms | ease | opacity |
| Welcome form slide open | 200ms | ease-out | max-height + opacity |
| Welcome form slide close | 150ms | ease-in | max-height + opacity |
| StatusDot pulse (awaiting-output) | continuous | ease-in-out | opacity (Tailwind animate-pulse) |
| MascotCard border/bg change | 300ms | ease | border-color, background-color |
| Collapsible section open | 200ms | ease | max-height |
| Collapsible section close | 150ms | ease-in | max-height |
| Chevron rotation | 200ms | ease | transform: rotate |
| Content fade in | 150ms | ease | opacity |
| SSE item flash (new/updated) | 500ms | ease-out | background-color |
| Recommended card ring pulse | 600ms | ease-in-out | box-shadow / ring opacity |
| NextActionBanner crossfade | 200ms | ease | opacity |
| Success/error message fade out | 300ms | ease | opacity |
| Nav item hover | 100ms | ease | background-color |
| Sidebar list item active | 150ms | ease | border-color |

---

## Keyboard Navigation

MVP: minimal keyboard support — just the essentials for accessibility.

| Key | Context | Action |
|-----|---------|--------|
| `Escape` | LaunchDrawer open | Close drawer (Sheet handles natively) |
| `Tab` / `Shift+Tab` | Anywhere | Standard focus navigation |
| `Enter` or `Space` | Button/trigger focused | Activate |
| `Enter` or `Space` | MascotCard focused | Open LaunchDrawer for this role |
| `Enter` or `Space` | ArtifactListItem focused | Select artifact |
| `Enter` or `Space` | CollapsibleTrigger focused | Toggle expand/collapse |

Focus ring style: `ring-2 ring-ts-accent ring-offset-2` (applied via Tailwind focus-visible utilities).

---

## Loading and Empty States Summary

| Component | Loading State | Empty State |
|-----------|--------------|-------------|
| NextActionBanner | Skeleton `h-14 rounded-xl` | Muted fallback text, no "Go" button |
| MascotGrid (initial) | 7 Skeleton cards `h-[120px] rounded-xl` | N/A — always shows all 7 roles |
| DecisionQueue | 2 Skeleton blocks | "All clear — no pending decisions." |
| LaunchDrawer body | Skeleton shimmer (3 section blocks) | N/A — error state if package fails |
| ArtifactSidebar | 8 Skeleton `h-6` items | "No artifacts found in this project." |
| ArtifactReader | 5 Skeleton lines (varying widths) | "Select an artifact from the sidebar" |
| SettingsForm | Skeleton on path field + API field | N/A — always has fields |

---

## Error States Summary

| Scenario | Location | Message | Available Action |
|----------|----------|---------|-----------------|
| Project folder missing | WorkshopPage full content | "Project folder not found at {path}" | "Open a Different Project" → `/welcome` |
| SSE disconnected | Fixed banner top of main content | "Live updates disconnected. Reconnecting…" | Auto-reconnect (no user action) |
| Launch package fetch fail | LaunchDrawer body | "Couldn't load launch package for this role." | "Retry" button |
| Terminal launch fail | LaunchDrawer footer | "Terminal launch failed. Try copying the command instead." | "Copy Command" fallback |
| Artifact fetch fail | ArtifactReader | "Couldn't load this artifact." | "Retry" button |
| Settings save fail | SettingsForm below button | "Failed to save. Please try again." | Re-attempt save |
| Settings load fail | SettingsPage | "Failed to load settings." + Retry | "Retry" button |
| Scaffold fail: non-empty folder | NewProjectForm inline | "This folder already contains files. Proceed anyway?" | Cancel / Create Anyway |
| Scaffold fail: other | NewProjectForm below button | "Something went wrong. {error.message}" | Correct form and resubmit |
| Incompatible project | AttachProjectPicker | Missing files checklist with ✓/✗ | "Open Anyway" for degraded mode |
| Malformed frontmatter | ArtifactReader badges row | "parse-error" badge + inline warning above content | Raw content shown below |
| Artifact removed while viewing | ArtifactReader | "This artifact has been removed." | Sidebar selection cleared |
| Next-action unknown | NextActionBanner | "Unable to determine the next step." | Manual role selection |
| LaunchFile missing (in drawer) | LaunchDrawer file list row | "Missing" badge on row + warning banner | Launch still allowed but warned |