"use client";

import { useState, useEffect, useCallback } from "react";
import type { Settings } from "@/types";

export type SettingsSaveState = "idle" | "saving" | "success" | "error";

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SettingsSaveState>("idle");

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to load settings");
      const data = (await res.json()) as Settings;
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(
    async (updates: Partial<Settings>) => {
      setSaveState("saving");
      try {
        const res = await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error("Save failed");
        const data = (await res.json()) as Settings;
        setSettings(data);
        setSaveState("success");
        // Auto-reset success after 3s
        setTimeout(() => setSaveState("idle"), 3000);
      } catch {
        setSaveState("error");
      }
    },
    []
  );

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { settings, loading, error, saveState, saveSettings, refetch: fetchSettings };
}
