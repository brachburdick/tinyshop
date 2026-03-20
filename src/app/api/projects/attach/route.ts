/**
 * POST /api/projects/attach
 *
 * Checks compatibility of the project at the given path.
 * If compatible, updates settings with the new project path.
 *
 * Body: { path: string }
 * Response: ProjectConfig
 */

import { NextRequest, NextResponse } from "next/server";
import { checkCompatibility } from "@/lib/compatibility";
import { updateSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { path?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { path: projectPath } = body;

  if (!projectPath) {
    return NextResponse.json(
      { error: "Missing required field: path" },
      { status: 400 }
    );
  }

  const config = checkCompatibility(projectPath);

  // If compatible, persist the project path in settings
  if (config.compatible) {
    updateSettings({ projectPath });
  }

  return NextResponse.json(config);
}
