/**
 * POST /api/launch
 *
 * Body: { entityId: string } (also accepts { role: string } for backcompat)
 *
 * Integration flow:
 *   1. Assemble the launch package for the given entity.
 *   2. Register expectedOutput with the CompletionTracker.
 *   3. Emit status-update { entityId, status: "launched" } via EventBus.
 *   4. Open Terminal.app with the terminal command via osascript.
 *   5. Return { success: boolean }.
 */

import { NextRequest, NextResponse } from "next/server";
import { assembleLaunchPackage } from "@/lib/launch-package";
import { launchTerminal } from "@/lib/terminal-launcher";
import { completionTracker } from "@/lib/artifact-engine/completion-tracker";
import { eventBus } from "@/lib/artifact-engine/event-bus";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { error: "Missing required field: entityId" },
      { status: 400 }
    );
  }

  const record = body as Record<string, unknown>;
  const entityId = (typeof record.entityId === "string" ? record.entityId : null)
    ?? (typeof record.role === "string" ? record.role : null);

  if (!entityId) {
    return NextResponse.json(
      { error: "Missing required field: entityId" },
      { status: 400 }
    );
  }

  const settings = getSettings();
  const projectPath = settings.projectPath;

  if (!projectPath) {
    return NextResponse.json({ error: "No project attached" }, { status: 404 });
  }

  // Step 1: Assemble launch package
  const launchPackage = assembleLaunchPackage(entityId, projectPath);

  if (!launchPackage) {
    return NextResponse.json(
      { error: `Entity not found in manifest: ${entityId}` },
      { status: 404 }
    );
  }

  // Step 2: Register expectedOutput watch BEFORE emitting launched so the
  // tracker is ready if the file appears very quickly
  if (launchPackage.expectedOutput) {
    await completionTracker.watch(entityId, launchPackage.expectedOutput, projectPath);
  }

  // Step 3: Emit launched status
  eventBus.broadcast({
    type: "status-update",
    data: { entityId, status: "launched" },
  });

  // Step 4: Open terminal
  const launchResult = await launchTerminal(launchPackage.terminalCommand);

  if (!launchResult.success) {
    return NextResponse.json(
      { success: false, error: launchResult.error },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
