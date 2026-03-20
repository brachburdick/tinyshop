/**
 * Compatibility checker.
 *
 * Determines whether a folder contains a compatible pipeline project by
 * reading the pipeline manifest (explicit or auto-detected) and verifying
 * the presence of required files, directories, and entities.
 *
 * Returns a ProjectConfig — never throws.
 */

import fs from "fs";
import path from "path";
import type { ProjectConfig } from "@/types/index";
import { getManifest, detectPipelineVersion } from "./manifest";

/**
 * Attempt to derive a human-readable project name from the bootstrap file.
 */
function deriveProjectName(projectPath: string, bootstrapFile: string): string {
  const bootstrapPath = path.join(projectPath, bootstrapFile);
  try {
    const content = fs.readFileSync(bootstrapPath, "utf-8");
    const match = content.match(/^#\s+(.+)$/m);
    if (match && match[1]) {
      return match[1].trim();
    }
  } catch {
    // Fall through to folder name
  }

  return path.basename(projectPath);
}

/**
 * Check whether the directory at `projectPath` contains a compatible
 * pipeline project structure.
 */
export function checkCompatibility(projectPath: string): ProjectConfig {
  const manifest = getManifest(projectPath);
  const version = detectPipelineVersion(projectPath);
  const missing: string[] = [];

  // Check required files
  for (const file of manifest.compatibility.requiredFiles) {
    const fullPath = path.join(projectPath, file);
    try {
      fs.statSync(fullPath);
    } catch {
      missing.push(file);
    }
  }

  // Check required directories
  for (const dir of manifest.compatibility.requiredDirs) {
    const fullPath = path.join(projectPath, dir);
    try {
      const stat = fs.statSync(fullPath);
      if (!stat.isDirectory()) {
        missing.push(dir);
      }
    } catch {
      missing.push(dir);
    }
  }

  // Check entity validation (e.g. at least one role preamble in v1.8)
  const ev = manifest.compatibility.entityValidation;
  if (ev) {
    const entityDir = path.join(projectPath, ev.dir);
    let entityCount = 0;
    try {
      const entries = fs.readdirSync(entityDir);
      for (const entry of entries) {
        if (!entry.endsWith(".md")) continue;
        if (ev.excludeFiles.includes(entry)) continue;
        entityCount++;
      }
    } catch {
      // directory missing — already flagged via requiredFiles/requiredDirs
    }

    if (entityCount < ev.minCount) {
      missing.push(`${ev.dir}/ (at least ${ev.minCount} entity file required)`);
    }
  }

  const projectName = deriveProjectName(projectPath, manifest.paths.bootstrap);

  return {
    projectPath,
    projectName,
    pipelineVersion: version,
    compatible: missing.length === 0,
    missing,
  };
}
