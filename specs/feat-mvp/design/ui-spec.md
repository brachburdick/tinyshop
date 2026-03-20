# UI Spec: feat-mvp

---
status: APPROVED
project_root: /Users/brach/Documents/THE_FACTORY/projects/Tinyshop
revision_of: none
supersedes: none
superseded_by: none
---

## Design Philosophy

Tinyshop is a **workshop**, not a dashboard. The metaphor is a small, warm workbench where a solo builder can see what's happening, pick up the next tool, and get back to work. Visual language: craft, warmth, tactile. No corporate SaaS energy. Think woodshop pegboard, not Jira.

**Guiding principles:**
- Plain language everywhere — no protocol jargon without inline explanation
- Status at a glance — the user should know what to do next within 2 seconds of looking
- One thing at a time — drawers and panels, not modals stacked on modals
- Trust the filesystem — Tinyshop reads and reflects, it does not own

---

## Color Palette

| Token | Hex Value | Tailwind Key | Usage |
|-------|-----------|-------------|-------|
| `--ts-bg` | `#FDF8F4` | `ts-bg` | Page background — warm off-white |
| `--ts-surface` | `#FFFFFF` | `ts-surface` | Cards, drawers, panels |
| `--ts-surface-alt` | `#F5EDE6` | `ts-surface-alt` | Sidebar background, subtle sections |
| `--ts-border` | `#E8DDD3` | `ts-border` | Card borders, dividers |
| `--ts-text` | `#2D2A26` | `ts-text` | Primary text — near-black brown |
| `--ts-text-muted` | `#8A8078` | `ts-text-muted` | Secondary text, descriptions, captions |
| `--ts-accent` | `#D97B3D` | `ts-accent` | Primary action buttons, active states — warm amber/orange |
| `--ts-accent-hover` | `#C06A2F` | `ts-accent-hover` | Hover on accent elements |
| `--ts-accent-tint` | `#FFF8F2` | `ts-accent-tint` | Recommended card background tint |
| `--ts-success` | `#5B9A6F` | `ts-success` | Complete status, success badges |
| `--ts-success-tint` | `#F0F7F2` | `ts-success-tint` | Success background tint |
| `--ts-warning` | `#D4A843` | `ts-warning` | Decision cards, attention items |
| `--ts-warning-tint` | `#FEF9EC` | `ts-warning-tint` | Warning background tint |
| `--ts-error` | `#C25B4E` | `ts-error` | Error states, missing file warnings |
| `--ts-error-tint` | `#FDF2F1` | `ts-error-tint` | Error background tint |
| `--ts-idle` | `#B8AFA6` | `ts-idle` | Idle status — muted neutral |
| `--ts-launched` | `#5B8FD4` | `ts-launched` | Launched/in-progress status — calm blue |
| `--ts-launched-tint` | `#F0F4FD` | `ts-launched-tint` | Launched background tint |

### Tailwind Config Extension

```js
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      ts: {
        bg: '#FDF8F4',
        surface: '#FFFFFF',
        'surface-alt': '#F5EDE6',
        border: '#E8DDD3',
        text: '#2D2A26',
        'text-muted': '#8A8078',
        accent: '#D97B3D',
        'accent-hover': '#C06A2F',
        'accent-tint': '#FFF8F2',
        success: '#5B9A6F',
        'success-tint': '#F0F7F2',
        warning: '#D4A843',
        'warning-tint': '#FEF9EC',
        error: '#C25B4E',
        'error-tint': '#FDF2F1',
        idle: '#B8AFA6',
        launched: '#5B8FD4',
        'launched-tint': '#F0F4FD',
      }
    }
  }
}
```

---

## Typography

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Page title | Inter (system-sans fallback) | 24px / `text-2xl` | 700 | `ts-text` |
| Section heading | Inter | 18px / `text-lg` | 600 | `ts-text` |
| Card title | Inter | 16px / `text-base` | 600 | `ts-text` |
| Body text | Inter | 14px / `text-sm` | 400 | `ts-text` |
| Caption / muted | Inter | 13px / `text-xs` | 400 | `ts-text-muted` |
| Badge text | Inter | 12px / `text-xs` | 500 | Varies by badge |
| Code / monospace | `font-mono` (system-mono) | 14px / `text-sm` | 400 | `ts-text` |
| Logo wordmark | Inter | 18px / `text-lg` | 700 | `ts-accent` |
| Path / filepath display | `font-mono` | 13px / `text-xs` | 400 | `ts-text-muted` |

