"use client";

import { useState, useEffect, useCallback } from "react";
import { useSSEListener } from "./useSSE";
import type { DecisionItem } from "@/types";

const POLL_INTERVAL = 30_000;

export function useDecisions() {
  const [decisions, setDecisions] = useState<DecisionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDecisions = useCallback(async () => {
    try {
      const res = await fetch("/api/decisions");
      if (res.ok) {
        const data = (await res.json()) as DecisionItem[];
        setDecisions(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDecisions();
    const interval = setInterval(fetchDecisions, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchDecisions]);

  // Also update from SSE
  useSSEListener(
    useCallback(
      (event) => {
        if (event.type === "decision-found") {
          setDecisions((prev) => {
            const exists = prev.some((d) => d.id === event.data.id);
            if (exists) return prev;
            return [event.data, ...prev];
          });
        }
      },
      []
    )
  );

  return { decisions, loading };
}
