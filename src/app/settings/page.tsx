import { SettingsForm } from "@/components/settings/SettingsForm";

export default function SettingsPage() {
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-ts-text mb-6">Settings</h1>
      <SettingsForm />
    </div>
  );
}