Load Inter via `next/font/google`. Fallback stack: `system-ui, -apple-system, sans-serif`.

---

## Spacing System

Base unit: 4px (Tailwind default).

| Token | Value | Usage |
|-------|-------|-------|
| `p-1` | 4px | Tight internal padding (badges) |
| `p-2` | 8px | Small element padding |
| `p-4` | 16px | Standard card inner padding (mobile) |
| `p-5` | 20px | Standard card inner padding (desktop) |
| `p-8` | 32px | Main content area padding |
| `gap-3` | 12px | Tight item lists |
| `gap-4` | 16px | Card grid gap |
| `gap-6` | 24px | Section spacing |
| `gap-8` | 32px | Major section spacing |

---

## Dimensions Reference

| Element | Dimension | Notes |
|---------|-----------|-------|
| App sidebar | 240px wide | Fixed, full viewport height |
| Artifact sidebar (inner) | 260px wide | Fixed, inside artifacts layout |
| LaunchDrawer | 420px wide | Slides in from right edge |
| LaunchDrawer scrim | Full viewport | `bg-black/10` behind drawer |
| Card border-radius | 12px / `rounded-xl` | All surface cards |
| Card border | 1px solid `ts-border` | Default card border |
| Card shadow | `shadow-sm` | Subtle, not floating |
| StatusDot diameter | 8px | Role status indicator |
| Mascot emoji size | 32px / `text-3xl` | Inside MascotCard |
| MascotCard min-height | 120px | Consistent grid row height |
| MascotCard width | auto (grid fills) | Grid handles column sizing |
| NextActionBanner height | ~56px (auto) | Horizontal, full content width |
| Nav item height | 40px | Sidebar nav links |
| Settings form max-width | 480px | Centered single column |
| Welcome hero max-width | 560px | Centered |
| Welcome option cards | ~240px each | Side by side |
| Main content padding | 32px / `p-8` | All sides |

---

## shadcn/ui Component Mapping

Every interactive component in the UI is built on a shadcn/ui primitive. Developers must install these primitives via the shadcn CLI before implementing.

| Tinyshop Component | shadcn/ui Primitive | Notes |
|-------------------|-------------------|-------|
| `LaunchDrawer` | `Sheet` (side="right") | Width overridden to 420px via className |
| `MascotCard` | `Card` (shadcn) | Custom border/background per status via className |
| `DecisionQueue` section | `Collapsible` | Header triggers open/close |
| Decision card items | `Card` | Left border accent via className |
| `NewProjectForm`, `AttachProjectPicker` | — | Plain `<form>` with shadcn inputs |
| All text inputs | `Input` | Standard shadcn Input |
| Path inputs | `Input` with `font-mono` className | No special primitive |
| Textarea (description) | `Textarea` | Standard shadcn Textarea |
| "Create Project", "Open Project", "Launch", "Save Settings" | `Button` | variant="default" → override bg to `ts-accent` |
| "Copy Command", "Open Anyway", secondary actions | `Button` variant="outline" | Border `ts-border` |
| "Change Project" | `Button` variant="ghost" | No background |
| Frontmatter badges | `Badge` | variant overridden per status type |
| Startup Prompt expand/collapse | `Collapsible` | Trigger is text link, not button |
| Artifact group expand/collapse | `Collapsible` | Group header is the trigger |
| Settings API key field | `Input` type="password" | Toggle to type="text" on focus |
| Sidebar nav links | — | Plain `<a>` / Next.js `<Link>` styled with Tailwind |
| App-level error states | `Alert` | variant="destructive" for errors, default for warnings |
| "Couldn't load" inline errors | `Alert` variant="destructive" | Inside the affected panel |
| Save confirmation | `Alert` variant="default" with `ts-success` text | Inline below Save button |
| LoadingSkeletons | `Skeleton` | Replaces content regions during fetch |
| Artifact sidebar filter input | `Input` with search icon | Lucide `Search` icon prefix |
| Incompatibility checklist | — | Plain `<ul>` with Lucide `Check` / `X` icons |
| NextActionBanner | `Alert` | Custom `ts-accent-tint` background via className |

