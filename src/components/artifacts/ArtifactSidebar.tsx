"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Search, X } from "lucide-react";
import type { ArtifactRecord, ArtifactType } from "@/types";

const TYPE_LABELS: Record<ArtifactType, string> = {
  spec: "Specs",
  plan: "Plans",
  tasks: "Tasks",
  "session-summary": "Sessions",
  "handoff-packet": "Handoffs",
  "validator-verdict": "Validations",
  "qa-verdict": "QA Results",
  "research-request": "Research",
  "research-findings": "Findings",
  "orchestrator-state": "Orchestrator",
  unknown: "Other",
};

const TYPE_ORDER: ArtifactType[] = [
  "spec",
  "plan",
  "tasks",
  "session-summary",
  "handoff-packet",
  "validator-verdict",
  "qa-verdict",
  "research-request",
  "research-findings",
  "orchestrator-state",
  "unknown",
];

interface ArtifactSidebarProps {
  artifacts: ArtifactRecord[];
  selectedPath: string | null;
  loading: boolean;
  onSelect: (path: string) => void;
}

export function ArtifactSidebar({
  artifacts,
  selectedPath,
  loading,
  onSelect,
}: ArtifactSidebarProps) {
  const [filter, setFilter] = useState("");
  const [collapsed, setCollapsed] = useState<Set<ArtifactType>>(new Set());

  const filterLower = filter.toLowerCase();

  const grouped = useMemo(() => {
    const map = new Map<ArtifactType, ArtifactRecord[]>();
    for (const art of artifacts) {
      const filtered =
        !filterLower ||
        art.name.toLowerCase().includes(filterLower) ||
        art.path.toLowerCase().includes(filterLower);
      if (!filtered) continue;

      const existing = map.get(art.type) ?? [];
      existing.push(art);
      map.set(art.type, existing);
    }
    return map;
  }, [artifacts, filterLower]);

  const toggleCollapse = (type: ArtifactType) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  return (
    <aside className="w-[260px] flex-shrink-0 h-full bg-ts-surface-alt border-r border-ts-border flex flex-col">
      {/* Search */}
      <div className="px-3 py-3 border-b border-ts-border">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ts-text-muted pointer-events-none"
          />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter\u2026"
            className="w-full pl-8 pr-7 py-1.5 text-sm bg-white rounded-lg border border-ts-border text-ts-text placeholder-ts-text-muted focus:outline-none focus:ring-2 focus:ring-ts-accent focus:border-ts-accent"
          />
          {filter && (
            <button
              onClick={() => setFilter("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ts-text-muted hover:text-ts-text"
              aria-label="Clear filter"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Artifact list */}
      <div className="flex-1 overflow-y-auto py-2">
        {loading ? (
          <div className="px-4 py-3 space-y-2 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-6 bg-ts-surface rounded"
                style={{ width: `${60 + (i % 3) * 15}%` }}
              />
            ))}
          </div>
        ) : grouped.size === 0 ? (
          <div className="px-4 py-3 text-sm text-ts-text-muted">
            {filter ? "No matching artifacts." : "No artifacts found in this project."}
          </div>
        ) : (
          TYPE_ORDER.filter((t) => grouped.has(t)).map((type) => {
            const items = grouped.get(type)!;
            const isCollapsed = collapsed.has(type);
            return (
              <div key={type}>
                <button
                  onClick={() => toggleCollapse(type)}
                  className="flex items-center gap-1.5 w-full px-4 py-2 text-xs font-semibold text-ts-text-muted uppercase tracking-wide hover:text-ts-text transition-colors"
                >
                  {isCollapsed ? (
                    <ChevronRight size={12} />
                  ) : (
                    <ChevronDown size={12} />
                  )}
                  {TYPE_LABELS[type]}
                  <span className="ml-auto font-normal normal-case text-ts-text-muted">
                    {items.length}
                  </span>
                </button>

                {!isCollapsed && (
                  <ul>
                    {items.map((art) => (
                      <li key={art.path}>
                        <button
                          onClick={() => onSelect(art.path)}
                          className={[
                            "w-full text-left px-5 py-1.5 text-sm transition-colors",
                            selectedPath === art.path
                              ? "text-ts-accent font-semibold border-l-2 border-ts-accent pl-[calc(1.25rem_-_2px)] bg-white/60"
                              : "text-ts-text hover:bg-white/40 hover:text-ts-text",
                          ].join(" ")}
                          title={art.path}
                        >
                          {art.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
