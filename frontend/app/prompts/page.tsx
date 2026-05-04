"use client";

import { Tile } from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchToolbar } from "@/components/shared/search-toolbar";
import { EntityTable } from "@/components/shared/entity-table";
import { prompts } from "@/lib/mock-data";

export default function PromptsPage() {
  return (
    <>
      <PageHeader title="Prompts" description="Reusable prompts mapped to tools, models, and projects." actionLabel="New Prompt" />
      <SearchToolbar searchLabel="Search prompts" filterA={{ id: "category", label: "Category", items: ["coding", "architecture"] }} filterB={{ id: "tool", label: "Tool", items: ["codex", "claude", "aider"] }} />
      <Tile>
        <EntityTable
          headers={[{ key: "title", header: "Title" }, { key: "category", header: "Category" }, { key: "tool", header: "Recommended Tool" }, { key: "model", header: "Model" }, { key: "rating", header: "Rating" }, { key: "project", header: "Project" }]}
          rows={prompts.map((p, i) => ({ id: `${i}`, title: p.title, category: p.category, tool: p.recommendedTool, model: p.recommendedModel, rating: p.rating, project: p.project ?? "-" }))}
        />
      </Tile>
    </>
  );
}