### shadcn Install Commands (for TASK-011 setup)

```bash
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add card
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add collapsible
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add skeleton
```

---

## Component Hierarchy

### Root Layout

```
<RootLayout>                          ← src/app/layout.tsx
  ← Loads Inter font, sets bg-ts-bg on <body>
  <AppShell>                          ← src/components/AppShell.tsx
    ← Reads GET /api/settings on mount
    ← If projectPath === null → renders <WelcomeScreen /> (no sidebar)
    ← If projectPath set but folder missing → renders AppShell + error banner
    ← Otherwise → normal shell below
    <Sidebar>                         ← src/components/Sidebar.tsx
      <Logo />                        ← "tinyshop" wordmark, ts-accent, text-lg font-bold
      <NavLinks />                    ← Workshop | Artifacts | Settings
      <ProjectBadge />                ← Project name, truncated to 20 chars + ellipsis
    </Sidebar>
    <MainContent>                     ← right of sidebar, full height, scrollable
      {children}                      ← Next.js App Router page content
    </MainContent>
  </AppShell>
</RootLayout>
```

---

### View 1: Welcome Screen

**Route:** `/welcome` (also rendered by AppShell when `projectPath === null`)
**Task refs:** TASK-019
**shadcn primitives used:** `Button`, `Input`, `Textarea`, `Alert`, `Skeleton`

```
<WelcomeScreen>                       ← src/app/welcome/page.tsx
  ← Full-page, bg-ts-bg, vertically centered
  <WelcomeHero>                       ← max-w-[560px], mx-auto, px-8, py-16
    <TinyshopLogo />                  ← "tinyshop" h1 in ts-accent, tagline below in ts-text-muted
    <WelcomeActions>                  ← flex gap-4, two equal-width cards
      <NewProjectCard />              ← Card, clickable, highlights on active state
      <AttachProjectCard />           ← Card, clickable, highlights on active state
    </WelcomeActions>

    ← Only one expanded at a time:
    <NewProjectForm>                  ← src/components/welcome/NewProjectForm.tsx
      <Input label="Project name" />
      <Input label="Tech stack" placeholder="e.g., Next.js + Python" />
      <Textarea label="What are you building?" rows={3} />
      <Input label="Where should we create it?" type="text" className="font-mono" />
      ← path helper text: "Paste a full folder path, e.g. /Users/you/projects/myapp"
      <Button className="bg-ts-accent">Create Project 🔨</Button>
      ← Inline field errors on empty-submit (red border + error text below field)
      ← Non-empty folder confirmation: inline Alert with Cancel / Create Anyway buttons
    </NewProjectForm>

    <AttachProjectPicker>             ← src/components/welcome/AttachProjectPicker.tsx
      <Input label="Project folder path" type="text" className="font-mono" />
      <Button className="bg-ts-accent">Open Project 📂</Button>
      <CompatibilityResult />         ← Alert variant, checklist of missing files
      ← "Open Anyway" Button variant="ghost" if incompatible
    </AttachProjectPicker>
  </WelcomeHero>
</WelcomeScreen>
```

**State table:**

| State | Card A | Card B | Form shown |
|-------|--------|--------|------------|
| DEFAULT | Normal | Normal | None |
| NEW_FORM | Active (ts-accent border) | Dimmed (opacity-50) | NewProjectForm |
| ATTACH_FORM | Dimmed (opacity-50) | Active (ts-accent border) | AttachProjectPicker |
| SUBMITTING | — | — | Form with loading button |
| COMPAT_ERROR | — | Active | AttachProjectPicker + CompatibilityResult |

---

### View 2: Workshop Dashboard

**Route:** `/workshop`
**Task refs:** TASK-012, TASK-013, TASK-014
**shadcn primitives used:** `Card`, `Sheet`, `Collapsible`, `Alert`, `Skeleton`, `Badge`, `Button`

