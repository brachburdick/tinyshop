"use client";

import { SSEContext, useSSEConnection } from "@/hooks/useSSE";

export function SSEProvider({ children }: { children: React.ReactNode }) {
  const connection = useSSEConnection();
  return (
    <SSEContext.Provider value={connection}>{children}</SSEContext.Provider>
  );
}
