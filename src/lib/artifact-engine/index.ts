/**
 * In-memory artifact index.
 *
 * Maintains a Map<relativePath, ArtifactRecord> that stays in sync with the
 * filesystem via the file watcher. On startup it does a full directory scan
 * to populate the index, then watches for incremental changes.
 *
 * Exposes change events for the SSE layer to subscribe to.
 *
 * Usage:
 *   const index = new ArtifactIndex("/path/to/project");
 *   await index.start();
 *   index.on("change", (record) => { ... });
 *   index.on("remove", (path) => { ... });
 */

import { EventEmitter } from "events";
import fs from "fs";
import path from "path";
import { startWatcher } from "./watcher";
import { parseArtifact } from "./parser";
import type { ArtifactRecord } from "@/types/index";

export interface ArtifactIndexEvents {
  /** Fired when an artifact is added or updated in the index */
  change: (record: ArtifactRecord) => void;
  /** Fired when an artifact is removed from the index */
  remove: (relativePath: string) => void;
  /** Fired when the initial scan is complete and the watcher is ready */
  ready: () => void;
}

export class ArtifactIndex extends EventEmitter {
  private projectPath: string;
  private records: Map<string, ArtifactRecord> = new Map();
  private watcherClose: (() => Promise<void>) | null = null;

  constructor(projectPath: string) {
    super();
    this.projectPath = projectPath;
  }

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  /**
   * Perform an initial directory scan, then attach the file watcher.
   * Resolves when the watcher has fired its "ready" event.
   */
  start(): Promise<void> {
    return new Promise((resolve) => {
      // Full initial scan
      this.scanDirectory(this.projectPath);

      const watcher = startWatcher(this.projectPath);
      this.watcherClose = watcher.close.bind(watcher);

      watcher.on("add", (record) => {
        this.upsert(record);
      });

      watcher.on("change", (record) => {
        this.upsert(record);
      });

      watcher.on("unlink", (relativePath) => {
        this.remove(relativePath);
      });

      watcher.on("ready", () => {
        this.emit("ready");
        resolve();
      });

      watcher.on("error", (err) => {
        this.emit("error", err);
      });
    });
  }

  /** Stop the watcher and clear the index. */
  async stop(): Promise<void> {
    if (this.watcherClose) {
      await this.watcherClose();
      this.watcherClose = null;
    }
    this.records.clear();
  }

  // -------------------------------------------------------------------------
  // Query API
  // -------------------------------------------------------------------------

  /** Returns all indexed artifact records. */
  getAll(): ArtifactRecord[] {
    return Array.from(this.records.values());
  }

  /** Returns all artifacts of a given type. */
  getByType(type: string): ArtifactRecord[] {
    return this.getAll().filter((r) => r.type === type);
  }

  /**
   * Returns the artifact at the given path, or null.
   * Accepts either a relative path (relative to project root) or an absolute path.
   */
  getByPath(filePath: string): ArtifactRecord | null {
    // Normalise to relative
    const relative = path.isAbsolute(filePath)
      ? path.relative(this.projectPath, filePath)
      : filePath;
    return this.records.get(relative) ?? null;
  }

  // -------------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------------

  private upsert(record: ArtifactRecord): void {
    this.records.set(record.path, record);
    this.emit("change", record);
  }

  private remove(relativePath: string): void {
    this.records.delete(relativePath);
    this.emit("remove", relativePath);
  }

  /**
   * Recursively walk a directory and parse every .md file found.
   * Skips node_modules, .git, .tinyshop.
   */
  private scanDirectory(dir: string): void {
    const IGNORED = new Set(["node_modules", ".git", ".tinyshop"]);

    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return; // Unreadable directory — skip silently
    }

    for (const entry of entries) {
      if (IGNORED.has(entry.name)) continue;

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        this.scanDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        try {
          const record = parseArtifact(fullPath, this.projectPath);
          this.records.set(record.path, record);
        } catch {
          // parseArtifact should never throw, but guard defensively
        }
      }
    }
  }

  // Typed event overloads
  on<K extends keyof ArtifactIndexEvents>(
    event: K,
    listener: ArtifactIndexEvents[K]
  ): this;
  on(event: string, listener: (...args: unknown[]) => void): this;
  on(event: string, listener: (...args: unknown[]) => void): this {
    return super.on(event, listener);
  }

  emit<K extends keyof ArtifactIndexEvents>(
    event: K,
    ...args: Parameters<ArtifactIndexEvents[K]>
  ): boolean;
  emit(event: string, ...args: unknown[]): boolean;
  emit(event: string, ...args: unknown[]): boolean {
    return super.emit(event, ...args);
  }
}
