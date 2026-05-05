"use client";

import { useEffect, useState } from "react";
import { Tag } from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchToolbar } from "@/components/shared/search-toolbar";
import { EntityTable } from "@/components/shared/entity-table";
import { api } from "@/lib/api";
import type { ApiItem } from "@/lib/api";
import { aiSessions as mockSessions } from "@/lib/mock-data";

function StarRating({ value }: { value: unknown }) {
  const n = Number(value ?? 0);
  const stars = Math.max(0, Math.min(5, Math.round(n)));
  return (
    <span style={{ letterSpacing: "0.05em", color: "var(--cds-text-primary)" }}>
      {"★".repeat(stars)}{"☆".repeat(5 - stars)}
    </span>
  );
}

export default function AISessionsPage() {
  const [aiSessions, setAiSessions] = useState<ApiItem[]>(mockSessions as unknown as ApiItem[]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    api.aiSessions().then(setAiSessions).catch(() => undefined);
  }, []);

  const rows = aiSessions.map((item, i) => {
    const rawTags: string[] = Array.isArray(item.tags)
      ? (item.tags as string[])
      : String(item.tags ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

    return {
      id: `${item.id ?? i}`,
      title: item.title,
      tool: item.tool,
      model: item.model,
      module: item.source_module ?? item.sourceModule,
      tags: (
        <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
          {rawTags.map((tag) => (
            <Tag key={tag} type="cool-gray" size="sm">{tag}</Tag>
          ))}
        </div>
      ),
      rating: <StarRating value={item.rating} />,
      project: item.project ?? "-",
      date: (item.created_at || item.createdDate || "").toString().slice(0, 10),
    };
  });

  return (
    <>
      <PageHeader
        title="AI Sessions"
        description="Saved AI execution runs with tool and model context."
        actionLabel="Save AI Session"
        onAction={() => setIsCreateOpen(true)}
      />
      {isCreateOpen && null}
      <EntityTable
        title="AI Sessions"
        toolbar={
          <SearchToolbar
            searchLabel="Search sessions"
            filterA={{ id: "tool", label: "Tool", items: ["Codex", "Claude", "Aider"] }}
            filterB={{ id: "module", label: "Source Module", items: ["Projects", "Architecture", "Prompts"] }}
          />
        }
        headers={[
          { key: "title", header: "Title" },
          { key: "tool", header: "Tool" },
          { key: "model", header: "Model" },
          { key: "module", header: "Source Module" },
          { key: "tags", header: "Tags" },
          { key: "rating", header: "Rating" },
          { key: "project", header: "Project" },
          { key: "date", header: "Created" },
        ]}
        rows={rows}
      />
    </>
  );
}
