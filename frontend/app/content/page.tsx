"use client";

import { Tile } from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchToolbar } from "@/components/shared/search-toolbar";
import { EntityTable } from "@/components/shared/entity-table";
import { StatusTag } from "@/components/shared/tags";
import { contentItems } from "@/lib/mock-data";

export default function ContentPage() {
  return (
    <>
      <PageHeader title="Content Lab" description="Manage ideas, drafts, reviews, and publication pipeline." actionLabel="New Content Idea" />
      <SearchToolbar searchLabel="Search content" filterA={{ id: "platform", label: "Platform", items: ["LinkedIn", "YouTube", "Blog"] }} filterB={{ id: "status", label: "Status", items: ["idea", "draft", "review", "ready", "published", "repurpose"] }} />
      <Tile>
        <EntityTable
          headers={[{ key: "title", header: "Title" }, { key: "platform", header: "Platform" }, { key: "type", header: "Content Type" }, { key: "status", header: "Status" }, { key: "project", header: "Project" }, { key: "scheduled", header: "Scheduled" }]}
          rows={contentItems.map((item, i) => ({ id: `${i}`, title: item.title, platform: item.platform, type: item.contentType, status: <StatusTag value={item.status} />, project: item.project, scheduled: item.scheduledDate ?? "-" }))}
        />
      </Tile>
    </>
  );
}
