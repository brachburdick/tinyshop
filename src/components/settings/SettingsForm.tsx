"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Settings } from "@/types";

export function SettingsForm() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [apiKeyRevealed, setApiKeyRevealed] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const router = useRouter();

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = (await res.json()) as Settings;
        setSettings(data);
        setApiKey(data.anthropicApiKey ?? "");
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    setSaveState("saving");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anthropicApiKey: apiKey || null }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 3000);
    } catch {
      setSaveState("error");
    }
  };

  const handleChangeProject = async () => {
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectPath: null }),
    });
    router.push("/welcome");
  };

  if (!settings) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Project section skeleton */}
        <div>
          <div className="h-3 bg-ts-surface-alt rounded w-16 mb-3" />
          <div className="bg-ts-surface rounded-xl border border-ts-border p-4 space-y-3">
            <div className="h-3 bg-ts-surface-alt rounded w-32 mb-1" />
            <div className="h-9 bg-ts-surface-alt rounded-lg" />
            <div className="h-9 bg-ts-surface-alt rounded-lg w-36" />
          </div>
        </div>
        <div className="border-t border-ts-border" />
        {/* API key section skeleton */}
        <div>
          <div className="h-3 bg-ts-surface-alt rounded w-28 mb-3" />
          <div className="bg-ts-surface rounded-xl border border-ts-border p-4">
            <div className="h-9 bg-ts-surface-alt rounded-lg" />
          </div>
        </div>
        <div className="h-9 bg-ts-surface-alt rounded-lg w-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project section */}
      <div>
        <h2 className="text-sm font-semibold text-ts-text-muted uppercase tracking-wide mb-3">
          Project
        </h2>
        <div className="bg-ts-surface rounded-xl border border-ts-border p-4 space-y-3">
          <div>
            <div className="text-xs text-ts-text-muted mb-1">Current project path</div>
            <div className="font-mono text-sm text-ts-text bg-ts-surface-alt rounded-lg px-3 py-2 break-all">
              {settings.projectPath ?? (
                <span className="text-ts-text-muted italic">No project attached</span>
              )}
            </div>
          </div>
          <button
            onClick={handleChangeProject}
            className="px-4 py-2 rounded-lg border border-ts-border text-sm font-medium text-ts-text hover:bg-ts-surface-alt transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ts-accent focus-visible:ring-offset-2"
          >
            Change Project
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-ts-border" />

      {/* API Key section */}
      <div>
        <h2 className="text-sm font-semibold text-ts-text-muted uppercase tracking-wide mb-3">
          Anthropic API Key
        </h2>
        <div className="bg-ts-surface rounded-xl border border-ts-border p-4 space-y-3">
          <div>
            <input
              type={apiKeyRevealed ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onFocus={() => setApiKeyRevealed(true)}
              onBlur={() => setApiKeyRevealed(false)}
              placeholder="sk-ant-..."
              className="w-full px-3 py-2 rounded-lg border border-ts-border text-sm text-ts-text bg-white placeholder-ts-text-muted focus:outline-none focus:ring-2 focus:ring-ts-accent focus:border-ts-accent font-mono"
              aria-label="Anthropic API key"
            />
            <p className="mt-1.5 text-xs text-ts-text-muted">
              For future TINY Shopkeeper use. Not required for MVP.
            </p>
          </div>
        </div>
      </div>

      {/* Save button + confirmation */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saveState === "saving"}
          className={[
            "px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ts-accent focus-visible:ring-offset-2",
            saveState === "saving"
              ? "bg-ts-accent/70 cursor-wait"
              : "bg-ts-accent hover:bg-ts-accent-hover",
          ].join(" ")}
        >
          {saveState === "saving" ? "Saving\u2026" : "Save Settings"}
        </button>

        {saveState === "saved" && (
          <span className="text-sm text-ts-success font-medium">
            &#x2713; Settings saved.
          </span>
        )}
        {saveState === "error" && (
          <span className="text-sm text-ts-error">
            Failed to save. Please try again.
          </span>
        )}
      </div>
    </div>
  );
}
