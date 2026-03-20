"use client";

import { useRef } from "react";
import { MascotCard } from "./MascotCard";
import type { EntityStatus } from "@/types";
import type { ManifestEntity } from "@/lib/types/manifest";

interface StatusBoardProps {
  entities: ManifestEntity[];
  statuses: Map<string, EntityStatus>;
  recommendedEntityId: string | null;
  openEntityId: string | null;
  onCardClick: (entityId: string) => void;
}

export function StatusBoard({
  entities,
  statuses,
  recommendedEntityId,
  openEntityId,
  onCardClick,
}: StatusBoardProps) {
  const cardRefs = useRef<Map<string, HTMLButtonElement & { triggerPulse?: () => void }>>(new Map());

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
    >
      {entities.map((entity) => (
        <div
          key={entity.id}
          ref={(el) => {
            if (el) {
              const btn = el.querySelector("button") as (HTMLButtonElement & { triggerPulse?: () => void }) | null;
              if (btn) cardRefs.current.set(entity.id, btn);
            }
          }}
        >
          <MascotCard
            entityId={entity.id}
            mascotSprite={entity.mascotSprite}
            label={entity.label}
            description={entity.description}
            status={statuses.get(entity.id) ?? "idle"}
            isRecommended={recommendedEntityId === entity.id}
            isOpen={openEntityId === entity.id}
            onClick={() => onCardClick(entity.id)}
          />
        </div>
      ))}
    </div>
  );
}