```
<WorkshopPage>                        ← src/app/workshop/page.tsx
  ← Reads: GET /api/next-action, GET /api/decisions
  ← Subscribes to SSE via useSSE() / useRoleStatuses()

  <WorkshopHeader>                    ← flex, justify-between, items-center, mb-6
    <PageTitle text="Workshop" />     ← text-2xl font-bold text-ts-text
    ← (no controls in header for MVP)
  </WorkshopHeader>

  <NextActionBanner />                ← src/components/workshop/NextActionBanner.tsx
    ← Alert component, bg-ts-accent-tint border-ts-accent
    ← Shows role name bold + reason text + "Go" Button variant="ghost"
    ← Fallback: muted Alert (no accent colors) when role === "unknown"

  <StatusBoard>                       ← src/components/workshop/StatusBoard.tsx
    <MascotGrid>                      ← CSS grid: grid-cols-3 gap-4, mt-6
      ← 7 MascotCard components, one per role
      ← 7th card (QA Tester) appears alone in the last row, left-aligned
    </MascotGrid>
  </StatusBoard>

  <DecisionQueue />                   ← src/components/workshop/DecisionQueue.tsx
    ← Collapsible section below grid, mt-8
    ← Default: expanded if items exist, collapsed if empty

  <LaunchDrawer />                    ← src/components/workshop/LaunchDrawer.tsx
    ← Sheet side="right", width 420px
    ← Rendered in WorkshopPage, controlled by selectedRole state
</WorkshopPage>
```

#### MascotCard

**File:** `src/components/workshop/MascotCard.tsx`
**shadcn primitive:** `Card`

| Prop | Type | Description |
|------|------|-------------|
| `role` | `string` | Role identifier (matches API key) |
| `label` | `string` | Display name, e.g. "TINY Architect" |
| `tagline` | `string` | One-line plain-language description |
| `emoji` | `string` | Role emoji (see mascot table) |
| `accentColor` | `string` | Role-specific Tailwind color token |
| `status` | `RoleStatus` | `idle` / `launched` / `awaiting-output` / `complete` |
| `isRecommended` | `boolean` | Whether this is the next-action role |
| `isSelected` | `boolean` | Whether the Launch Drawer is open for this role |
| `onClick` | `() => void` | Opens/closes LaunchDrawer |

**Layout inside card (top to bottom):**
1. Row: role emoji (32px) + `<StatusDot />` (right-aligned in row)
2. Card title: `label` — `text-base font-semibold text-ts-text`
3. Description: `tagline` — `text-xs text-ts-text-muted mt-1`
4. Status label: `text-xs font-medium` in status-appropriate color (see table below)

**Visual state rules:**

| Status | Card border | Card bg | StatusDot color | StatusDot animation | Status label text |
|--------|-------------|---------|-----------------|--------------------|--------------------|
| `idle` (default) | `ts-border` 1px | `ts-surface` | `ts-idle` | none | "Ready" in `ts-text-muted` |
| `idle` + `isRecommended` | `ts-accent` 2px | `ts-accent-tint` | `ts-accent` | none | "Up next" in `ts-accent` |
| `launched` | `ts-launched` 1px | `ts-launched-tint` | `ts-launched` | none | "Launched" in `ts-launched` |
| `awaiting-output` | `ts-launched` 1px | `ts-launched-tint` | `ts-launched` | `animate-pulse` | "Working..." in `ts-launched` |
| `complete` | `ts-success` 1px | `ts-success-tint` | `ts-success` | none | "Done ✓" in `ts-success` |
| any + `isSelected` | same as status, 2px | same | same | same | same + ring: `ring-2 ring-ts-accent ring-offset-2` |

**Hover state (all statuses):** `cursor-pointer shadow-md` — subtle lift.

#### TINY Mascot Identity Table

All 7 mascots. These are the canonical display properties. Custom illustrations are deferred — use emoji at `text-3xl` for MVP.

