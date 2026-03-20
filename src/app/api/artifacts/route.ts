/**
 * GET /api/artifacts
 *
 * Returns all indexed artifact records.
 * Optional query param: ?type=ArtifactType
 */

import { NextRequest, NextResponse } from "next/server";
import { getArtifactIndex } from "@/lib/artifact-engine/singleton";
import type { ArtifactType } from "@/types/index";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const index = await getArtifactIndex();

  if (!index) {
    return NextResponse.json([], { status: 200 });
  }

  const { searchParams } = new URL(req.url);
  const typeParam = searchParams.get("type") as ArtifactType | null;

  const artifacts = typeParam ? index.getByType(typeParam) : index.getAll();

  return NextResponse.json(artifacts);
}
