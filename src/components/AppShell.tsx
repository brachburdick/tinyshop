"use client";

import { Sidebar } from "./Sidebar";
import { SSEProvider } from "./SSEProvider";
import { useSSEStatus } from "@/hooks/useSSE";

function DisconnectedBanner() {
  const status = useSSEStatus();
  if (status !== "disconnected") return null;

  return (
    <div className="fixed top-0 left-[240px] right-0 z-50 bg-ts-warning/20 border-b border-ts-warning/40 px-4 py-2 flex items-center gap-2 text-sm text-ts-text">
      <span className="text-ts-warning">&#9888;</span>
      Live updates disconnected. Reconnecting&hellip;
    </div>
  );
}

interface AppShellProps {
  children: React.ReactNode;
  projectName?: string | null;
}

function ShellInner({ children, projectName }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-ts-bg">
      <Sidebar projectName={projectName} />
      <div className="flex-1 flex flex-col min-w-0">
        <DisconnectedBanner />
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AppShell({ children, projectName }: AppShellProps) {
  return (
    <SSEProvider>
      <ShellInner projectName={projectName}>{children}</ShellInner>
    </SSEProvider>
  );
}
