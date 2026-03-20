export const dynamic = "force-dynamic";

import { AppShell } from "@/components/AppShell";
import { getSettings } from "@/lib/settings";
import path from "path";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = getSettings();
  const projectName = settings.projectPath
    ? path.basename(settings.projectPath)
    : null;

  return <AppShell projectName={projectName}>{children}</AppShell>;
}
