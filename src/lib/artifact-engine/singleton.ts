/**
 * Singleton initializer for the Artifact Engine.
 *
 * Ensures the ArtifactIndex is created and started only once per server
 * process. Wires index events to the EventBus so SSE clients receive
 * real-time updates.
 *
 * All API routes that need artifact data should import `getArtifactIndex()`
 * from this module rather than constructing their own ArtifactIndex.
 */

import { ArtifactIndex } from "./index";
import { eventBus } from "./event-bus";
import { getSettings } from "@/lib/settings";
import { clearManifestCache } from "@/lib/manifest";

let instance: ArtifactIndex | null = null;
let currentProjectPath: string | null = null;

/**
 * Returns the running ArtifactIndex singleton.
 * Starts (or restarts) the engine if the project path has changed.
 * Returns null if no project path is configured.
 */
export async function getArtifactIndex(): Promise<ArtifactIndex | null> {
  const settings = getSettings();
  const projectPath = settings.projectPath;

  if (!projectPath) {
    return null;
  }

  // Restart if project path changed
  if (instance && currentProjectPath !== projectPath) {
    await instance.stop();
    instance = null;
    currentProjectPath = null;
    clearManifestCache();
  }

  if (!instance) {
    const idx = new ArtifactIndex(projectPath);

    // Wire index events to the EventBus
    idx.on("change", (record) => {
      eventBus.emitArtifactChanged(record);
    });
    idx.on("remove", (relativePath) => {
      eventBus.emitArtifactRemoved(relativePath);
    });
    idx.on("error", (...args: unknown[]) => {
      // Surface watcher errors (e.g. project folder deleted while running)
      const err = args[0];
      const errMsg = err instanceof Error ? err.message : String(err);
      const message =
        errMsg.toLowerCase().includes("enoent") ||
        errMsg.toLowerCase().includes("no such file")
          ? "Project folder not found. Please re-attach your project."
          : `Watcher error: ${errMsg}`;
      eventBus.emitProjectError(message);
    });

    await idx.start();
    instance = idx;
    currentProjectPath = projectPath;
  }

  return instance;
}

/**
 * Returns the ArtifactIndex synchronously without starting it.
 * Used in contexts where async is not available. Returns null if not yet
 * initialized.
 */
export function getArtifactIndexSync(): ArtifactIndex | null {
  return instance;
}
