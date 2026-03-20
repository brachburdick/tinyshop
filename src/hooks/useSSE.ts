"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  createContext,
  useContext,
} from "react";
import type { SSEEvent, ArtifactRecord, RoleStatus } from "@/types";

// ─── SSE Connection Status ────────────────────────────────────────────────────

export type SSEStatus = "connecting" | "connected" | "disconnected";

// ─── SSE Context (shared single EventSource) ─────────────────────────────────

type SSEListener = (event: SSEEvent) => void;

interface SSEContextValue {
  status: SSEStatus;
  projectPath: string | null;
  addListener: (fn: SSEListener) => () => void;
}

export const SSEContext = createContext<SSEContextValue>({
  status: "connecting",
  projectPath: null,
  addListener: () => () => {},
});

export function useSSEContext() {
  return useContext(SSEContext);
}

/**
 * Hook for components that need to listen to SSE events.
 * Must be used inside SSEProvider.
 */
export function useSSEListener(listener: SSEListener) {
  const { addListener } = useSSEContext();
  const listenerRef = useRef(listener);
  listenerRef.current = listener;

  useEffect(() => {
    const remove = addListener((event) => listenerRef.current(event));
    return remove;
  }, [addListener]);
}

/**
 * Core hook that manages the single EventSource connection.
 * Used by SSEProvider — not meant for direct component use.
 */
export function useSSEConnection() {
  const [status, setStatus] = useState<SSEStatus>("connecting");
  const [projectPath, setProjectPath] = useState<string | null>(null);
  const listenersRef = useRef<Set<SSEListener>>(new Set());
  const esRef = useRef<EventSource | null>(null);
  const backoffRef = useRef<number>(2000);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const addListener = useCallback((fn: SSEListener) => {
    listenersRef.current.add(fn);
    return () => {
      listenersRef.current.delete(fn);
    };
  }, []);

  const dispatch = useCallback((event: SSEEvent) => {
    listenersRef.current.forEach((fn) => fn(event));
  }, []);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    setStatus("connecting");

    const es = new EventSource("/api/events");
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as SSEEvent;
        if (event.type === "connected") {
          setProjectPath(event.data.projectPath);
          setStatus("connected");
          backoffRef.current = 2000;
        }
        dispatch(event);
      } catch {
        // ignore malformed events
      }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;
      if (!mountedRef.current) return;
      setStatus("disconnected");

      const delay = backoffRef.current;
      backoffRef.current = Math.min(backoffRef.current * 2, 30000);

      reconnectTimerRef.current = setTimeout(() => {
        if (mountedRef.current) connect();
      }, delay);
    };
  }, [dispatch]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      esRef.current?.close();
      esRef.current = null;
    };
  }, [connect]);

  return { status, projectPath, addListener };
}

// ─── useSSEStatus ─────────────────────────────────────────────────────────────

/** Returns SSE connection status for banner display. */
export function useSSEStatus() {
  const { status } = useSSEContext();
  return status;
}

// ─── useArtifacts ─────────────────────────────────────────────────────────────

/**
 * Maintains a client-side artifact index updated from SSE events.
 * Requires SSEProvider in the tree.
 */
export function useArtifacts() {
  const [artifacts, setArtifacts] = useState<ArtifactRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const res = await fetch("/api/artifacts");
      if (res.ok) {
        const data = (await res.json()) as ArtifactRecord[];
        setArtifacts(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useSSEListener(
    useCallback(
      (event: SSEEvent) => {
        if (event.type === "artifact-changed") {
          setArtifacts((prev) => {
            const idx = prev.findIndex((a) => a.path === event.data.path);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = event.data;
              return next;
            }
            return [...prev, event.data];
          });
        } else if (event.type === "artifact-removed") {
          setArtifacts((prev) =>
            prev.filter((a) => a.path !== event.data.path)
          );
        } else if (event.type === "connected") {
          fetchAll();
        }
      },
      [fetchAll]
    )
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { artifacts, loading };
}

// ─── useRoleStatuses ──────────────────────────────────────────────────────────

/**
 * Tracks role statuses from SSE status-update events.
 * Requires SSEProvider in the tree.
 */
export function useRoleStatuses() {
  const [statuses, setStatuses] = useState<Map<string, RoleStatus>>(new Map());

  useSSEListener(
    useCallback((event: SSEEvent) => {
      if (event.type === "status-update") {
        setStatuses((prev) => {
          const next = new Map(prev);
          next.set(event.data.role, event.data.status);
          return next;
        });
      }
    }, [])
  );

  return statuses;
}
