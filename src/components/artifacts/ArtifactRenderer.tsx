"use client";

import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { AlertTriangle, FileText, RefreshCw } from "lucide-react";
import type { ArtifactRecord } from "@/types";

interface ArtifactRendererProps {
  selectedPath: string | null;
  artifacts: ArtifactRecord[];
}

interface ArtifactContent {
  artifact: ArtifactRecord;
  content: string;
}

const STATUS_BADGE_COLORS: Record<string, string> = {
  APPROVED: "bg-ts-success/20 text-ts-success border-ts-success/40",
  DRAFT: "bg-ts-idle/30 text-ts-text-muted border-ts-idle/40",
  "parse-error": "bg-ts-error/20 text-ts-error border-ts-error/40",
};

function getStatusBadgeColor(status: string): string {
  return STATUS_BADGE_COLORS[status] ?? "bg-ts-surface-alt text-ts-text-muted border-ts-border";
}

export function ArtifactRenderer({
  selectedPath,
  artifacts,
}: ArtifactRendererProps) {
  const [data, setData] = useState<ArtifactContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [removed, setRemoved] = useState(false);

  const fetchContent = useCallback(async (artPath: string) => {
    setLoading(true);
    setError(false);
    setRemoved(false);
    try {
      const encoded = artPath.split("/").map(encodeURIComponent).join("/");
      const res = await fetch(`/api/artifacts/${encoded}`);
      if (res.status === 404) {
        setRemoved(true);
        setData(null);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch artifact");
      const result = (await res.json()) as ArtifactContent;
      setData(result);
    } catch {
      setError(true);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedPath) {
      setData(null);
      setError(false);
      setRemoved(false);
      return;
    }
    fetchContent(selectedPath);
  }, [selectedPath, fetchContent]);

  // Re-fetch if the selected artifact changes in the index (SSE update)
  useEffect(() => {
    if (!selectedPath || !data) return;
    const updated = artifacts.find((a) => a.path === selectedPath);
    if (updated && updated.lastModified !== data.artifact.lastModified) {
      fetchContent(selectedPath);
    }
  }, [artifacts, selectedPath, data, fetchContent]);

  if (!selectedPath) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-ts-text-muted">
        <FileText size={48} className="mb-4 opacity-30" />
        <p className="text-sm">Select an artifact from the sidebar to view it here.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 p-8 animate-pulse space-y-3">
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-20 bg-ts-surface-alt rounded-full" />
          <div className="h-6 w-16 bg-ts-surface-alt rounded-full" />
        </div>
        <div className="h-4 bg-ts-surface-alt rounded w-1/3" />
        <div className="h-4 bg-ts-surface-alt rounded w-full" />
        <div className="h-4 bg-ts-surface-alt rounded w-5/6" />
        <div className="h-4 bg-ts-surface-alt rounded w-2/3" />
      </div>
    );
  }

  if (removed) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-ts-text-muted">
        <AlertTriangle size={36} className="mb-3 text-ts-warning" />
        <p className="text-sm">This artifact has been removed.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8">
        <div className="text-sm text-ts-error mb-3">Couldn&apos;t load this artifact.</div>
        <button
          onClick={() => fetchContent(selectedPath)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-ts-border text-sm text-ts-text hover:bg-ts-surface-alt transition-colors"
        >
          <RefreshCw size={14} />
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { artifact, content } = data;
  const isParseError = artifact.status === "parse-error";
  const fm = artifact.frontmatter;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8 max-w-3xl">
        {/* Frontmatter badges */}
        <div className="flex flex-wrap gap-2 mb-5">
          {artifact.status && (
            <span
              className={[
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
                getStatusBadgeColor(artifact.status),
              ].join(" ")}
              aria-label={`Status: ${artifact.status}`}
            >
              {artifact.status}
            </span>
          )}
          {artifact.type && artifact.type !== "unknown" && (
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border bg-ts-surface-alt text-ts-text-muted border-ts-border"
              aria-label={`Type: ${artifact.type}`}
            >
              {artifact.type}
            </span>
          )}
          {artifact.supersedes && (
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border bg-ts-surface-alt text-ts-text-muted border-ts-border"
              aria-label={`Supersedes: ${artifact.supersedes}`}
            >
              Supersedes: {artifact.supersedes}
            </span>
          )}
          {artifact.superseded_by && (
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border bg-ts-warning/20 text-ts-warning border-ts-warning/40"
              aria-label={`Superseded by: ${artifact.superseded_by}`}
            >
              Superseded by: {artifact.superseded_by}
            </span>
          )}
          {/* Any extra frontmatter fields */}
          {Object.entries(fm).map(([key, val]) => {
            if (
              ["status", "supersedes", "superseded_by", "project_root"].includes(key)
            )
              return null;
            if (val === null || val === undefined || val === "") return null;
            return (
              <span
                key={key}
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border bg-ts-surface-alt text-ts-text-muted border-ts-border"
              >
                {key}: {String(val)}
              </span>
            );
          })}
        </div>

        {isParseError && (
          <div className="flex items-center gap-2 mb-4 bg-ts-error/10 border border-ts-error/30 rounded-lg px-3 py-2 text-sm text-ts-error">
            <AlertTriangle size={16} />
            Frontmatter could not be parsed. Showing raw file content.
          </div>
        )}

        {/* Rendered markdown */}
        <div className="prose prose-sm max-w-none artifact-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              // Custom code block rendering
              pre({ children, ...props }) {
                return (
                  <pre
                    {...props}
                    className="bg-[#1E1E1E] text-gray-100 rounded-lg p-4 overflow-x-auto text-xs"
                  >
                    {children}
                  </pre>
                );
              },
              code({ children, className, ...props }) {
                // Inline code
                if (!className) {
                  return (
                    <code
                      {...props}
                      className="bg-ts-surface-alt text-ts-text px-1.5 py-0.5 rounded text-xs font-mono"
                    >
                      {children}
                    </code>
                  );
                }
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
              a({ children, href, ...props }) {
                return (
                  <a
                    {...props}
                    href={href}
                    className="text-ts-accent hover:underline"
                    target={href?.startsWith("http") ? "_blank" : undefined}
                    rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                  >
                    {children}
                  </a>
                );
              },
              table({ children, ...props }) {
                return (
                  <div className="overflow-x-auto">
                    <table {...props} className="border-collapse w-full text-sm">
                      {children}
                    </table>
                  </div>
                );
              },
              th({ children, ...props }) {
                return (
                  <th
                    {...props}
                    className="border border-ts-border bg-ts-surface-alt px-3 py-2 text-left font-semibold text-ts-text"
                  >
                    {children}
                  </th>
                );
              },
              td({ children, ...props }) {
                return (
                  <td
                    {...props}
                    className="border border-ts-border px-3 py-2 text-ts-text"
                  >
                    {children}
                  </td>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
