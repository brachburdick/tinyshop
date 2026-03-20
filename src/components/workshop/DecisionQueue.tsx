"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";
import type { DecisionItem } from "@/types";

const POLL_INTERVAL = 30_000; // 30 seconds

export function DecisionQueue() {
  const [items, setItems] = useState<DecisionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const router = useRouter();

  const fetchDecisions = useCallback(async () => {
    try {
      const res = await fetch("/api/decisions");
      if (res.ok) {
        const data = (await res.json()) as DecisionItem[];
        setItems(data);
        // Auto-expand if items exist
        if (data.length > 0) setExpanded(true);
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

  const handleSourceClick = (sourceFile: string) => {
    router.push(`/artifacts?path=${encodeURIComponent(sourceFile)}`);
  };

  return (
    <section className="mt-8">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-2 w-full text-left mb-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ts-accent focus-visible:ring-offset-2 rounded"
      >
        {expanded ? (
          <ChevronDown size={16} className="text-ts-text-muted flex-shrink-0" />
        ) : (
          <ChevronRight size={16} className="text-ts-text-muted flex-shrink-0" />
        )}
        <span className="text-base font-semibold text-ts-text">
          Needs Your Attention
          {items.length > 0 && (
            <span className="ml-2 text-sm font-normal text-ts-text-muted">
              ({items.length})
            </span>
          )}
        </span>
      </button>

      {expanded && (
        <div
          className="space-y-3 overflow-hidden transition-all"
          style={{ maxHeight: expanded ? "9999px" : "0" }}
        >
          {loading ? (
            <div className="space-y-3">
              <div className="h-[72px] rounded-xl bg-ts-surface-alt border border-ts-border animate-pulse" />
              <div className="h-[72px] rounded-xl bg-ts-surface-alt border border-ts-border animate-pulse" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-ts-border bg-ts-surface px-5 py-4 text-sm text-ts-text-muted">
              All clear &mdash; no pending decisions.
            </div>
          ) : (
            items.map((item) => (
              <DecisionCard
                key={item.id}
                item={item}
                onSourceClick={handleSourceClick}
              />
            ))
          )}
        </div>
      )}
    </section>
  );
}

function DecisionCard({
  item,
  onSourceClick,
}: {
  item: DecisionItem;
  onSourceClick: (path: string) => void;
}) {
  const markerColor =
    item.marker === "[DECISION NEEDED]"
      ? "bg-ts-warning/20 text-ts-warning border-ts-warning/50"
      : "bg-ts-launched/20 text-ts-launched border-ts-launched/50";

  return (
    <div className="rounded-xl border border-ts-border bg-ts-surface shadow-sm overflow-hidden flex">
      {/* Left accent border */}
      <div className="w-1 flex-shrink-0 bg-ts-warning" />
      <div className="flex-1 p-4">
        <div className="flex items-start gap-3 mb-2">
          <span
            className={[
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
              markerColor,
            ].join(" ")}
          >
            {item.marker}
          </span>
        </div>
        <p className="text-sm text-ts-text mb-2">{item.question}</p>
        {item.context && (
          <blockquote className="border-l-2 border-ts-border pl-3 text-xs text-ts-text-muted mb-2 italic">
            {item.context}
          </blockquote>
        )}
        <button
          onClick={() => onSourceClick(item.sourceFile)}
          className="flex items-center gap-1.5 text-xs text-ts-text-muted hover:text-ts-accent transition-colors"
        >
          <FileText size={12} />
          <span className="font-mono">
            {item.sourceFile}:{item.lineNumber}
          </span>
        </button>
      </div>
    </div>
  );
}
