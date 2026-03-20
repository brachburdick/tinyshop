/**
 * GET /api/settings  — Return current settings
 * PUT /api/settings  — Merge partial settings update, return updated settings
 */

import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/settings";
import type { Settings } from "@/types/index";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const settings = getSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  let body: Partial<Settings>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const updated = updateSettings(body);
  return NextResponse.json(updated);
}
