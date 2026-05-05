"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SideNavLink } from "@carbon/react";
import {
  Dashboard,
  FolderDetails,
  Query,
  Document,
  Bot,
  Checkmark,
  Book,
  Settings,
  DeploymentUnitData,
} from "@carbon/icons-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NavLink = SideNavLink as any;

const nav = [
  { href: "/", label: "Dashboard", icon: Dashboard },
  { href: "/projects", label: "Projects", icon: FolderDetails },
  { href: "/deployments", label: "Deployments", icon: DeploymentUnitData },
  { href: "/prompts", label: "Prompts", icon: Query },
  { href: "/content", label: "Content Lab", icon: Document },
  { href: "/ai-sessions", label: "AI Sessions", icon: Bot },
  { href: "/tasks", label: "Tasks", icon: Checkmark },
  { href: "/knowledge", label: "Knowledge", icon: Book },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      {nav.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/"
            ? pathname === "/"
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <NavLink
            key={href}
            as={Link}
            href={href}
            renderIcon={Icon}
            isActive={active}
          >
            {label}
          </NavLink>
        );
      })}
    </>
  );
}
