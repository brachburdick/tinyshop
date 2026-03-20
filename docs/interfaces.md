# Interfaces — Tinyshop

Canonical cross-layer contracts and payload shapes. Source of truth for all API routes, SSE events, and shared types.

## Shared Type Definitions

```typescript
// === Core Types ===

interface ArtifactRecord {
  path: string;              // relative to project root
  name: string;              // filename without extension
  type: ArtifactType;        // derived from path and frontmatter
  status: string;            // from frontmatter, e.g. "DRAFT", "APPROVED", "parse-error"
  supersedes: string | null;
  superseded_by: string | null;
  lastModified: string;      // ISO 8601
  frontmatter: Record<string, unknown>; // full parsed frontmatter
}

type ArtifactType =
  | "spec"
  | "plan"
  | "tasks"
  | "session-summary"
  | "handoff-packet"
  | "validator-verdict"
  | "qa-verdict"
  | "research-request"
  | "research-findings"
  | "orchestrator-state"
  | "unknown";

interface LaunchPackage {
  role: string;
  roleDescription: string;   // plain-language description
  dispatchMode: string;       // "DIRECT" or "ORCHESTRATOR"
  filesToLoad: LaunchFile[];
  startupPrompt: string;      // content of the startup prompt
  expectedOutput: string;     // expected output artifact path
  completionChecklist: string[];
  terminalCommand: string;    // assembled CLI command
}

interface LaunchFile {
  path: string;               // relative to project root
  purpose: string;            // why this file is included
  missing: boolean;           // true if file doesn't exist on disk
}

interface NextAction {
  role: string;
  reason: string;             // plain-language explanation
  launchPackageUrl: string;   // link to GET the launch package
}

interface DecisionItem {
  id: string;                 // deterministic hash of source + line
  marker: "[DECISION NEEDED]" | "[ASK OPERATOR]";
  question: string;           // extracted question text
  sourceFile: string;         // relative path
  lineNumber: number;
  context: string;            // surrounding lines for clarity
}

interface ProjectConfig {
  projectPath: string;
  projectName: string;
  compatible: boolean;
  missing: string[];          // missing required files
}

interface Settings {
  projectPath: string | null;
  anthropicApiKey: string | null;
}
```

## SSE Event Payloads

Endpoint: `GET /api/events`
Content-Type: `text/event-stream`

All events are JSON-serialized on a single line in the SSE `data:` field.

```typescript
type SSEEvent =
  | { type: "artifact-changed"; data: ArtifactRecord }
  | { type: "artifact-removed"; data: { path: string } }
  | { type: "status-update"; data: { role: string; status: RoleStatus } }
  | { type: "decision-found"; data: DecisionItem }
  | { type: "connected"; data: { projectPath: string } }
  | { type: "project-error"; data: { message: string } };

type RoleStatus = "idle" | "launched" | "awaiting-output" | "complete";
```

### Field Inventory — SSE Events

| Event Type | Field | Type | Required | Notes |
|------------|-------|------|----------|-------|
| `artifact-changed` | `data` | `ArtifactRecord` | yes | Full artifact record with parsed frontmatter |
| `artifact-removed` | `data.path` | `string` | yes | Relative path of removed file |
| `status-update` | `data.role` | `string` | yes | TINY role name |
| `status-update` | `data.status` | `RoleStatus` | yes | New status value |
| `decision-found` | `data` | `DecisionItem` | yes | Full decision item |
| `connected` | `data.projectPath` | `string` | yes | Attached project path |
| `project-error` | `data.message` | `string` | yes | Error description (e.g. project folder deleted) |

## API Route Contracts

### GET /api/artifacts
- **Response:** `ArtifactRecord[]`
- **Query params:** `?type=ArtifactType` (optional filter)

### GET /api/artifacts/:path
- **Response:** `{ artifact: ArtifactRecord; content: string }`
- **Errors:** 404 if artifact not found

### GET /api/launch-package
- **Query params:** `?role=string` (required)
- **Response:** `LaunchPackage`
- **Errors:** 404 if role startup prompt not found

### POST /api/launch
- **Body:** `{ role: string }`
- **Response:** `{ success: boolean }`
- **Side effect:** Opens Terminal.app with pre-filled command. Updates role status to "launched".

### GET /api/next-action
- **Response:** `NextAction`
- **Fallback:** `{ role: "unknown", reason: "Unable to determine...", launchPackageUrl: "" }`

### GET /api/decisions
- **Response:** `DecisionItem[]`

### GET /api/events
- **Response:** `text/event-stream` (SSE)
- **Events:** See SSE Event Payloads above

### GET /api/settings
- **Response:** `Settings`

### PUT /api/settings
- **Body:** `Partial<Settings>`
- **Response:** `Settings` (updated)

### POST /api/projects/scaffold
- **Body:** `{ name: string; stack: string; description: string; path: string }`
- **Response:** `ProjectConfig`
- **Side effect:** Creates directory structure at `path`

### POST /api/projects/attach
- **Body:** `{ path: string }`
- **Response:** `ProjectConfig`
- **Side effect:** Updates settings with project path if compatible
