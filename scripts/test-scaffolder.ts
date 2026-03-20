/**
 * Smoke test for the project scaffolder.
 * Run with: npx tsx scripts/test-scaffolder.ts
 *
 * Verifies that scaffoldProject() creates a valid structure that passes
 * the compatibility checker.
 */

import fs from "fs";
import os from "os";
import path from "path";
import { scaffoldProject } from "../src/lib/scaffolder";
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

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ts-scaffold-"));

console.log("\n--- Scaffolder: scaffold into empty directory ---");
{
  const targetPath = path.join(tmpDir, "my-project");
  // Don't create it — scaffolder should create it

  const result = scaffoldProject({
    name: "My Test Project",
    stack: "Next.js, TypeScript",
    description: "A test project for the scaffolder.",
    path: targetPath,
  });

  assert("result.compatible is true", result.compatible === true);
  assert("result.missing is empty", result.missing.length === 0);
  assert("result.projectName matches", result.projectName === "My Test Project");

  // Verify key files exist
  assert(
    "AGENT_BOOTSTRAP.md exists",
    fs.existsSync(path.join(targetPath, "AGENT_BOOTSTRAP.md"))
  );
  assert(
    "preambles/COMMON_RULES.md exists",
    fs.existsSync(path.join(targetPath, "preambles", "COMMON_RULES.md"))
  );
  assert(
    "preambles/developer.md exists",
    fs.existsSync(path.join(targetPath, "preambles", "developer.md"))
  );
  assert(
    "templates/ directory exists",
    fs.existsSync(path.join(targetPath, "templates"))
  );
  assert(
    "docs/agents/orchestrator-state.md exists",
    fs.existsSync(path.join(targetPath, "docs", "agents", "orchestrator-state.md"))
  );
  assert(
    "specs/ directory exists",
    fs.existsSync(path.join(targetPath, "specs"))
  );
  assert(
    "skills/ directory exists",
    fs.existsSync(path.join(targetPath, "skills"))
  );

  // Cross-verify with the compatibility checker
  const compat = checkCompatibility(targetPath);
  assert("compatibility check passes independently", compat.compatible === true);
  assert("compatibility check missing is empty", compat.missing.length === 0);

  // Verify AGENT_BOOTSTRAP.md content
  const bootstrap = fs.readFileSync(
    path.join(targetPath, "AGENT_BOOTSTRAP.md"),
    "utf-8"
  );
  assert("AGENT_BOOTSTRAP.md contains project name", bootstrap.includes("My Test Project"));
  assert("AGENT_BOOTSTRAP.md contains stack", bootstrap.includes("Next.js, TypeScript"));
  assert("AGENT_BOOTSTRAP.md contains description", bootstrap.includes("A test project for the scaffolder."));
}

console.log("\n--- Scaffolder: refuse non-empty directory ---");
{
  const nonEmpty = path.join(tmpDir, "non-empty");
  fs.mkdirSync(nonEmpty);
  fs.writeFileSync(path.join(nonEmpty, "existing-file.txt"), "I exist", "utf-8");

  const result = scaffoldProject({
    name: "Should Fail",
    stack: "none",
    description: "This should refuse.",
    path: nonEmpty,
  });

  assert("result.compatible is false", result.compatible === false);
  assert("result.missing contains refusal message", result.missing.length > 0);
  assert(
    "refusal message mentions non-empty",
    result.missing[0].toLowerCase().includes("not empty")
  );

  // Verify nothing was written
  const entries = fs.readdirSync(nonEmpty);
  assert(
    "existing-file.txt is still the only file",
    entries.length === 1 && entries[0] === "existing-file.txt"
  );
}

// ---- Cleanup & summary -----------------------------------------------------

fs.rmSync(tmpDir, { recursive: true, force: true });

console.log(`\n--- done: ${pass} passed, ${fail} failed ---`);
if (fail > 0) process.exit(1);
