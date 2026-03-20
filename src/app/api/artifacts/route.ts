/**
 * GET /api/artifacts
 *
 * Returns all indexed artifact records.
 * Optional query param: ?type=string to filter by artifact type.
 */

import { NextRequest, NextResponse } from "next/server";
import { getArtifactIndex } from "@/lib/artifact-engine/singleton";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const index = await getArtifactIndex();

  if (!index) {
    return NextResponse.json([], { status: 200 });
  }

  const { searchParams } = new URL(req.url);
  const typeParam = searchParams.get("type");

  const artifacts = typeParam ? index.getByType(typeParam) : index.getAll();

  return NextResponse.json(artifacts);
}
