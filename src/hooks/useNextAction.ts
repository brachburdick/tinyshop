"use client";

import { useState, useEffect, useCallback } from "react";
import { useSSEListener } from "./useSSE";
import type { NextAction } from "@/types";

export function useNextAction() {
  const [nextAction, setNextAction] = useState<NextAction | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNextAction = useCallback(async () => {
    try {
      const res = await fetch("/api/next-action");
      if (res.ok) {
        const data = (await res.json()) as NextAction;
        setNextAction(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNextAction();
  }, [fetchNextAction]);

  // Re-fetch when a role completes
  useSSEListener(
    useCallback(
      (event) => {
        if (
          event.type === "status-update" &&
          event.data.status === "complete"
        ) {
          fetchNextAction();
        }
      },
      [fetchNextAction]
    )
  );

  return { nextAction, loading, refetch: fetchNextAction };
}
