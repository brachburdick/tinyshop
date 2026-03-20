/**
 * Smoke test for the frontmatter parser.
 * Run with: npx tsx scripts/test-parser.ts
 */

import fs from "fs";
import os from "os";
import path from "path";
import { parseArtifact, deriveArtifactType } from "../src/lib/artifact-engine/parser";

// ---- Helpers ---------------------------------------------------------------

let pass = 0;
let fail = 0;

function assert(label: string, condition: boolean): void {
  if (condition) {
    console.log(`  PASS  ${label}`);
    pass++;
  } else {
    console.error(`  FAIL  ${label}`);
    fail++;
  }
}

// Create a temp workspace
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ts-parser-"));

function writeTmp(name: string, content: string): string {
  const p = path.join(tmpDir, name);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf-8");
  return p;
}

// ---- Tests -----------------------------------------------------------------

console.log("\n--- Parser: valid frontmatter ---");
{
  const filePath = writeTmp("specs/spec.md", `---
status: APPROVED
supersedes: old-spec.md
superseded_by: none
---

# My Spec
`);
  const record = parseArtifact(filePath, tmpDir);
  assert("status is APPROVED", record.status === "APPROVED");
  assert("supersedes is old-spec.md", record.supersedes === "old-spec.md");
  assert("superseded_by is null (value 'none' → null)", record.superseded_by === null);
  assert("type is spec", record.type === "spec");
  assert("name is spec", record.name === "spec");
  assert("path is relative", !path.isAbsolute(record.path));
}

console.log("\n--- Parser: missing frontmatter ---");
{
  const filePath = writeTmp("plans/plan.md", `# A plan without frontmatter\n\nSome content.`);
  const record = parseArtifact(filePath, tmpDir);
  assert("status is unknown", record.status === "unknown");
  assert("supersedes is null", record.supersedes === null);
  assert("superseded_by is null", record.superseded_by === null);
  assert("type is plan", record.type === "plan");
  assert("no throw", true); // reaching here means no throw
}

console.log("\n--- Parser: malformed frontmatter ---");
{
  // Deliberately malformed: unclosed YAML block
  const filePath = writeTmp("handoffs/handoff-bad.md", `---
status: [BROKEN
---
# Handoff
`);
  const record = parseArtifact(filePath, tmpDir);
  // gray-matter may or may not throw on this; either way we should not throw
  assert("status is either parse-error or unknown (no throw)", ["parse-error", "unknown"].includes(record.status));
  assert("no throw", true);
}

console.log("\n--- Parser: unreadable file ---");
{
  const record = parseArtifact(path.join(tmpDir, "nonexistent.md"), tmpDir);
  assert("status is parse-error for missing file", record.status === "parse-error");
  assert("no throw", true);
}

console.log("\n--- Parser: type derivation ---");
{
  const cases: Array<[string, string]> = [
    ["specs/feat-mvp/spec.md", "spec"],
    ["tasks.md", "tasks"],
    ["docs/agents/orchestrator-state.md", "orchestrator-state"],
    ["specs/feat-mvp/sessions/session-summary-001.md", "session-summary"],
    ["specs/feat-mvp/handoffs/handoff-dev.md", "handoff-packet"],
    ["specs/feat-mvp/research-request.md", "research-request"],
    ["specs/feat-mvp/research-findings.md", "research-findings"],
    ["random-file.md", "unknown"],
  ];

  for (const [relPath, expected] of cases) {
    const fullPath = path.join(tmpDir, relPath);
    const type = deriveArtifactType(fullPath, {});
    assert(`${relPath} → ${expected}`, type === expected);
  }
}

// ---- Cleanup & summary -----------------------------------------------------

fs.rmSync(tmpDir, { recursive: true, force: true });

console.log(`\n--- done: ${pass} passed, ${fail} failed ---`);
if (fail > 0) process.exit(1);
