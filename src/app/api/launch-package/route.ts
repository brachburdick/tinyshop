/**
 * GET /api/launch-package?entity={entityId}
 *
 * Returns a LaunchPackage for the specified entity.
 * Also accepts ?role= for backward compatibility.
 * 400 if entity param is missing.
 * 404 if the entity is not found in the manifest.
 */

import { NextRequest, NextResponse } from "next/server";
import { assembleLaunchPackage } from "@/lib/launch-package";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const entityId = searchParams.get("entity") ?? searchParams.get("role");

  if (!entityId) {
    return NextResponse.json(
      { error: "Missing required query param: entity" },
      { status: 400 }
    );
  }

  const settings = getSettings();
  const projectPath = settings.projectPath;

  if (!projectPath) {
    return NextResponse.json({ error: "No project attached" }, { status: 404 });
  }

  const launchPackage = assembleLaunchPackage(entityId, projectPath);

  if (!launchPackage) {
    return NextResponse.json(
      { error: `Entity not found in manifest: ${entityId}` },
      { status: 404 }
    );
  }

  return NextResponse.json(launchPackage);
}
