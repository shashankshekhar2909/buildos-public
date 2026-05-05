"use client";

import { useEffect, useState } from "react";
import { Button } from "@carbon/react";
import { Copy } from "@carbon/icons-react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchToolbar } from "@/components/shared/search-toolbar";
import { EntityTable } from "@/components/shared/entity-table";
import { api } from "@/lib/api";
import type { ApiItem } from "@/lib/api";
import { prompts as mockPrompts } from "@/lib/mock-data";

function StarRating({ value }: { value: unknown }) {
  const n = Number(value ?? 0);
  const stars = Math.max(0, Math.min(5, Math.round(n)));
  return (
    <span style={{ letterSpacing: "0.05em", color: "var(--cds-text-primary)" }}>
      {"★".repeat(stars)}{"☆".repeat(5 - stars)}
    </span>
  );
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<ApiItem[]>(mockPrompts as unknown as ApiItem[]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    api.prompts().then(setPrompts).catch(() => undefined);
  }, []);

  const rows = prompts.map((p, i) => ({
    id: `${p.id ?? i}`,
    title: p.title,
    category: p.category,
    tool: p.recommended_tool ?? p.recommendedTool,
    model: p.recommended_model ?? p.recommendedModel,
    rating: <StarRating value={p.rating} />,
    project: p.project ?? "-",
    actions: (
      <Button
        kind="ghost"
        size="sm"
        renderIcon={Copy}
        iconDescription="Copy prompt title"
        hasIconOnly
        onClick={() => navigator.clipboard.writeText(String(p.title ?? ""))}
      />
    ),
  }));

  return (
    <>
      <PageHeader
        title="Prompts"
        description="Reusable prompts mapped to tools, models, and projects."
        actionLabel="New Prompt"
        onAction={() => setIsCreateOpen(true)}
      />
      {/* suppress unused state lint for now */}
      {isCreateOpen && null}
      <EntityTable
        title="Prompts"
        toolbar={
          <SearchToolbar
            searchLabel="Search prompts"
            filterA={{ id: "category", label: "Category", items: ["coding", "architecture"] }}
            filterB={{ id: "tool", label: "Tool", items: ["Codex", "Claude", "Aider"] }}
          />
        }
        headers={[
          { key: "title", header: "Title" },
          { key: "category", header: "Category" },
          { key: "tool", header: "Tool" },
          { key: "model", header: "Model" },
          { key: "rating", header: "Rating" },
          { key: "project", header: "Project" },
          { key: "actions", header: "" },
        ]}
        rows={rows}
      />
    </>
  );
}
