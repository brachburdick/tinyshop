/**
 * EventBus bridges ArtifactIndex events to SSE client connections.
 *
 * The singleton EventBus subscribes to the global ArtifactIndex and
 * fans out SSEEvent payloads to all connected HTTP clients.
 *
 * Usage:
 *   eventBus.subscribe(controller);   // in GET /api/events
 *   eventBus.unsubscribe(controller); // on client disconnect
 */

import type { SSEEvent, ArtifactRecord } from "@/types/index";

type SendFn = (event: SSEEvent) => void;

class EventBus {
  private subscribers: Set<SendFn> = new Set();

  /** Register a new SSE client send function. */
  subscribe(send: SendFn): void {
    this.subscribers.add(send);
  }

  /** Remove an SSE client (call on disconnect). */
  unsubscribe(send: SendFn): void {
    this.subscribers.delete(send);
  }

  /** Broadcast an event to all connected clients. */
  broadcast(event: SSEEvent): void {
    for (const send of Array.from(this.subscribers)) {
      try {
        send(event);
      } catch {
        // Client likely disconnected; will be cleaned up on next request
        this.subscribers.delete(send);
      }
    }
  }

  /** Convenience: broadcast artifact-changed */
  emitArtifactChanged(record: ArtifactRecord): void {
    this.broadcast({ type: "artifact-changed", data: record });
  }

  /** Convenience: broadcast artifact-removed */
  emitArtifactRemoved(relativePath: string): void {
    this.broadcast({ type: "artifact-removed", data: { path: relativePath } });
  }

  /** Convenience: broadcast a project-level error (e.g. folder deleted) */
  emitProjectError(message: string): void {
    this.broadcast({ type: "project-error", data: { message } });
  }
}

// Singleton — shared across all API route invocations in the same server process
export const eventBus = new EventBus();
