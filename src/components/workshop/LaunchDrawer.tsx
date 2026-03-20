"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { X, Copy, Check, Terminal, FileText, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import { Mascot } from "@/components/ui/mascot";
import type { MascotRole } from "@/components/ui/mascot";
import type { LaunchPackage } from "@/types";

interface LaunchDrawerProps {
  role: string | null;
  isOpen: boolean;
  onClose: () => void;
}

type LaunchState = "idle" | "launching" | "launched" | "error";

const VALID_ROLES: MascotRole[] = [
  "orchestrator",
  "architect",
  "researcher",
  "designer",
  "developer",
  "validator",
  "qa-tester",
  "kickstart",
];

function isValidRole(role: string): role is MascotRole {
  return VALID_ROLES.includes(role as MascotRole);
}

export function LaunchDrawer({ role, isOpen, onClose }: LaunchDrawerProps) {
  const [pkg, setPkg] = useState<LaunchPackage | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [launchState, setLaunchState] = useState<LaunchState>("idle");
  const [launchError, setLaunchError] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const prevRoleRef = useRef<string | null>(null);

  // Fetch launch package when role changes
  useEffect(() => {
    if (!role || !isOpen) return;

    if (role !== prevRoleRef.current) {
      setPkg(null);
      setFetchError(false);
      setPromptExpanded(false);
      setLaunchState("idle");
      setLaunchError(null);
    }
    prevRoleRef.current = role;

    setLoading(true);
    fetch(`/api/launch-package?role=${encodeURIComponent(role)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json() as Promise<LaunchPackage>;
      })
      .then((data) => {
        setPkg(data);
        setFetchError(false);
      })
      .catch(() => {
        setFetchError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [role, isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;
    // Focus close button when drawer opens
    setTimeout(() => closeButtonRef.current?.focus(), 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();

      if (e.key === "Tab" && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = useCallback(async () => {
    if (!pkg) return;
    try {
      await navigator.clipboard.writeText(pkg.terminalCommand);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      // ignore clipboard errors
    }
  }, [pkg]);

  const handleLaunch = useCallback(async () => {
    if (!role) return;
    setLaunchState("launching");
    setLaunchError(null);

    try {
      const res = await fetch("/api/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const data = await res.json() as { success: boolean; error?: string };

      if (!res.ok || !data.success) {
        setLaunchState("error");
        setLaunchError(data.error ?? "Terminal launch failed. Try copying the command instead.");
        return;
      }

      setLaunchState("launched");
      setTimeout(() => onClose(), 1500);
    } catch {
      setLaunchState("error");
      setLaunchError("Terminal launch failed. Try copying the command instead.");
    }
  }, [role, onClose]);

  const displayRole = role
    ? `TINY ${role.charAt(0).toUpperCase()}${role.slice(1).replace(/-([a-z])/g, (_, c: string) => " " + c.toUpperCase())}`
    : "";

  const mascotRole = role && isValidRole(role) ? role : null;

  return (
    <>
      {/* Scrim */}
      <div
        onClick={onClose}
        className={[
          "fixed inset-0 z-40 bg-black/10 transition-opacity",
          isOpen ? "opacity-100 duration-200" : "opacity-0 pointer-events-none duration-150",
        ].join(" ")}
        aria-hidden
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Launch package for ${displayRole}`}
        className={[
          "fixed top-0 right-0 z-50 h-screen w-[420px] bg-ts-surface border-l border-ts-border shadow-xl",
          "flex flex-col transition-transform",
          isOpen ? "translate-x-0 duration-[250ms] ease-out" : "translate-x-full duration-[200ms] ease-in",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-ts-border flex-shrink-0">
          {mascotRole && <Mascot role={mascotRole} size={32} />}
          <span className="flex-1 text-base font-semibold text-ts-text truncate">
            {displayRole}
          </span>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1.5 rounded-lg text-ts-text-muted hover:text-ts-text hover:bg-ts-surface-alt transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ts-accent"
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <DrawerSkeleton />
          ) : fetchError ? (
            <div className="p-5">
              <div className="text-sm text-ts-error mb-3">
                Couldn&apos;t load launch package for this role.
              </div>
              <button
                onClick={() => {
                  setFetchError(false);
                  setLoading(true);
                  fetch(`/api/launch-package?role=${encodeURIComponent(role!)}`)
                    .then((r) => r.json() as Promise<LaunchPackage>)
                    .then((d) => { setPkg(d); setFetchError(false); })
                    .catch(() => setFetchError(true))
                    .finally(() => setLoading(false));
                }}
                className="px-3 py-1.5 rounded-lg border border-ts-border text-sm text-ts-text hover:bg-ts-surface-alt transition-colors"
              >
                Retry
              </button>
            </div>
          ) : pkg ? (
            <div className="p-5 space-y-5">
              {/* Description */}
              <p className="text-sm text-ts-text-muted">{pkg.roleDescription}</p>

              {/* Files to Load */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-ts-text-muted mb-2">
                  Files to Load
                </h3>
                <div className="space-y-1.5">
                  {pkg.filesToLoad.map((file) => (
                    <div
                      key={file.path}
                      className={[
                        "flex items-start gap-2.5 rounded-lg px-3 py-2 text-xs",
                        file.missing
                          ? "bg-ts-error/10 border border-ts-error/30"
                          : "bg-ts-surface-alt",
                      ].join(" ")}
                    >
                      {file.missing ? (
                        <AlertTriangle size={14} className="text-ts-error flex-shrink-0 mt-0.5" />
                      ) : (
                        <FileText size={14} className="text-ts-text-muted flex-shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <div className={["font-mono truncate", file.missing ? "text-ts-error" : "text-ts-text"].join(" ")}>
                          {file.path}
                        </div>
                        <div className="text-ts-text-muted mt-0.5">
                          {file.missing ? (
                            <span className="text-ts-error font-medium">Missing</span>
                          ) : (
                            file.purpose
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Startup Prompt */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-ts-text-muted mb-2">
                  Startup Prompt
                </h3>
                <div className="bg-ts-surface-alt rounded-lg p-3">
                  <div className={["text-xs font-mono text-ts-text whitespace-pre-wrap overflow-hidden", promptExpanded ? "" : "line-clamp-3"].join(" ")}>
                    {pkg.startupPrompt}
                  </div>
                  <button
                    onClick={() => setPromptExpanded((v) => !v)}
                    className="flex items-center gap-1 mt-2 text-xs text-ts-accent hover:text-ts-accent-hover transition-colors"
                  >
                    {promptExpanded ? (
                      <><ChevronDown size={12} /> Hide prompt</>
                    ) : (
                      <><ChevronRight size={12} /> Show full prompt</>
                    )}
                  </button>
                </div>
              </div>

              {/* Expected Output */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-ts-text-muted mb-2">
                  Expected Output
                </h3>
                <div className="font-mono text-xs text-ts-text bg-ts-surface-alt rounded-lg px-3 py-2">
                  {pkg.expectedOutput || <span className="text-ts-text-muted italic">Not specified</span>}
                </div>
              </div>

              {/* Terminal Command */}
              {pkg.terminalCommand && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-ts-text-muted mb-2">
                    Terminal Command
                  </h3>
                  <div className="font-mono text-xs text-ts-text bg-ts-surface-alt rounded-lg px-3 py-2 break-all">
                    {pkg.terminalCommand}
                  </div>
                </div>
              )}

              {/* Launch error */}
              {launchState === "error" && launchError && (
                <div className="text-sm text-ts-error bg-ts-error/10 border border-ts-error/30 rounded-lg px-3 py-2">
                  {launchError}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer actions */}
        <div className="border-t border-ts-border px-5 py-4 flex gap-3 flex-shrink-0">
          <button
            onClick={handleCopy}
            disabled={!pkg}
            className={[
              "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors flex-1",
              copyState === "copied"
                ? "border-ts-success text-ts-success"
                : "border-ts-border text-ts-text hover:bg-ts-surface-alt",
              !pkg ? "opacity-50 cursor-not-allowed" : "",
            ].join(" ")}
          >
            {copyState === "copied" ? <Check size={15} /> : <Copy size={15} />}
            {copyState === "copied" ? "Copied!" : "Copy Command"}
          </button>
          <button
            onClick={handleLaunch}
            disabled={!pkg || launchState === "launching" || launchState === "launched"}
            className={[
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center",
              launchState === "launched"
                ? "bg-ts-success text-white cursor-default"
                : launchState === "launching"
                ? "bg-ts-accent/70 text-white cursor-wait"
                : "bg-ts-accent text-white hover:bg-ts-accent-hover",
              !pkg ? "opacity-50 cursor-not-allowed" : "",
            ].join(" ")}
          >
            <Terminal size={15} />
            {launchState === "launched"
              ? "Launched \u2713"
              : launchState === "launching"
              ? "Launching\u2026"
              : "Launch"}
          </button>
        </div>
      </div>
    </>
  );
}

function DrawerSkeleton() {
  return (
    <div className="p-5 space-y-5 animate-pulse">
      <div className="h-4 bg-ts-surface-alt rounded w-3/4" />
      <div className="h-4 bg-ts-surface-alt rounded w-1/2" />
      <div className="space-y-2 mt-4">
        <div className="h-3 bg-ts-surface-alt rounded w-1/4 mb-3" />
        <div className="h-8 bg-ts-surface-alt rounded" />
        <div className="h-8 bg-ts-surface-alt rounded" />
        <div className="h-8 bg-ts-surface-alt rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-ts-surface-alt rounded w-1/4 mb-3" />
        <div className="h-16 bg-ts-surface-alt rounded" />
      </div>
    </div>
  );
}
