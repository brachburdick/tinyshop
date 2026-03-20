/**
 * Smoke test for the compatibility checker.
 * Run with: npx tsx scripts/test-compatibility.ts
 */

import fs from "fs";
import os from "os";
import path from "path";
import { checkCompatibility } from "../src/lib/compatibility";

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

// ---- Tests -----------------------------------------------------------------

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ts-compat-"));

console.log("\n--- Compatibility: empty folder ---");
{
  const empty = path.join(tmpDir, "empty");
  fs.mkdirSync(empty);
  const result = checkCompatibility(empty);
  assert("compatible is false", result.compatible === false);
  assert("missing contains AGENT_BOOTSTRAP.md", result.missing.includes("AGENT_BOOTSTRAP.md"));
  assert("missing contains preambles/COMMON_RULES.md", result.missing.includes("preambles/COMMON_RULES.md"));
  assert("missing contains templates", result.missing.includes("templates"));
  assert("missing contains docs/agents/orchestrator-state.md", result.missing.includes("docs/agents/orchestrator-state.md"));
  assert("projectName falls back to folder name", result.projectName === "empty");
}

console.log("\n--- Compatibility: valid project ---");
{
  const valid = path.join(tmpDir, "valid");
  // Build a minimal valid structure
  fs.mkdirSync(path.join(valid, "preambles"), { recursive: true });
  fs.mkdirSync(path.join(valid, "templates"), { recursive: true });
  fs.mkdirSync(path.join(valid, "docs", "agents"), { recursive: true });

  fs.writeFileSync(
    path.join(valid, "AGENT_BOOTSTRAP.md"),
    "# My Protocol Project\n\nA test project.",
    "utf-8"
  );
  fs.writeFileSync(
    path.join(valid, "preambles", "COMMON_RULES.md"),
    "# Common Rules\n",
    "utf-8"
  );
  fs.writeFileSync(
    path.join(valid, "preambles", "developer.md"),
    "# Role: Developer\n",
    "utf-8"
  );
  fs.writeFileSync(
    path.join(valid, "docs", "agents", "orchestrator-state.md"),
    "# Orchestrator State\n",
    "utf-8"
  );

  const result = checkCompatibility(valid);
  assert("compatible is true", result.compatible === true);
  assert("missing is empty", result.missing.length === 0);
  assert("projectName is from H1", result.projectName === "My Protocol Project");
}

console.log("\n--- Compatibility: missing role preamble only ---");
{
  const noRole = path.join(tmpDir, "no-role");
  fs.mkdirSync(path.join(noRole, "preambles"), { recursive: true });
  fs.mkdirSync(path.join(noRole, "templates"), { recursive: true });
  fs.mkdirSync(path.join(noRole, "docs", "agents"), { recursive: true });

  fs.writeFileSync(
    path.join(noRole, "AGENT_BOOTSTRAP.md"),
    "# No-Role Project\n",
    "utf-8"
  );
  fs.writeFileSync(
    path.join(noRole, "preambles", "COMMON_RULES.md"),
    "# Common Rules\n",
    "utf-8"
  );
  // No role preamble!
  fs.writeFileSync(
    path.join(noRole, "docs", "agents", "orchestrator-state.md"),
    "# Orchestrator State\n",
    "utf-8"
  );

  const result = checkCompatibility(noRole);
  assert("compatible is false (missing role preamble)", result.compatible === false);
  assert("missing mentions role preamble", result.missing.some((m) => m.includes("role preamble")));
}

// ---- Cleanup & summary -----------------------------------------------------

fs.rmSync(tmpDir, { recursive: true, force: true });

console.log(`\n--- done: ${pass} passed, ${fail} failed ---`);
if (fail > 0) process.exit(1);
