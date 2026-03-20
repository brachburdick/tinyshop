import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// .tinyshop/tinyshop.db lives relative to the Tinyshop app root (process.cwd())
const DB_DIR = path.join(process.cwd(), ".tinyshop");
const DB_PATH = path.join(DB_DIR, "tinyshop.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  fs.mkdirSync(DB_DIR, { recursive: true });
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  return db;
}
