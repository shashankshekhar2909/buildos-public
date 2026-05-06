"use client";

import { useEffect, useMemo, useState } from "react";
import { Tag } from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchToolbar } from "@/components/shared/search-toolbar";
import { EntityTable } from "@/components/shared/entity-table";
import { StatusTag } from "@/components/shared/tags";
import { api } from "@/lib/api";
import type { ApiItem } from "@/lib/api";

function truncate(text: string, maxLen = 60) {
  if (!text) return "-";
  return text.length > maxLen ? text.slice(0, maxLen) + "…" : text;
}

export default function ContentPage() {
  const [contentItems, setContentItems] = useState<ApiItem[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    api.content().then(setContentItems).catch(() => undefined);
  }, []);

  const filtered = useMemo(() => {
    const term = searchQ.trim().toLowerCase();
    return contentItems.filter((item) => {
      const matchSearch =
        !term ||
        String(item.title ?? "").toLowerCase().includes(term) ||
        String(item.hook ?? "").toLowerCase().includes(term);
      const matchPlatform = platformFilter === "all" || String(item.platform ?? "") === platformFilter;
      const matchStatus = statusFilter === "all" || String(item.status ?? "") === statusFilter;
      return matchSearch && matchPlatform && matchStatus;
    });
  }, [contentItems, searchQ, platformFilter, statusFilter]);

  const rows = filtered.map((item, i) => {
    const platform = String(item.platform ?? "");
    const contentType = String(item.content_type ?? item.contentType ?? "");
    return {
      id: `${item.id ?? i}`,
      title: String(item.title ?? "-"),
      hook: truncate(String(item.hook ?? "")),
      typePlatform: (
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
          {contentType && <Tag type="blue" size="sm">{contentType}</Tag>}
          {platform && <Tag type="teal" size="sm">{platform}</Tag>}
        </div>
      ),
      status: <StatusTag value={String(item.status ?? "idea")} />,
      project: item.project ?? "-",
    };
  });

  return (
    <>
      <PageHeader
        title="Content Lab"
        description="Manage ideas, drafts, reviews, and publication pipeline."
        actionLabel="New Content Idea"
        onAction={() => setIsCreateOpen(true)}
      />
      {isCreateOpen && null}
      <EntityTable
        title="Content"
        toolbar={
          <SearchToolbar
            searchLabel="Search content"
            searchValue={searchQ}
            onSearch={setSearchQ}
            filterA={{ id: "platform", label: "Platform", items: ["LinkedIn", "YouTube", "Blog"], value: platformFilter, onChange: setPlatformFilter }}
            filterB={{ id: "status", label: "Status", items: ["idea", "draft", "review", "ready", "published"], value: statusFilter, onChange: setStatusFilter }}
          />
        }
        headers={[
          { key: "title", header: "Title" },
          { key: "hook", header: "Hook" },
          { key: "typePlatform", header: "Type / Platform" },
          { key: "status", header: "Status" },
          { key: "project", header: "Project" },
        ]}
        rows={rows}
      />
    </>
  );
}
