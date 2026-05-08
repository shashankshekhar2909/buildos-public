"use client";

import { useEffect, useMemo, useState } from "react";
import { Tag } from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchToolbar } from "@/components/shared/search-toolbar";
import { EntityTable } from "@/components/shared/entity-table";
import { api } from "@/lib/api";
import type { ApiItem } from "@/lib/api";

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
  const [aiSessions, setAiSessions] = useState<ApiItem[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [toolFilter, setToolFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.aiSessions().then(setAiSessions).catch(() => undefined).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = searchQ.trim().toLowerCase();
    return aiSessions.filter((item) => {
      const matchSearch =
        !term ||
        String(item.title ?? "").toLowerCase().includes(term) ||
        String(item.project ?? "").toLowerCase().includes(term);
      const tool = String(item.tool ?? "").toLowerCase();
      const matchTool = toolFilter === "all" || tool === toolFilter.toLowerCase();
      const srcModule = String(item.source_module ?? item.sourceModule ?? "").toLowerCase();
      const matchModule = moduleFilter === "all" || srcModule === moduleFilter.toLowerCase();
      return matchSearch && matchTool && matchModule;
    });
  }, [aiSessions, searchQ, toolFilter, moduleFilter]);

  const rows = filtered.map((item, i) => {
    const rawTags: string[] = Array.isArray(item.tags)
      ? (item.tags as string[])
      : String(item.tags ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

    return {
      id: `${item.id ?? i}`,
      title: (
        <span className="cell--truncate" title={String(item.title ?? "")}>
          {item.title}
        </span>
      ),
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
        loading={loading}
        toolbar={
          <SearchToolbar
            searchLabel="Search sessions"
            searchValue={searchQ}
            onSearch={setSearchQ}
            filterA={{ id: "tool", label: "Tool", items: ["Codex", "Claude", "Aider"], value: toolFilter, onChange: setToolFilter }}
            filterB={{ id: "module", label: "Source Module", items: ["Projects", "Architecture", "Prompts"], value: moduleFilter, onChange: setModuleFilter }}
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
