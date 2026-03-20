"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArtifactSidebar } from "@/components/artifacts/ArtifactSidebar";
import { ArtifactRenderer } from "@/components/artifacts/ArtifactRenderer";
import { useArtifacts } from "@/hooks/useSSE";

function ArtifactsInner() {
  const { artifacts, loading } = useArtifacts();
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Auto-select from URL query param (from DecisionQueue source link)
  useEffect(() => {
    const pathParam = searchParams.get("path");
    if (pathParam) {
      setSelectedPath(pathParam);
    }
  }, [searchParams]);

  return (
    <div className="flex h-full -m-8 min-h-[calc(100vh-0px)]">
      <ArtifactSidebar
        artifacts={artifacts}
        selectedPath={selectedPath}
        loading={loading}
        onSelect={setSelectedPath}
      />
      <ArtifactRenderer
        selectedPath={selectedPath}
        artifacts={artifacts}
      />
    </div>
  );
}

export function ArtifactsClient() {
  return (
    <Suspense fallback={
      <div className="flex h-full -m-8 min-h-[calc(100vh-0px)]">
        <div className="w-[260px] flex-shrink-0 h-full bg-ts-surface-alt border-r border-ts-border animate-pulse" />
        <div className="flex-1 p-8 space-y-3 animate-pulse">
          <div className="h-4 bg-ts-surface-alt rounded w-1/3" />
          <div className="h-4 bg-ts-surface-alt rounded w-full" />
          <div className="h-4 bg-ts-surface-alt rounded w-5/6" />
        </div>
      </div>
    }>
      <ArtifactsInner />
    </Suspense>
  );
}
