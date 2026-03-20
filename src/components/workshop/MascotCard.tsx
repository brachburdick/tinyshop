"use client";

import { useRef, useEffect, useState } from "react";
import { Mascot } from "@/components/ui/mascot";
import type { EntityStatus } from "@/types";

interface MascotCardProps {
  entityId: string;
  mascotSprite: string | null;
  label: string;
  description: string;
  status: EntityStatus;
  isRecommended: boolean;
  isOpen: boolean;
  onClick: () => void;
}

const STATUS_LABEL: Record<EntityStatus, string> = {
  idle: "Ready",
  launched: "Launched",
  "awaiting-output": "Working\u2026",
  complete: "Done",
};

export function MascotCard({
  entityId,
  mascotSprite,
  label,
  description,
  status,
  isRecommended,
  isOpen,
  onClick,
}: MascotCardProps) {
  const [pulse, setPulse] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if ((cardRef.current as HTMLButtonElement & { triggerPulse?: () => void })) {
      (cardRef.current as HTMLButtonElement & { triggerPulse?: () => void }).triggerPulse = () => {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        setPulse(true);
        setTimeout(() => setPulse(false), 600);
      };
    }
  });

  const borderColor = (() => {
    if (pulse) return "border-ts-accent shadow-[0_0_0_3px_rgba(217,123,61,0.3)]";
    if (isRecommended) return "border-ts-accent border-2";
    if (status === "complete") return "border-ts-success";
    if (status === "launched" || status === "awaiting-output") return "border-ts-launched";
    return "border-ts-border";
  })();

  const bgColor = isRecommended ? "bg-[#FFF8F2]" : "bg-ts-surface";

  const dotColor = (() => {
    if (status === "complete") return "bg-ts-success";
    if (status === "launched" || status === "awaiting-output") return "bg-ts-launched";
    return "bg-ts-idle";
  })();

  const isPulsing = status === "awaiting-output";

  return (
    <button
      ref={cardRef}
      onClick={onClick}
      className={[
        "w-full text-left rounded-xl border p-5 shadow-sm cursor-pointer",
        "transition-all duration-300 ease",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ts-accent focus-visible:ring-offset-2",
        borderColor,
        bgColor,
        isOpen ? "ring-2 ring-ts-accent ring-offset-1" : "",
      ].join(" ")}
      aria-pressed={isOpen}
      id={`mascot-card-${entityId}`}
    >
      <div className="flex items-start gap-3">
        {mascotSprite ? (
          <Mascot sprite={mascotSprite} size={48} />
        ) : (
          <div className="w-12 h-12 rounded-full bg-ts-surface-alt flex items-center justify-center text-ts-text-muted text-lg font-bold">
            {label.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-ts-text truncate">
              {label}
            </span>
            {isRecommended && (
              <span className="inline-flex items-center rounded-full bg-ts-accent/10 px-2 py-0.5 text-xs font-medium text-ts-accent whitespace-nowrap">
                Up next
              </span>
            )}
          </div>
          <p className="text-xs text-ts-text-muted line-clamp-2 mb-3">
            {description}
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className={[
                "inline-block w-2 h-2 rounded-full",
                dotColor,
                isPulsing ? "animate-pulse" : "",
              ].join(" ")}
              aria-hidden
            />
            <span className="text-xs text-ts-text-muted">
              {STATUS_LABEL[status]}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export type { MascotCardProps };
