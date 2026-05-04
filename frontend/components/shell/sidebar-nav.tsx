"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  ["/", "Dashboard"],
  ["/projects", "Projects"],
  ["/prompts", "Prompts"],
  ["/content", "Content Lab"],
  ["/ai-sessions", "AI Sessions"],
  ["/tasks", "Tasks"],
  ["/knowledge", "Knowledge"],
  ["/settings", "Settings"],
] as const;

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="app-sidebar">
      <div style={{ padding: "0 1rem 1rem", borderBottom: "1px solid #f0f0f0", marginBottom: "0.75rem" }}>
        <p style={{ margin: 0, fontSize: "0.75rem", color: "#6f6f6f" }}>BuildWithShashank</p>
        <h2 style={{ margin: "0.25rem 0 0", fontSize: "1.25rem" }}>BuildOS</h2>
      </div>
      {nav.map(([href, label]) => {
        const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link key={href} href={href} className={`sidebar-link${active ? " active" : ""}`}>
            {label}
          </Link>
        );
      })}
    </aside>
  );
}
