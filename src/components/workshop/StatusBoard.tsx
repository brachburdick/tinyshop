"use client";

import { useRef } from "react";
import { MascotCard } from "./MascotCard";
import type { MascotRole } from "@/components/ui/mascot";
import type { RoleStatus } from "@/types";

const ROLES: Array<{
  role: MascotRole;
  label: string;
  description: string;
}> = [
  {
    role: "orchestrator",
    label: "TINY Orchestrator",
    description: "Coordinates the project, maintains state, and decides what happens next.",
  },
  {
    role: "architect",
    label: "TINY Architect",
    description: "Plans your project's architecture and implementation strategy.",
  },
  {
    role: "researcher",
    label: "TINY Researcher",
    description: "Investigates unknowns, gathers context, and surfaces findings.",
  },
  {
    role: "designer",
    label: "TINY Designer",
    description: "Defines UI/UX specs, component hierarchy, and visual language.",
  },
  {
    role: "developer",
    label: "TINY Developer",
    description: "Implements features from task definitions and handoff packets.",
  },
  {
    role: "validator",
    label: "TINY Validator",
    description: "Reviews work against acceptance criteria and flags issues.",
  },
  {
    role: "qa-tester",
    label: "TINY QA Tester",
    description: "Tests live features, verifies behavior, and checks edge cases.",
  },
];

interface StatusBoardProps {
  statuses: Map<string, RoleStatus>;
  recommendedRole: string | null;
  openRole: string | null;
  onCardClick: (role: string) => void;
}

export function StatusBoard({
  statuses,
  recommendedRole,
  openRole,
  onCardClick,
}: StatusBoardProps) {
  const cardRefs = useRef<Map<string, HTMLButtonElement & { triggerPulse?: () => void }>>(new Map());

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
    >
      {ROLES.map(({ role, label, description }) => (
        <div
          key={role}
          ref={(el) => {
            if (el) {
              // Find the button inside
              const btn = el.querySelector("button") as (HTMLButtonElement & { triggerPulse?: () => void }) | null;
              if (btn) cardRefs.current.set(role, btn);
            }
          }}
        >
          <MascotCard
            role={role}
            label={label}
            description={description}
            status={statuses.get(role) ?? "idle"}
            isRecommended={recommendedRole === role}
            isOpen={openRole === role}
            onClick={() => onCardClick(role)}
          />
        </div>
      ))}
    </div>
  );
}

export { ROLES };
