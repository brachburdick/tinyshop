/**
 * POST /api/launch
 *
 * Body: { role: string }
 *
 * Integration flow:
 *   1. Assemble the launch package for the given role.
 *   2. Register expectedOutput with the CompletionTracker.
 *   3. Emit status-update { role, status: "launched" } via EventBus.
 *   4. Open Terminal.app with the terminal command via osascript.
 *   5. Return { success: boolean }.
 *
 * Returns 400 if role is missing.
 * Returns 404 if no project is attached or the role's startup prompt doesn't exist.
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

  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as Record<string, unknown>).role !== "string"
  ) {
    return NextResponse.json(
      { error: "Missing required field: role" },
      { status: 400 }
    );
  }

  const role = (body as Record<string, unknown>).role as string;

  const settings = getSettings();
  const projectPath = settings.projectPath;

  if (!projectPath) {
    return NextResponse.json({ error: "No project attached" }, { status: 404 });
  }

  // Step 1: Assemble launch package
  const launchPackage = assembleLaunchPackage(role, projectPath);

  if (!launchPackage) {
    return NextResponse.json(
      { error: `Startup prompt not found for role: ${role}` },
      { status: 404 }
    );
  }

  // Step 2: Register expectedOutput watch BEFORE emitting launched so the
  // tracker is ready if the file appears very quickly
  if (launchPackage.expectedOutput) {
    await completionTracker.watch(role, launchPackage.expectedOutput, projectPath);
  }

  // Step 3: Emit launched status
  eventBus.broadcast({
    type: "status-update",
    data: { role, status: "launched" },
  });

  // Step 4: Open terminal (non-blocking — we return success even if the
  // terminal open itself had an issue, because the package was assembled)
  const launchResult = await launchTerminal(launchPackage.terminalCommand);

  if (!launchResult.success) {
    // Terminal open failed but we already emitted launched — return the error
    // so the frontend can surface it, while still reporting the launch attempt
    return NextResponse.json(
      { success: false, error: launchResult.error },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
