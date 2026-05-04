"use client";

import Link from "next/link";
import { Button, OverflowMenu, OverflowMenuItem, Tile } from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchToolbar } from "@/components/shared/search-toolbar";
import { EntityTable } from "@/components/shared/entity-table";
import { PriorityTag, StatusTag } from "@/components/shared/tags";
import { projects } from "@/lib/mock-data";

export default function ProjectsPage() {
  return (
    <>
      <PageHeader title="Projects" description="Track active and planned initiatives across product, content, and homelab work." actionLabel="New Project" />
      <SearchToolbar
        searchLabel="Search projects"
        filterA={{ id: "status", label: "Status", items: ["active", "paused", "planned"] }}
        filterB={{ id: "priority", label: "Priority", items: ["critical", "high", "medium", "low"] }}
      />
      <Tile>
        <EntityTable
          headers={[
            { key: "name", header: "Name" },
            { key: "category", header: "Category" },
            { key: "status", header: "Status" },
            { key: "priority", header: "Priority" },
            { key: "updated", header: "Updated" },
            { key: "actions", header: "Actions" },
          ]}
          rows={projects.map((project) => ({
            id: project.slug,
            name: <Link href={`/projects/${project.slug}`}>{project.name}</Link>,
            category: project.category,
            status: <StatusTag value={project.status} />,
            priority: <PriorityTag value={project.priority} />,
            updated: project.updatedDate,
            actions: (
              <>
                <Button as={Link} href={`/projects/${project.slug}`} kind="ghost" size="sm">Open</Button>
                <OverflowMenu size="sm" flipped>
                  <OverflowMenuItem itemText="Edit" />
                  <OverflowMenuItem itemText="Generate Context" />
                </OverflowMenu>
              </>
            ),
          }))}
        />
      </Tile>
    </>
  );
}
