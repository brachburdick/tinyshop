"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { StatusBoard } from "@/components/workshop/StatusBoard";
import { NextActionBanner } from "@/components/workshop/NextActionBanner";
import { DecisionQueue } from "@/components/workshop/DecisionQueue";
import { LaunchDrawer } from "@/components/workshop/LaunchDrawer";
import { useRoleStatuses, useSSEListener } from "@/hooks/useSSE";
import type { NextAction } from "@/types";

export function WorkshopClient() {
  const [openRole, setOpenRole] = useState<string | null>(null);
  const [nextAction, setNextAction] = useState<NextAction | null>(null);
  const [nextActionLoading, setNextActionLoading] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);
  const statuses = useRoleStatuses();
  const router = useRouter();
  const cardGridRef = useRef<HTMLDivElement>(null);

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
      setNextActionLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNextAction();
  }, [fetchNextAction]);

  // Re-fetch next action when a role completes; surface project-level errors
  useSSEListener(
    useCallback(
      (event) => {
        if (
          event.type === "status-update" &&
          event.data.status === "complete"
        ) {
          fetchNextAction();
        } else if (event.type === "project-error") {
          setProjectError(event.data.message);
        }
      },
      [fetchNextAction]
    )
  );

  const handleCardClick = useCallback((role: string) => {
    setOpenRole((prev) => (prev === role ? null : role));
  }, []);

  const handleGoClick = useCallback(
    (role: string) => {
      // Scroll to card and pulse it
      if (cardGridRef.current) {
        const cardEl = cardGridRef.current.querySelector(
          `#mascot-card-${role}`
        ) as (HTMLButtonElement & { triggerPulse?: () => void }) | null;
        if (cardEl?.triggerPulse) {
          cardEl.triggerPulse();
        }
      }
      // Open drawer
      setOpenRole(role);
    },
    []
  );

  if (projectError) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-ts-text mb-4">Workshop</h1>
        <div className="rounded-xl bg-ts-error/10 border border-ts-error/30 px-6 py-8 flex flex-col items-start gap-4">
          <p className="text-sm font-medium text-ts-error">{projectError}</p>
          <button
            onClick={() => {
              router.push("/welcome");
              fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectPath: null }),
              }).catch(() => {});
            }}
            className="px-4 py-2 rounded-lg bg-ts-accent text-white text-sm font-medium hover:bg-ts-accent-hover transition-colors"
          >
            Open a Different Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ts-text mb-4">Workshop</h1>

      <div className="mb-6">
        <NextActionBanner
          nextAction={nextAction}
          loading={nextActionLoading}
          onGo={handleGoClick}
        />
      </div>

      <div ref={cardGridRef}>
        {nextActionLoading ? (
          <div
            className="grid gap-4 mb-6"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
          >
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-[120px] rounded-xl bg-ts-surface-alt border border-ts-border animate-pulse"
              />
            ))}
          </div>
        ) : (
          <StatusBoard
            statuses={statuses}
            recommendedRole={nextAction?.role ?? null}
            openRole={openRole}
            onCardClick={handleCardClick}
          />
        )}
      </div>

      <DecisionQueue />

      <LaunchDrawer
        role={openRole}
        isOpen={openRole !== null}
        onClose={() => setOpenRole(null)}
      />
    </div>
  );
}
