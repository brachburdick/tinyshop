export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { getSettings } from "@/lib/settings";
import { WorkshopClient } from "./WorkshopClient";

export default async function WorkshopPage() {
  const settings = getSettings();

  if (!settings.projectPath) {
    redirect("/welcome");
  }

  return <WorkshopClient />;
}
