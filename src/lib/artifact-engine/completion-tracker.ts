/**
 * CompletionTracker — singleton that watches for expected output artifacts.
 *
 * After a role is launched, the launch route registers its expected output
 * path here. The CompletionTracker subscribes to the ArtifactIndex and, when
 * a matching file is added or changed, emits a `status-update` SSE event with
 * status: "complete" for that role.
 *
 * Edge case: if the expected output already exists when watch() is called, we
 * record its current mtime so we only fire on a subsequent modification — not
 * on the stale pre-existing file.
 *
 * Usage:
 *   import { completionTracker } from "./completion-tracker";
 *   completionTracker.watch(role, expectedOutputPath, projectPath);
 */

import fs from "fs";
import path from "path";
import { eventBus } from "./event-bus";
import { getArtifactIndex } from "./singleton";
import type { ArtifactRecord } from "@/types/index";

interface WatchEntry {
  /** Absolute path to the expected output file. */
  absolutePath: string;
  /** Relative path (as stored in the ArtifactIndex). */
  relativePath: string;
  /**
   * mtime (ms) of the file at watch-registration time, or null if the file
   * did not exist yet. Used to distinguish re-runs from first-time creation.
   */
  existingMtime: number | null;
}

class CompletionTracker {
  /** Map of role slug → watch entry. */
  private watches: Map<string, WatchEntry> = new Map();

  constructor() {
    // Subscribe to ArtifactIndex change events via a lazy async bootstrap.
    // We cannot call getArtifactIndex() synchronously at module load time
    // because the settings/DB may not be ready. Instead we subscribe the
    // first time watch() is called.
  }

  /**
   * Register a watch for the expected output of a role.
   *
   * @param role           Role slug (e.g. "architect")
   * @param expectedOutput Relative path from the LaunchPackage (relative to projectPath)
   * @param projectPath    Absolute path to the attached project
   */
  async watch(
    role: string,
    expectedOutput: string,
    projectPath: string
  ): Promise<void> {
    if (!expectedOutput) return;

    const absolutePath = path.isAbsolute(expectedOutput)
      ? expectedOutput
      : path.join(projectPath, expectedOutput);

    const relativePath = path.isAbsolute(expectedOutput)
      ? path.relative(projectPath, expectedOutput)
      : expectedOutput;

    // Check whether the file already exists so we can watch for modification
    let existingMtime: number | null = null;
    try {
      const stat = fs.statSync(absolutePath);
      existingMtime = stat.mtimeMs;
    } catch {
      // File doesn't exist yet — null signals first-creation detection
    }

    this.watches.set(role, { absolutePath, relativePath, existingMtime });

    // Ensure we are subscribed to the ArtifactIndex
    await this.ensureSubscribed();
  }

  /**
   * Remove the watch entry for a role (called automatically after completion).
   */
  unwatch(role: string): void {
    this.watches.delete(role);
  }

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------

  private subscribed = false;

  /**
   * Subscribe to the ArtifactIndex once. Subsequent calls are no-ops.
   * Handles both "add" and "change" events — both map to the "change" event
   * emitted by ArtifactIndex.
   */
  private async ensureSubscribed(): Promise<void> {
    if (this.subscribed) return;

    const index = await getArtifactIndex();
    if (!index) return; // No project attached yet — will retry on next watch()

    index.on("change", (record: ArtifactRecord) => {
      this.handleArtifactChange(record);
    });

    this.subscribed = true;
  }

  private handleArtifactChange(record: ArtifactRecord): void {
    for (const [role, entry] of Array.from(this.watches.entries())) {
      // Normalise paths for comparison (strip leading slash variants)
      const recordPath = record.path.replace(/^\/+/, "");
      const watchedPath = entry.relativePath.replace(/^\/+/, "");

      if (recordPath !== watchedPath) continue;

      // If the file existed at launch time, only fire on a new modification
      if (entry.existingMtime !== null) {
        // Parse the ISO lastModified back to ms for comparison
        const recordMtime = new Date(record.lastModified).getTime();
        if (recordMtime <= entry.existingMtime) {
          // Same file, unchanged — skip
          continue;
        }
      }

      // Emit completion event
      eventBus.broadcast({
        type: "status-update",
        data: { entityId: role, status: "complete" },
      });

      // Remove the watch — completion is a one-shot event
      this.watches.delete(role);
    }
  }
}

// Singleton — shared across all API route invocations in the same process
export const completionTracker = new CompletionTracker();
