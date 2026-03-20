/**
 * Chokidar-based file watcher for protocol artifact directories.
 * Watches .md files recursively, debounces rapid changes, and emits
 * typed events: "add", "change", "unlink".
 *
 * Usage:
 *   const emitter = startWatcher("/path/to/project", projectRoot);
 *   emitter.on("add", (record) => { ... });
 *   emitter.on("change", (record) => { ... });
 *   emitter.on("unlink", (relativePath) => { ... });
 */

import chokidar from "chokidar";
import { EventEmitter } from "events";
import path from "path";
import { parseArtifact } from "./parser";
import type { ArtifactRecord } from "@/types/index";

const DEBOUNCE_MS = 100;

export interface WatcherEvents {
  add: (record: ArtifactRecord) => void;
  change: (record: ArtifactRecord) => void;
  unlink: (relativePath: string) => void;
  error: (err: Error) => void;
  ready: () => void;
}

export interface ArtifactWatcher extends EventEmitter {
  on<K extends keyof WatcherEvents>(event: K, listener: WatcherEvents[K]): this;
  emit<K extends keyof WatcherEvents>(
    event: K,
    ...args: Parameters<WatcherEvents[K]>
  ): boolean;
  close(): Promise<void>;
}

/**
 * Start a chokidar watcher on the given project directory.
 *
 * @param projectPath  Absolute path to watch
 * @returns  An EventEmitter with typed add/change/unlink events + a close() method
 */
export function startWatcher(projectPath: string): ArtifactWatcher {
  const emitter = new EventEmitter() as ArtifactWatcher;

  // Debounce map: absolutePath -> timer
  const pending = new Map<string, ReturnType<typeof setTimeout>>();

  function scheduleEmit(event: "add" | "change", filePath: string): void {
    const existing = pending.get(filePath);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      pending.delete(filePath);
      try {
        const record = parseArtifact(filePath, projectPath);
        emitter.emit(event, record);
      } catch {
        // parseArtifact should never throw, but guard defensively
      }
    }, DEBOUNCE_MS);

    pending.set(filePath, timer);
  }

  const watcher = chokidar.watch(projectPath, {
    ignored: [
      /(^|[/\\])\.[^./]/, // hidden files/dirs (like .git)
      /node_modules/,
      /\.tinyshop/,
    ],
    persistent: true,
    ignoreInitial: false,
    depth: undefined,
    // Only watch .md files
    // chokidar doesn't support glob directly in watch path for v4; we filter in handlers
  });

  watcher.on("add", (filePath: string) => {
    if (!filePath.endsWith(".md")) return;
    scheduleEmit("add", filePath);
  });

  watcher.on("change", (filePath: string) => {
    if (!filePath.endsWith(".md")) return;
    scheduleEmit("change", filePath);
  });

  watcher.on("unlink", (filePath: string) => {
    if (!filePath.endsWith(".md")) return;
    // Cancel any pending debounced emit for this file
    const existing = pending.get(filePath);
    if (existing) {
      clearTimeout(existing);
      pending.delete(filePath);
    }
    const relativePath = path.relative(projectPath, filePath);
    emitter.emit("unlink", relativePath);
  });

  watcher.on("error", (err: unknown) => {
    emitter.emit("error", err instanceof Error ? err : new Error(String(err)));
  });

  watcher.on("ready", () => {
    emitter.emit("ready");
  });

  // Attach close method to the emitter
  (emitter as ArtifactWatcher).close = async () => {
    // Clear all pending debounce timers
    for (const timer of Array.from(pending.values())) {
      clearTimeout(timer);
    }
    pending.clear();
    await watcher.close();
  };

  return emitter;
}
