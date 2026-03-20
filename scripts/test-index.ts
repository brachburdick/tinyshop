/**
 * Smoke test for the ArtifactIndex.
 * Run with: npx tsx scripts/test-index.ts
 *
 * Tests initial scan, add/change/unlink via live file ops, and query methods.
 */

import fs from "fs";
import os from "os";
import path from "path";
import { ArtifactIndex } from "../src/lib/artifact-engine/index";

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

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---- Main ------------------------------------------------------------------

async function main(): Promise<void> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ts-index-"));

  // Pre-populate with some files before the index starts
  fs.mkdirSync(path.join(tmpDir, "specs"), { recursive: true });
  fs.writeFileSync(
    path.join(tmpDir, "specs", "spec.md"),
    "---\nstatus: APPROVED\n---\n# Spec\n",
    "utf-8"
  );
  fs.writeFileSync(
    path.join(tmpDir, "tasks.md"),
    "---\nstatus: DRAFT\n---\n# Tasks\n",
    "utf-8"
  );
  // Non-.md file — should be ignored
  fs.writeFileSync(path.join(tmpDir, "README.txt"), "ignore me", "utf-8");

  console.log("\n--- ArtifactIndex: initial scan ---");
  const index = new ArtifactIndex(tmpDir);
  await index.start();

  const all = index.getAll();
  assert("initial scan finds 2 .md files", all.length === 2);
  assert(
    "specs/spec.md is indexed",
    index.getByPath("specs/spec.md") !== null
  );
  assert("tasks.md is indexed", index.getByPath("tasks.md") !== null);
  assert(
    "getByType('spec') returns 1",
    index.getByType("spec").length === 1
  );
  assert(
    "getByType('tasks') returns 1",
    index.getByType("tasks").length === 1
  );

  console.log("\n--- ArtifactIndex: add event ---");
  const newFile = path.join(tmpDir, "docs", "agents", "orchestrator-state.md");
  fs.mkdirSync(path.dirname(newFile), { recursive: true });
  fs.writeFileSync(newFile, "---\nstatus: ACTIVE\n---\n# Orchestrator State\n", "utf-8");
  await wait(500);
  assert(
    "new file added to index",
    index.getByPath("docs/agents/orchestrator-state.md") !== null
  );
  assert("total records now 3", index.getAll().length === 3);

  console.log("\n--- ArtifactIndex: change event ---");
  fs.writeFileSync(
    path.join(tmpDir, "tasks.md"),
    "---\nstatus: APPROVED\n---\n# Tasks Updated\n",
    "utf-8"
  );
  await wait(500);
  const tasks = index.getByPath("tasks.md");
  assert("tasks.md status updated to APPROVED", tasks?.status === "APPROVED");

  console.log("\n--- ArtifactIndex: unlink event ---");
  fs.unlinkSync(path.join(tmpDir, "tasks.md"));
  await wait(500);
  assert("tasks.md removed from index", index.getByPath("tasks.md") === null);
  assert("total records now 2", index.getAll().length === 2);

  console.log("\n--- ArtifactIndex: getByPath with absolute path ---");
  const absPath = path.join(tmpDir, "specs", "spec.md");
  const byAbs = index.getByPath(absPath);
  assert("getByPath works with absolute path", byAbs !== null && byAbs.name === "spec");

  // ---- Cleanup ----
  await index.stop();
  fs.rmSync(tmpDir, { recursive: true, force: true });

  console.log(`\n--- done: ${pass} passed, ${fail} failed ---`);
  if (fail > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Index test crashed:", err);
  process.exit(1);
});
