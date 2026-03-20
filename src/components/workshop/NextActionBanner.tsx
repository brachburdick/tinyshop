"use client";

import type { NextAction } from "@/types";

interface NextActionBannerProps {
  nextAction: NextAction | null;
  loading: boolean;
  onGo: (entityId: string) => void;
}

export function NextActionBanner({ nextAction, loading, onGo }: NextActionBannerProps) {
  if (loading) {
    return (
      <div className="rounded-xl bg-ts-surface-alt border border-ts-border px-5 py-4 text-sm text-ts-text-muted animate-pulse">
        Checking what&apos;s next&hellip;
      </div>
    );
  }

  if (!nextAction || nextAction.entityId === "unknown") {
    return (
      <div className="rounded-xl bg-ts-surface-alt border border-ts-border px-5 py-4 text-sm text-ts-text-muted">
        Unable to determine the next step. Check the pipeline state or pick an entity manually.
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-ts-accent/10 border border-ts-accent/30 px-5 py-4 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-ts-text">
          Recommended next:{" "}
          <span className="font-bold text-ts-accent">{nextAction.entityLabel}</span>
        </div>
        <div className="text-xs text-ts-text-muted mt-0.5 truncate">
          {nextAction.reason}
        </div>
      </div>
      <button
        onClick={() => onGo(nextAction.entityId)}
        className="flex-shrink-0 px-4 py-2 rounded-lg bg-ts-accent text-white text-sm font-medium hover:bg-ts-accent-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ts-accent focus-visible:ring-offset-2"
      >
        Go
      </button>
    </div>
  );
}