| Role Key | Display Name | Emoji | Tagline | Role Color |
|----------|-------------|-------|---------|------------|
| `orchestrator` | TINY Orchestrator | 🎯 | Keeps the whole project on track | Gold — `#D4A843` (ts-warning) |
| `architect` | TINY Architect | 📐 | Designs the plan before anyone builds | Blueprint blue — `#5B8FD4` (ts-launched) |
| `researcher` | TINY Researcher | 🔍 | Digs into unknowns so the team doesn't guess | Teal — `#4A9B8E` |
| `designer` | TINY Designer | 🎨 | Defines how things look and feel | Rose — `#C26A8E` |
| `developer` | TINY Developer | 🛠️ | Writes the code that makes it real | Amber/orange — `#D97B3D` (ts-accent) |
| `validator` | TINY Validator | ✅ | Checks the work against the plan | Forest green — `#5B9A6F` (ts-success) |
| `qa-tester` | TINY QA Tester | 🧪 | Tests the whole thing end-to-end | Grape purple — `#8B6BBE` |

Note: Role colors are used for the role emoji's background pill (a small `rounded-full` circle behind the emoji, using a 10% opacity tint of the role color). Role colors are NOT the same as status colors — a card's border/background always reflects status, not role identity.

#### NextActionBanner

**File:** `src/components/workshop/NextActionBanner.tsx`
**shadcn primitive:** `Alert`

Layout: single horizontal row.
- Left: "Recommended next:" label (muted) + role name (bold, `ts-text`)
- Middle: reason text (`ts-text-muted`, truncated with ellipsis if long)
- Right: `Button` variant="ghost" text "Go →"

Sizes: full content width, `py-3 px-5`, `rounded-xl`, `border border-ts-accent bg-ts-accent-tint`

Fallback (unknown next action): same container, `bg-ts-surface border-ts-border`, no "Go" button. Text: "Unable to determine the next step. Check the orchestrator state or pick a role manually."

#### DecisionQueue

**File:** `src/components/workshop/DecisionQueue.tsx`
**shadcn primitive:** `Collapsible`

Section structure:
- `Collapsible` wrapping entire section
- `CollapsibleTrigger`: section heading row — "Needs Your Attention (N)" + chevron icon (Lucide `ChevronDown` rotates on open)
- `CollapsibleContent`: list of decision cards

Decision card anatomy:
- `Card` with left accent border: 4px solid `ts-warning`, `rounded-l-none`
- Row 1: `Badge` pill — `[DECISION NEEDED]` (amber bg) or `[ASK OPERATOR]` (blue bg)
- Row 2: Question text — `text-sm text-ts-text`
- Row 3: Source file as `<button>` styled like a link — `text-xs font-mono text-ts-text-muted underline-offset-2 hover:underline`, shows filename:lineNumber
- Row 4: Context snippet — `<blockquote>` with left border `ts-border`, `text-xs text-ts-text-muted italic`

Empty state: card with muted text "All clear — no pending decisions." centered, no accent border.

#### LaunchDrawer

**File:** `src/components/workshop/LaunchDrawer.tsx`
**shadcn primitive:** `Sheet` (side="right")

Override Sheet width: add `className="w-[420px]"` to `SheetContent`. Do not use the default Sheet sizing.

**Sections (top to bottom, scrollable body):**

1. **Header** (SheetHeader, sticky)
   - Left: role emoji + `SheetTitle` "TINY {RoleName}"
   - Right: `SheetClose` (X button, Lucide `X` icon)
   - Below title: role tagline in `text-sm text-ts-text-muted`

2. **Files to Load** (section heading + list)
   - Heading: `text-xs font-semibold uppercase tracking-wider text-ts-text-muted` — "Files to Load"
   - Each file row:
     - Lucide `FileText` icon (14px) + file path (monospace, truncated) + purpose text below (muted)
     - Missing file row: bg `ts-error-tint`, `Badge` "Missing" in `ts-error` colors, Lucide `AlertTriangle` icon

3. **Startup Prompt** (Collapsible)
   - Heading: same style as Files heading — "Startup Prompt"
   - Default: collapsed, shows first 3 lines as preview in `<pre className="text-xs font-mono text-ts-text-muted whitespace-pre-wrap line-clamp-3">`
   - `CollapsibleTrigger`: text button "Show full prompt ▸" / "Hide prompt ▴"
   - Expanded: full prompt in same `<pre>` block, `max-h-64 overflow-y-auto`

4. **Expected Output** (single row)
   - Heading: same style
   - Value: monospace path text, `text-sm text-ts-text`

