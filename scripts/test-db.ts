/**
 * Quick smoke test for SQLite + settings service.
 * Run with: npx tsx scripts/test-db.ts
 *
 * Updated for Phase 1 refactor: uses getSettings/updateSettings from src/lib/settings.ts
 */
import { getSettings, updateSettings } from "../src/lib/settings";

console.log("--- Settings smoke test ---");

// Test initial state returns nulls
const initial = getSettings();
console.log(`getSettings() returns object: ${typeof initial === "object" ? "PASS" : "FAIL"}`);

// Test updateSettings + getSettings round-trip (projectPath)
updateSettings({ projectPath: "/tmp/my-project" });
const after = getSettings();
console.log(
  `updateSettings projectPath: ${after.projectPath} (expected: /tmp/my-project) ${after.projectPath === "/tmp/my-project" ? "PASS" : "FAIL"}`
);

// Test updateSettings (anthropicApiKey)
updateSettings({ anthropicApiKey: "sk-test-key" });
const withKey = getSettings();
console.log(
  `updateSettings anthropicApiKey: ${withKey.anthropicApiKey ? "SET" : "NOT SET"} ${withKey.anthropicApiKey === "sk-test-key" ? "PASS" : "FAIL"}`
);

// Test clear (null)
updateSettings({ projectPath: null });
const cleared = getSettings();
console.log(
  `updateSettings clear projectPath: ${cleared.projectPath} (expected: null) ${cleared.projectPath === null ? "PASS" : "FAIL"}`
);

console.log("--- done ---");
