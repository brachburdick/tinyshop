/**
 * GET /api/events
 *
 * Server-Sent Events endpoint. Streams real-time artifact and status
 * updates to connected frontend clients.
 *
 * Events: connected, artifact-changed, artifact-removed, status-update
 */

import { NextRequest } from "next/server";
import { eventBus } from "@/lib/artifact-engine/event-bus";
import { getArtifactIndex } from "@/lib/artifact-engine/singleton";
import { getSettings } from "@/lib/settings";
import type { SSEEvent } from "@/types/index";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function formatSSE(event: SSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function GET(_req: NextRequest): Promise<Response> {
  // Ensure the artifact engine is running
  await getArtifactIndex();

  const settings = getSettings();
  const projectPath = settings.projectPath ?? "";

  // Capture send outside the ReadableStream init so the cancel hook can reference it
  let send: ((event: SSEEvent) => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      send = function sendEvent(event: SSEEvent): void {
        try {
          controller.enqueue(encoder.encode(formatSSE(event)));
        } catch {
          // Controller closed — clean up
          if (send) {
            eventBus.unsubscribe(send);
            send = null;
          }
        }
      };

      // Register with the event bus
      eventBus.subscribe(send);

      // Send the initial connected event
      send({ type: "connected", data: { projectPath } });
    },

    cancel() {
      // Called by the Web Streams API when the client disconnects
      if (send) {
        eventBus.unsubscribe(send);
        send = null;
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
