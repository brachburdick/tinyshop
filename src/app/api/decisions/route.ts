/**
 * GET /api/decisions
 *
 * Returns all [DECISION NEEDED] and [ASK OPERATOR] items found in
 * indexed project artifacts.
 */

import { NextResponse } from "next/server";
import { getArtifactIndex } from "@/lib/artifact-engine/singleton";
import { scanDecisions } from "@/lib/decision-scanner";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const index = await getArtifactIndex();
  const settings = getSettings();
  const projectPath = settings.projectPath;

  if (!index || !projectPath) {
    return NextResponse.json([]);
  }

  const decisions = scanDecisions(index, projectPath);
  return NextResponse.json(decisions);
}
