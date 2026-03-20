"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProjectConfig } from "@/types";

interface FieldErrors {
  name?: string;
  stack?: string;
  description?: string;
  path?: string;
}

export function NewProjectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [stack, setStack] = useState("");
  const [description, setDescription] = useState("");
  const [folderPath, setFolderPath] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showNonEmptyConfirm, setShowNonEmptyConfirm] = useState(false);

  const validate = (): boolean => {
    const e: FieldErrors = {};
    if (!name.trim()) e.name = "Project name is required";
    if (!stack.trim()) e.stack = "Tech stack is required";
    if (!description.trim()) e.description = "Description is required";
    if (!folderPath.trim()) e.path = "Folder path is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const doScaffoldAndAttach = async () => {
    setLoading(true);
    setSubmitError(null);

    try {
      const scaffoldRes = await fetch("/api/projects/scaffold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          stack: stack.trim(),
          description: description.trim(),
          path: folderPath.trim(),
        }),
      });

      if (scaffoldRes.status === 409) {
        setShowNonEmptyConfirm(true);
        setLoading(false);
        return;
      }

      if (!scaffoldRes.ok) {
        const err = await scaffoldRes.json().catch(() => ({ error: "Unknown error" })) as { error?: string };
        setSubmitError(err.error ?? "Scaffolding failed. Please try again.");
        setLoading(false);
        return;
      }

      // Attach the project
      const attachRes = await fetch("/api/projects/attach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: folderPath.trim() }),
      });

      if (!attachRes.ok) {
        setSubmitError("Project created but could not be attached.");
        setLoading(false);
        return;
      }

      router.push("/workshop");
    } catch {
      setSubmitError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    doScaffoldAndAttach();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <FormField
        label="Project name"
        error={errors.name}
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="my-awesome-project"
          className={inputClass(!!errors.name)}
        />
      </FormField>

      <FormField
        label="Tech stack"
        error={errors.stack}
        hint="e.g., Next.js + Python"
      >
        <input
          type="text"
          value={stack}
          onChange={(e) => setStack(e.target.value)}
          placeholder="Next.js + TypeScript"
          className={inputClass(!!errors.stack)}
        />
      </FormField>

      <FormField
        label="What are you building?"
        error={errors.description}
      >
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="A brief description of your project..."
          className={inputClass(!!errors.description)}
        />
      </FormField>

      <FormField
        label="Where should we create it?"
        error={errors.path}
        hint="Full path to an empty folder"
      >
        <input
          type="text"
          value={folderPath}
          onChange={(e) => setFolderPath(e.target.value)}
          placeholder="/Users/you/projects/my-project"
          className={`${inputClass(!!errors.path)} font-mono`}
        />
      </FormField>

      {submitError && (
        <div className="text-sm text-ts-error bg-ts-error/10 border border-ts-error/30 rounded-lg px-3 py-2">
          {submitError}
        </div>
      )}

      {showNonEmptyConfirm && (
        <div className="bg-ts-warning/10 border border-ts-warning/40 rounded-lg px-4 py-3 space-y-3">
          <p className="text-sm text-ts-text">
            This folder already contains files. Create project anyway?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowNonEmptyConfirm(false)}
              className="px-3 py-1.5 rounded-lg border border-ts-border text-sm text-ts-text hover:bg-ts-surface-alt transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNonEmptyConfirm(false);
                doScaffoldAndAttach();
              }}
              className="px-3 py-1.5 rounded-lg bg-ts-warning text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Create Anyway
            </button>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={[
          "w-full px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors",
          loading
            ? "bg-ts-accent/70 cursor-wait"
            : "bg-ts-accent hover:bg-ts-accent-hover",
        ].join(" ")}
      >
        {loading ? "Creating\u2026" : "Create Project"}
      </button>
    </form>
  );
}

function FormField({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-ts-text mb-1">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1 text-xs text-ts-text-muted">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-ts-error">{error}</p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return [
    "w-full px-3 py-2 rounded-lg border text-sm text-ts-text bg-white placeholder-ts-text-muted",
    "focus:outline-none focus:ring-2 focus:ring-ts-accent focus:border-ts-accent",
    hasError ? "border-ts-error" : "border-ts-border",
  ].join(" ");
}
