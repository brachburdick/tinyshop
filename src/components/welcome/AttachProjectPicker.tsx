"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import type { ProjectConfig } from "@/types";

export function AttachProjectPicker() {
  const router = useRouter();
  const [folderPath, setFolderPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProjectConfig | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderPath.trim()) {
      setError("Please enter a project folder path.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/projects/attach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: folderPath.trim() }),
      });

      if (res.status === 404) {
        setError("Folder not found at this path.");
        setLoading(false);
        return;
      }

      const data = (await res.json()) as ProjectConfig;
      setResult(data);

      if (data.compatible) {
        router.push("/workshop");
        return;
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAnyway = async () => {
    setLoading(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectPath: folderPath.trim() }),
      });
      router.push("/workshop");
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  };

  const REQUIRED_FILES = [
    "AGENT_BOOTSTRAP.md",
    "preambles/COMMON_RULES.md",
    "templates/ (directory)",
    "docs/agents/orchestrator-state.md",
  ];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ts-text mb-1">
          Project folder path
        </label>
        <input
          type="text"
          value={folderPath}
          onChange={(e) => setFolderPath(e.target.value)}
          placeholder="/Users/you/projects/my-project"
          className={[
            "w-full px-3 py-2 rounded-lg border text-sm text-ts-text bg-white placeholder-ts-text-muted font-mono",
            "focus:outline-none focus:ring-2 focus:ring-ts-accent focus:border-ts-accent",
            error ? "border-ts-error" : "border-ts-border",
          ].join(" ")}
        />
        {error && <p className="mt-1 text-xs text-ts-error">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={[
          "w-full px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors",
          loading ? "bg-ts-accent/70 cursor-wait" : "bg-ts-accent hover:bg-ts-accent-hover",
        ].join(" ")}
      >
        {loading ? "Checking\u2026" : "Open Project"}
      </button>

      {/* Compatibility result */}
      {result && !result.compatible && (
        <div className="bg-ts-warning/10 border border-ts-warning/40 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-ts-text">
            <span className="text-ts-warning">&#9888;</span>
            This folder is missing some required files:
          </div>

          <ul className="space-y-1">
            {REQUIRED_FILES.map((file) => {
              const missing = result.missing.some(
                (m) => m === file || file.startsWith(m) || m.includes(file.replace(" (directory)", ""))
              );
              return (
                <li key={file} className="flex items-center gap-2 text-xs">
                  {missing ? (
                    <X size={14} className="text-ts-error flex-shrink-0" />
                  ) : (
                    <Check size={14} className="text-ts-success flex-shrink-0" />
                  )}
                  <span className={`font-mono ${missing ? "text-ts-error" : "text-ts-text-muted"}`}>
                    {file}
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="text-xs text-ts-text-muted">
            You can still browse files, but workflow features won&apos;t be available.
          </p>

          <button
            type="button"
            onClick={handleOpenAnyway}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-ts-border text-sm font-medium text-ts-text hover:bg-ts-surface-alt transition-colors w-full"
          >
            Open Anyway
          </button>
        </div>
      )}
    </form>
  );
}
