"use client";

import { useState, useEffect, useCallback } from "react";
import type { LaunchPackage } from "@/types";

export function useLaunchPackage(role: string | null) {
  const [pkg, setPkg] = useState<LaunchPackage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPackage = useCallback(async (r: string) => {
    setLoading(true);
    setError(null);
    setPkg(null);
    try {
      const res = await fetch(`/api/launch-package?role=${encodeURIComponent(r)}`);
      if (!res.ok) throw new Error("Not found");
      const data = (await res.json()) as LaunchPackage;
      setPkg(data);
    } catch {
      setError("Couldn't load launch package for this role.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!role) {
      setPkg(null);
      setLoading(false);
      setError(null);
      return;
    }
    fetchPackage(role);
  }, [role, fetchPackage]);

  return { pkg, loading, error, retry: () => role && fetchPackage(role) };
}
