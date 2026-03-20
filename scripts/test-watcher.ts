/**
 * Live test for the file watcher.
 * Run with: npx tsx scripts/test-watcher.ts
 *
 * Creates a temp directory, starts the watcher, writes/modifies/deletes a
 * .md file, and verifies that the corresponding events fire within 2 seconds.
 */

import fs from "fs";
import os from "os";
import path from "path";
import { startWatcher } from "../src/lib/artifact-engine/watcher";

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
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ts-watcher-"));
  const testFile = path.join(tmpDir, "test-artifact.md");

  const watcher = startWatcher(tmpDir);

  // Track received events
  const events: Array<{ event: string; path: string }> = [];

  watcher.on("add", (record) => {
    console.log(`  [event] add: ${record.path}`);
    events.push({ event: "add", path: record.path });
  });

  watcher.on("change", (record) => {
    console.log(`  [event] change: ${record.path}`);
    events.push({ event: "change", path: record.path });
  });

  watcher.on("unlink", (relativePath) => {
    console.log(`  [event] unlink: ${relativePath}`);
    events.push({ event: "unlink", path: relativePath });
  });

  // Wait for watcher to be ready
  await new Promise<void>((resolve) => watcher.on("ready", resolve));
  console.log("\n--- Watcher ready ---");

  // ---- Test: add ----
  console.log("\n--- Watcher: add event ---");
  fs.writeFileSync(testFile, `---\nstatus: DRAFT\n---\n# Hello\n`, "utf-8");
  await wait(500); // well within 2s budget
  assert("add event fired", events.some((e) => e.event === "add"));

  // ---- Test: change ----
  console.log("\n--- Watcher: change event ---");
  events.length = 0; // reset
  fs.writeFileSync(testFile, `---\nstatus: APPROVED\n---\n# Hello Updated\n`, "utf-8");
  await wait(500);
  assert("change event fired", events.some((e) => e.event === "change"));

  // ---- Test: debounce (rapid writes produce one change event) ----
  console.log("\n--- Watcher: debounce ---");
  events.length = 0;
  for (let i = 0; i < 5; i++) {
    fs.writeFileSync(testFile, `---\nstatus: DRAFT\n---\n# Rapid write ${i}\n`, "utf-8");
  }
  await wait(400); // after debounce settles
  const changeCount = events.filter((e) => e.event === "change").length;
  console.log(`  change events received: ${changeCount} (expected: 1 or 2 due to coalescing)`);
  assert("rapid writes debounced to ≤ 2 events", changeCount <= 2);

  // ---- Test: unlink ----
  console.log("\n--- Watcher: unlink event ---");
  events.length = 0;
  fs.unlinkSync(testFile);
  await wait(500);
  assert("unlink event fired", events.some((e) => e.event === "unlink"));

  // ---- Test: non-.md files ignored ----
  console.log("\n--- Watcher: non-.md files ignored ---");
  events.length = 0;
  fs.writeFileSync(path.join(tmpDir, "ignored.txt"), "should not trigger", "utf-8");
  fs.writeFileSync(path.join(tmpDir, "ignored.json"), "{}", "utf-8");
  await wait(400);
  assert("non-.md files produce no events", events.length === 0);

  // ---- Cleanup ----
  await watcher.close();
  fs.rmSync(tmpDir, { recursive: true, force: true });

  console.log(`\n--- done: ${pass} passed, ${fail} failed ---`);
  if (fail > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Watcher test crashed:", err);
  process.exit(1);
});
