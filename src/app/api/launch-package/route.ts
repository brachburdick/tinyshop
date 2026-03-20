/**
 * GET /api/launch-package?role={role}
 *
 * Returns a LaunchPackage for the specified role.
 * 400 if role param is missing.
 * 404 if the startup prompt for that role doesn't exist.
 */

import { NextRequest, NextResponse } from "next/server";
import { assembleLaunchPackage } from "@/lib/launch-package";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");

  if (!role) {
    return NextResponse.json(
      { error: "Missing required query param: role" },
      { status: 400 }
    );
  }

  const settings = getSettings();
  const projectPath = settings.projectPath;

  if (!projectPath) {
    return NextResponse.json({ error: "No project attached" }, { status: 404 });
  }

  const launchPackage = assembleLaunchPackage(role, projectPath);

  if (!launchPackage) {
    return NextResponse.json(
      { error: `Startup prompt not found for role: ${role}` },
      { status: 404 }
    );
  }

  return NextResponse.json(launchPackage);
}