5. **Actions Footer** (sticky at drawer bottom, `border-t border-ts-border bg-ts-surface pt-4 pb-6 px-6`)
   - `Button` variant="outline" full-width: "Copy Command" (Lucide `Copy` icon left)
   - `Button` className="bg-ts-accent text-white w-full mt-2": "🚀 Launch"

**Loading state:** Replace all body content with `Skeleton` blocks — 3 rectangular shimmer blocks representing the 3 main sections. Footer buttons remain visible but disabled.

**Post-launch state:** "Launch" button becomes "Launched ✓" (disabled, `ts-success` text). Drawer auto-closes after 1500ms.

**Error state:** Replace body content with `Alert` variant="destructive" — "Couldn't load launch package for this role." + `Button` variant="outline" "Retry".

**Missing files warning:** If `LaunchPackage.filesToLoad` contains any `missing: true` items, show a warning `Alert` at top of body (below header, above file list): "Some required files are missing. This role may not work correctly." — `ts-warning-tint` background, `ts-warning` border.

---

### View 3: Artifact Viewer

**Route:** `/artifacts`
**Task refs:** TASK-015
**shadcn primitives used:** `Collapsible`, `Badge`, `Input`, `Skeleton`

```
<ArtifactsPage>                       ← src/app/artifacts/page.tsx
  <ArtifactLayout>                    ← flex h-full (fills MainContent height)

    <ArtifactSidebar>                 ← src/components/artifacts/ArtifactSidebar.tsx
      ← 260px wide, fixed, bg-ts-surface-alt, border-r border-ts-border
      ← flex flex-col h-full
      <SidebarSearchInput />          ← Input, Lucide Search icon prefix, "Filter artifacts…"
                                         px-3 py-2, sticky at top of sidebar
      <ArtifactGroupList>             ← flex-1 overflow-y-auto
        ← One Collapsible per ArtifactType that has items
        <ArtifactGroup>               ← Collapsible
          <CollapsibleTrigger>        ← flex row: type label + count Badge + ChevronDown
          <CollapsibleContent>
            <ArtifactListItem />      ← button, full-width, text-sm, py-1.5 px-3
            ← Active: border-l-2 border-ts-accent font-semibold bg-ts-accent-tint/50
          </CollapsibleContent>
        </ArtifactGroup>
      </ArtifactGroupList>
    </ArtifactSidebar>

    <ArtifactReader>                  ← src/components/artifacts/ArtifactRenderer.tsx
      ← flex-1, overflow-y-auto, p-8
      <FrontmatterBadges />           ← horizontal flex wrap, gap-2, mb-6
      <MarkdownContent />             ← prose rendering
    </ArtifactReader>

  </ArtifactLayout>
</ArtifactsPage>
```

**Artifact sidebar details:**
- Width: 260px fixed
- No resize handle for MVP
- Sidebar heading (above search): "Artifacts" — `text-lg font-bold px-4 pt-4 pb-2`
- Group headers: type display name + count Badge (variant="outline") + chevron
- All groups default expanded
- Search filters names client-side; groups with zero matches are hidden entirely
- Active item: `border-l-2 border-ts-accent font-semibold bg-ts-accent/5` on the list item button
- SSE-driven: new artifacts appear at top of their group; brief `bg-ts-warning/10` flash on new/updated items

**Artifact type display names (canonical):**

| ArtifactType | Display Label |
|-------------|---------------|
| `spec` | Specs |
| `plan` | Plans |
| `tasks` | Tasks |
| `session-summary` | Sessions |
| `handoff-packet` | Handoffs |
| `validator-verdict` | Validations |
| `qa-verdict` | QA Results |
| `research-request` | Research |
| `research-findings` | Findings |
| `orchestrator-state` | Orchestrator |
| `unknown` | Other |

**Frontmatter badges:**

Each rendered as shadcn `Badge` with overridden variant colors:

