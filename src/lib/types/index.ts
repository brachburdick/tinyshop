// Re-export from canonical types location.
// src/types/index.ts is the source of truth.
export * from "@/types/index";

// === Additional UI-layer types ===

export interface BootstrapFormData {
  name: string;
  stack: string;
  description: string;
  path: string;
}

export interface MascotState {
  role: string;
  status: import("@/types/index").RoleStatus;
  label: string; // display name, e.g. "TINY Architect"
}

export interface DecisionCard {
  decision: import("@/types/index").DecisionItem;
  resolved: boolean;
}
