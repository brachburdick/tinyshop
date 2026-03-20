/**
 * GET /api/manifest
 *
 * Returns the resolved pipeline manifest for the currently attached project.
 * Includes auto-detected version and entity list for frontend rendering.
 */

import { NextResponse } from "next/server";
import { getManifest } from "@/lib/manifest";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const settings = getSettings();
  const projectPath = settings.projectPath;

  if (!projectPath) {
    return NextResponse.json(
      { error: "No project attached" },
      { status: 404 }
    );
  }

  const manifest = getManifest(projectPath);
  return NextResponse.json(manifest);
}