| Frontmatter Field | Condition | Badge style |
|------------------|-----------|-------------|
| `status` = "APPROVED" | — | `bg-ts-success-tint text-ts-success border-ts-success/30` |
| `status` = "DRAFT" | — | `bg-ts-surface text-ts-text-muted border-ts-border` |
| `status` = "parse-error" | — | `bg-ts-error-tint text-ts-error border-ts-error/30` |
| `status` = anything else | — | `bg-ts-surface text-ts-text border-ts-border` |
| `supersedes` | not null | `bg-ts-surface text-ts-text-muted` — "Supersedes: {value}" |
| `superseded_by` | not null | `bg-ts-warning-tint text-ts-warning border-ts-warning/30` — "Superseded by: {value}" |
| `type` (ArtifactType) | always | `bg-ts-surface text-ts-text-muted border-ts-border` |

**Markdown rendering rules:**
- `react-markdown` + `remark-gfm` + `rehype-highlight`
- Wrap in `<article className="prose prose-stone max-w-none text-ts-text">`
- Override Tailwind Typography plugin with custom token values (see Color Palette)
- Code blocks: `bg-[#1E1E1E] text-[#D4D4D4] rounded-lg p-4 overflow-x-auto text-sm font-mono`
- Inline code: `bg-ts-surface-alt text-ts-text rounded px-1`
- Tables: bordered, `bg-ts-surface-alt` on odd rows
- Links: `text-ts-accent hover:underline`
- Headings: use spec typography scale (h1=text-2xl, h2=text-lg, h3=text-base)

**Empty reader state:** centered vertically and horizontally in reader panel — Lucide `FileText` icon (48px, `text-ts-border`) + text "Select an artifact from the sidebar to view it here." (`text-ts-text-muted`)

---

### View 4: Settings

**Route:** `/settings`
**Task refs:** TASK-022
**shadcn primitives used:** `Button`, `Input`, `Alert`

```
<SettingsPage>                        ← src/app/settings/page.tsx
  ← p-8
  <PageTitle text="Settings" />       ← text-2xl font-bold mb-8
  <SettingsForm>                      ← src/components/settings/SettingsForm.tsx
    ← max-w-[480px] flex flex-col gap-8
    <FieldGroup label="Project">
      <ProjectPathDisplay />          ← read-only: font-mono text-sm bg-ts-surface-alt
                                         rounded-lg p-3 border border-ts-border
      <Button variant="ghost">Change Project</Button>
    </FieldGroup>
    <Separator />                     ← hr, border-ts-border
    <FieldGroup label="Anthropic API Key">
      <Input type="password" />       ← masked, reveals on focus (type switches to text)
      <p className="text-xs text-ts-text-muted mt-1">
        For future TINY Shopkeeper use. Not required for MVP.
      </p>
    </FieldGroup>
    <Button className="bg-ts-accent text-white self-end">Save Settings</Button>
    ← Inline Alert (success or error) appears here after save attempt
    ← Success: "✓ Settings saved." fades out after 3s
    ← Error: "Failed to save. Please try again." persists until next attempt
  </SettingsForm>
</SettingsPage>
```

---

## Shared Components

### Sidebar

**File:** `src/components/Sidebar.tsx`

- `w-[240px] flex-shrink-0 flex flex-col h-full bg-ts-surface-alt border-r border-ts-border`
- **Top section:** `px-4 py-5` — "tinyshop" wordmark (`text-lg font-bold text-ts-accent`)
- **Middle section:** `flex-1 px-2 py-4` — nav links
- **Bottom section:** `px-4 py-4 border-t border-ts-border` — ProjectBadge

**Nav link anatomy:** `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium`
- Default: `text-ts-text-muted hover:bg-ts-border/40 hover:text-ts-text`
- Active: `bg-ts-accent/10 text-ts-accent font-semibold border-l-[3px] border-ts-accent rounded-l-none`

**Nav items:**

| Label | Icon (Lucide) | Route |
|-------|--------------|-------|
| Workshop | `Hammer` | `/workshop` |
| Artifacts | `FileText` | `/artifacts` |
| Settings | `Settings` | `/settings` |

**ProjectBadge:** `text-xs text-ts-text-muted truncate` — shows `projectName` (from settings), max 20 chars with `title` attribute showing full path on hover.

### StatusDot

**File:** `src/components/workshop/StatusDot.tsx`

`<span className="inline-block w-2 h-2 rounded-full" />`

| Status | Tailwind className |
|--------|--------------------|
| `idle` | `bg-ts-idle` |
| `launched` | `bg-ts-launched` |
| `awaiting-output` | `bg-ts-launched animate-pulse` |
| `complete` | `bg-ts-success` |

