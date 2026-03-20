export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { getSettings } from "@/lib/settings";

export default async function Home() {
  const settings = getSettings();

  if (!settings.projectPath) {
    redirect("/welcome");
  }

  redirect("/workshop");
}
