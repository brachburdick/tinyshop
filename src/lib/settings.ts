import { getDb } from "./db";
import type { Settings } from "@/types/index";

function getSetting(key: string): string | null {
  const db = getDb();
  const row = db
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

function setSetting(key: string, value: string): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO settings (key, value, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  ).run(key, value);
}

function deleteSetting(key: string): void {
  const db = getDb();
  db.prepare("DELETE FROM settings WHERE key = ?").run(key);
}

/**
 * Returns the current application settings.
 * Both fields are null if not yet configured.
 */
export function getSettings(): Settings {
  return {
    projectPath: getSetting("projectPath"),
    anthropicApiKey: getSetting("anthropicApiKey"),
  };
}

/**
 * Merges the provided partial settings into the persisted values.
 * Pass null for a field to clear it. Returns the full updated settings.
 */
export function updateSettings(partial: Partial<Settings>): Settings {
  if ("projectPath" in partial) {
    if (partial.projectPath === null) {
      deleteSetting("projectPath");
    } else {
      setSetting("projectPath", partial.projectPath!);
    }
  }

  if ("anthropicApiKey" in partial) {
    if (partial.anthropicApiKey === null) {
      deleteSetting("anthropicApiKey");
    } else {
      setSetting("anthropicApiKey", partial.anthropicApiKey!);
    }
  }

  return getSettings();
}
