/**
 * GET /api/next-action
 *
 * Returns the recommended next role to dispatch based on the orchestrator
 * state file. Gracefully falls back if the file is missing or unparseable.
 */

import { NextResponse } from "next/server";
import { deriveNextAction } from "@/lib/next-action";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const settings = getSettings();
  const projectPath = settings.projectPath;

  if (!projectPath) {
    return NextResponse.json({
      role: "unknown",
      reason: "Unable to determine — no project attached",
      launchPackageUrl: "",
    });
  }

  const nextAction = deriveNextAction(projectPath);
  return NextResponse.json(nextAction);
}
