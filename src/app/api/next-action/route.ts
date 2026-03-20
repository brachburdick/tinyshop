/**
 * GET /api/next-action
 *
 * Returns the recommended next entity to dispatch based on the pipeline
 * state source. Works with both v1.8 (orchestrator-state.md) and v1.9
 * (tasks.jsonl) pipelines.
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
      entityId: "unknown",
      entityLabel: "Unknown",
      reason: "Unable to determine — no project attached",
      launchPackageUrl: "",
    });
  }

  const nextAction = deriveNextAction(projectPath);
  return NextResponse.json(nextAction);
}
