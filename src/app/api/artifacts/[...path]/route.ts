/**
 * GET /api/artifacts/:path
 *
 * Returns a single artifact's metadata and raw markdown content.
 * The path segments are joined to reconstruct the relative file path.
 *
 * Response: { artifact: ArtifactRecord, content: string }
 * 404 if the artifact is not in the index.
 */

import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { getArtifactIndex } from "@/lib/artifact-engine/singleton";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { path: string[] } }
): Promise<NextResponse> {
  const index = await getArtifactIndex();
  const settings = getSettings();
  const projectPath = settings.projectPath;

  if (!index || !projectPath) {
    return NextResponse.json({ error: "No project attached" }, { status: 404 });
  }

  // Reconstruct relative path from URL segments
  const relativePath = params.path.join("/");

  const artifact = index.getByPath(relativePath);
  if (!artifact) {
    return NextResponse.json({ error: "Artifact not found" }, { status: 404 });
  }

  // Read raw content from disk
  const absolutePath = path.join(projectPath, relativePath);
  let content: string;
  try {
    content = fs.readFileSync(absolutePath, "utf-8");
  } catch {
    return NextResponse.json(
      { error: "File could not be read" },
      { status: 404 }
    );
  }

  return NextResponse.json({ artifact, content });
}
