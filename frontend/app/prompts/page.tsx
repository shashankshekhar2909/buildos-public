"use client";

import { useEffect, useState } from "react";
import { Tile } from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchToolbar } from "@/components/shared/search-toolbar";
import { EntityTable } from "@/components/shared/entity-table";
import { api } from "@/lib/api";
import type { ApiItem } from "@/lib/api";
import { prompts as mockPrompts } from "@/lib/mock-data";

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<ApiItem[]>(mockPrompts as unknown as ApiItem[]);
  useEffect(() => {
    api.prompts().then(setPrompts).catch(() => undefined);
  }, []);

  return (
    <>
      <PageHeader title="Prompts" description="Reusable prompts mapped to tools, models, and projects." actionLabel="New Prompt" />
      <SearchToolbar searchLabel="Search prompts" filterA={{ id: "category", label: "Category", items: ["coding", "architecture"] }} filterB={{ id: "tool", label: "Tool", items: ["codex", "claude", "aider"] }} />
      <Tile><EntityTable headers={[{ key: "title", header: "Title" }, { key: "category", header: "Category" }, { key: "tool", header: "Recommended Tool" }, { key: "model", header: "Model" }, { key: "rating", header: "Rating" }, { key: "project", header: "Project" }]} rows={prompts.map((p, i) => ({ id: `${p.id ?? i}`, title: p.title, category: p.category, tool: p.recommended_tool ?? p.recommendedTool, model: p.recommended_model ?? p.recommendedModel, rating: p.rating, project: p.project ?? "-" }))} /></Tile>
    </>
  );
}
