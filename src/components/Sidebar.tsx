"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hammer, FileText, Settings } from "lucide-react";

interface SidebarProps {
  projectName?: string | null;
}

const NAV_ITEMS = [
  { label: "Workshop", icon: Hammer, href: "/workshop" },
  { label: "Artifacts", icon: FileText, href: "/artifacts" },
  { label: "Settings", icon: Settings, href: "/settings" },
] as const;

function truncate(str: string, max: number) {
  if (str.length <= max) return str;
  return str.slice(0, max) + "…";
}

export function Sidebar({ projectName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] flex-shrink-0 h-screen flex flex-col bg-ts-surface-alt border-r border-ts-border sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5">
        <span className="text-lg font-bold text-ts-accent tracking-tight">
          tinyshop
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "text-ts-accent border-l-[3px] border-ts-accent pl-[calc(0.75rem_-_3px)] bg-white/60"
                  : "text-ts-text-muted hover:text-ts-text hover:bg-white/50",
              ].join(" ")}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Project badge */}
      {projectName && (
        <div className="px-4 py-4 border-t border-ts-border">
          <div
            className="text-xs text-ts-text-muted font-medium truncate"
            title={projectName}
          >
            {truncate(projectName, 20)}
          </div>
        </div>
      )}
    </aside>
  );
}
