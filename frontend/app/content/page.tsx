"use client";

import { useEffect, useState } from "react";
import { Tile } from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchToolbar } from "@/components/shared/search-toolbar";
import { EntityTable } from "@/components/shared/entity-table";
import { StatusTag } from "@/components/shared/tags";
import { api } from "@/lib/api";
import type { ApiItem } from "@/lib/api";
import { contentItems as mockContent } from "@/lib/mock-data";

export default function ContentPage() {
  const [contentItems, setContentItems] = useState<ApiItem[]>(mockContent as unknown as ApiItem[]);
  useEffect(() => {
    api.content().then(setContentItems).catch(() => undefined);
  }, []);

  return (
    <>
      <PageHeader title="Content Lab" description="Manage ideas, drafts, reviews, and publication pipeline." actionLabel="New Content Idea" />
      <SearchToolbar searchLabel="Search content" filterA={{ id: "platform", label: "Platform", items: ["linkedin", "youtube", "blog"] }} filterB={{ id: "status", label: "Status", items: ["idea", "draft", "review", "ready", "published", "repurpose"] }} />
      <Tile><EntityTable headers={[{ key: "title", header: "Title" }, { key: "platform", header: "Platform" }, { key: "type", header: "Content Type" }, { key: "status", header: "Status" }, { key: "project", header: "Project" }, { key: "scheduled", header: "Scheduled" }]} rows={contentItems.map((item, i) => ({ id: `${item.id ?? i}`, title: item.title, platform: item.platform, type: item.content_type ?? item.contentType, status: <StatusTag value={String(item.status ?? "idea")} />, project: item.project ?? "-", scheduled: item.scheduled_date ?? item.scheduledDate ?? "-" }))} /></Tile>
    </>
  );
}
