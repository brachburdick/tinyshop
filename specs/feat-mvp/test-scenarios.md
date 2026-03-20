# Test Scenarios: feat-mvp

---
status: APPROVED
project_root: /Users/brach/Documents/THE_FACTORY/projects/Tinyshop
---

## SSE Real-Time Updates

| Scenario | Trigger | Expected SSE Event | Frontend Effect |
|----------|---------|-------------------|-----------------|
| New artifact file created | Save new `.md` file in watched project dir | `artifact-changed` with full `ArtifactRecord` | Artifact appears in sidebar and index |
| Artifact modified | Edit and save existing `.md` file | `artifact-changed` with updated `lastModified` | Artifact metadata refreshes in all views |
| Artifact deleted | Delete `.md` file from project dir | `artifact-removed` with `{ path }` | Artifact removed from sidebar and index |
| Rapid saves (debounce) | Save same file 5 times in 200ms | Single `artifact-changed` event (debounced) | One update, not five |
| Malformed frontmatter added | Save `.md` with invalid YAML frontmatter | `artifact-changed` with `status: "parse-error"` | Artifact shows parse-error badge |
| Role completion detected | Expected output artifact appears after launch | `status-update` with `status: "complete"` | Mascot card updates to complete state |
| SSE reconnection | Kill and restart server while browser is open | `connected` event after reconnection | Dashboard refreshes from current state |

## Launch-Then-Watch Flow

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| Happy path | Click mascot → Launch → agent writes output artifact | Mascot transitions: idle → launched → complete. Next action updates. |
| Expected output already exists | Click Launch when output file already exists | Role status resets to "launched". Watches for modification, not just creation. |
| Agent fails (no output) | Click Launch → agent session ends without writing output | Role stays in "launched" state. No false completion. User can re-launch. |
| Launch with missing files | Launch package references a file that doesn't exist | Drawer shows warning badges on missing files. Launch still works. |

## Terminal Launch Integration (macOS)

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| Terminal.app opens | Click Launch for any role | Terminal.app opens with `claude` command pre-filled |
| Command is correct | Inspect the pre-filled command | Contains correct startup prompt path and project context |
| AppleScript fallback | AppleScript fails (permissions denied) | Falls back to `open -a Terminal`. May not pre-fill command. |

## Project Setup

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| Scaffold new project | Fill form (name, stack, desc, path) → submit | Directory created with full protocol structure. Passes compatibility check. Redirects to Workshop. |
| Scaffold into non-empty dir | Select folder with existing files | Warning shown. User must confirm before proceeding. |
| Attach compatible project | Select folder with all required protocol files | `compatible: true`. Redirects to Workshop with artifacts loaded. |
| Attach incompatible project | Select folder missing required files | `compatible: false`. Shows list of missing files. Read-only browsing available. |
| Attach non-existent path | Enter a path that doesn't exist | Error message: "Folder not found." |

## Decision Queue

| Scenario | Trigger | Expected Result |
|----------|---------|-----------------|
| Decision markers found | Artifact contains `[DECISION NEEDED]: question text` | Card appears in decision queue with question, source file, and context |
| No decisions pending | No artifacts contain decision markers | Empty state: "No pending decisions" |
| Decision in new artifact | New file with `[ASK OPERATOR]` marker saved to project | Card appears via SSE update without page refresh |

## Edge Cases

| Scenario | Trigger | Expected Result |
|----------|---------|-----------------|
| Project folder deleted at runtime | `rm -rf` the attached project folder | Error message: "Project folder not found." Prompt to re-attach. |
| Orchestrator state missing | Delete `docs/agents/orchestrator-state.md` | "Unable to determine next action" in dashboard. Other features still work. |
| Very large project (100+ artifacts) | Attach a project with many files | Initial scan completes. SSE doesn't flood. Index is usable. |
| Binary file in project dir | `.png` or `.pdf` in watched directory | Ignored by watcher (only `.md` files watched). |
