"use client";

import { useState } from "react";
import { NewProjectForm } from "@/components/welcome/NewProjectForm";
import { AttachProjectPicker } from "@/components/welcome/AttachProjectPicker";

type ActivePanel = null | "new" | "attach";

export default function WelcomePage() {
  const [active, setActive] = useState<ActivePanel>(null);

  const handleSelect = (panel: "new" | "attach") => {
    setActive((prev) => (prev === panel ? null : panel));
  };

  return (
    <div className="min-h-screen bg-ts-bg flex flex-col items-center justify-center px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-ts-accent mb-2">tinyshop</h1>
        <p className="text-base text-ts-text-muted">Your project workshop</p>
      </div>

      {/* Option cards */}
      <div className="flex gap-4 mb-6 w-full max-w-lg">
        <OptionCard
          emoji="✨"
          title="Start a new project"
          description="Set up a fresh project from scratch"
          isActive={active === "new"}
          isDimmed={active === "attach"}
          onClick={() => handleSelect("new")}
        />
        <OptionCard
          emoji="📂"
          title="Open an existing project"
          description="Connect to a project you already have"
          isActive={active === "attach"}
          isDimmed={active === "new"}
          onClick={() => handleSelect("attach")}
        />
      </div>

      {/* Expanding form panel */}
      <div
        className={[
          "w-full max-w-lg overflow-hidden transition-all",
          active !== null
            ? "max-h-[600px] opacity-100 duration-[200ms] ease-out"
            : "max-h-0 opacity-0 duration-[150ms] ease-in",
        ].join(" ")}
      >
        {active !== null && (
          <div className="bg-ts-surface rounded-xl border border-ts-border p-6 shadow-sm">
            {active === "new" && <NewProjectForm />}
            {active === "attach" && <AttachProjectPicker />}
          </div>
        )}
      </div>
    </div>
  );
}

interface OptionCardProps {
  emoji: string;
  title: string;
  description: string;
  isActive: boolean;
  isDimmed: boolean;
  onClick: () => void;
}

function OptionCard({
  emoji,
  title,
  description,
  isActive,
  isDimmed,
  onClick,
}: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex-1 text-left rounded-xl border p-5 shadow-sm cursor-pointer",
        "transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ts-accent focus-visible:ring-offset-2",
        isActive
          ? "border-ts-accent bg-ts-surface shadow-md"
          : isDimmed
          ? "border-ts-border bg-ts-surface opacity-50"
          : "border-ts-border bg-ts-surface hover:border-ts-accent/50 hover:shadow-md",
      ].join(" ")}
    >
      <div className="text-2xl mb-2">{emoji}</div>
      <div className="text-sm font-semibold text-ts-text mb-1">{title}</div>
      <div className="text-xs text-ts-text-muted">{description}</div>
    </button>
  );
}