### Badge (extended)

The shadcn `Badge` component is used with custom `className` overrides — do not create a new component. Use the `className` prop to apply token-based colors per instance.

### PathInput

Not a separate component — use shadcn `Input` with `className="font-mono text-sm"`. Add `autoComplete="off" autoCorrect="off" spellCheck="false"` attributes.

### LoadingBoundary

Each async data region renders a loading skeleton while data is in-flight. Use the shadcn `Skeleton` component.

| Region | Skeleton shape |
|--------|---------------|
| MascotGrid (initial load) | 7 `Skeleton` blocks, `rounded-xl h-[120px]` in 3-column grid |
| NextActionBanner | 1 `Skeleton h-[56px] rounded-xl` |
| LaunchDrawer body | 3 `Skeleton` blocks at varying widths |
| ArtifactReader | 5 `Skeleton` lines of varying width |
| ArtifactSidebar list | 8 `Skeleton h-6 rounded` items |
| DecisionQueue | 2 `Skeleton h-[80px] rounded-xl` items |
| SettingsForm | 2 `Skeleton h-10 rounded-lg` fields |

---

## State Management

No global state library. React state + hooks only.

| Hook | File | Purpose | Data source |
|------|------|---------|-------------|
| `useSSE()` | `src/hooks/useSSE.ts` | EventSource lifecycle, reconnect logic | `GET /api/events` |
| `useArtifacts()` | `src/hooks/useArtifacts.ts` | Client-side artifact Map, SSE-driven updates | Built on `useSSE()` |
| `useRoleStatuses()` | `src/hooks/useRoleStatuses.ts` | `Map<string, RoleStatus>`, SSE status-update events | Built on `useSSE()` |
| `useNextAction()` | `src/hooks/useNextAction.ts` | Next-action recommendation, re-fetches on complete events | `GET /api/next-action` |
| `useDecisions()` | `src/hooks/useDecisions.ts` | Decision item list | `GET /api/decisions` |
| `useLaunchPackage(role)` | `src/hooks/useLaunchPackage.ts` | Lazy-fetches on drawer open | `GET /api/launch-package?role=` |
| `useSettings()` | `src/hooks/useSettings.ts` | Read/write settings | `GET /api/settings`, `PUT /api/settings` |

### SSE → UI Update Flow

```
Filesystem change
  → chokidar event (debounced 100ms)
    → Artifact Engine updates in-memory index
      → EventBus emits SSE event
        → useSSE() dispatches to registered handlers
          → useArtifacts() updates local Map → ArtifactSidebar re-renders
          → useRoleStatuses() updates Map → MascotCards re-render
          → useNextAction() re-fetches on "complete" → NextActionBanner updates
```

---

## Responsive Behavior

MVP is desktop-only per spec. Minimum supported width: 1024px.

- Below 1024px: layout overflows — no responsive handling, no breakpoint rules
- Sidebar: always visible, never collapses
- LaunchDrawer: overlays content (does not stack or become full-screen)
- No mobile-specific CSS needed

---

## Accessibility

- All interactive elements (`MascotCard`, nav links, drawer close, collapse triggers) are `<button>` elements or `<a>` elements — not div-with-onClick
- `LaunchDrawer` (Sheet) traps focus when open. Escape key closes it. Focus returns to the originating MascotCard on close.
- `DecisionQueue` collapse toggle: `aria-expanded` attribute on the trigger
- Color is never the sole differentiator — every status has a text label alongside color
- `Badge` components include `aria-label` when the visual text alone may be ambiguous
- All `Input` elements have visible `<label>` elements (not just placeholder text)
- Tab order follows reading order (left sidebar → main content → drawer when open)

---

## Role Count Resolution

TASK-012 and the handoff packet both confirm 7 roles: Orchestrator, Architect, Researcher, Designer, Developer, Validator, QA Tester. The MascotGrid always renders cards for all 7 roles. If a role does not have a startup prompt on disk (`docs/agents/startup-prompts/{role}.md` is missing), its card renders in idle state with the Launch Drawer showing a missing-files warning rather than silently hiding the card. This makes gaps in the project structure visible to the user.