export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { getSettings } from "@/lib/settings";
import { ArtifactsClient } from "./ArtifactsClient";

export default async function ArtifactsPage() {
  const settings = getSettings();
  if (!settings.projectPath) {
    redirect("/welcome");
  }
  return <ArtifactsClient />;
}
