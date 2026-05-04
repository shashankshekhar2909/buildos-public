"use client";

import { useEffect, useState } from "react";
import { Tile } from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchToolbar } from "@/components/shared/search-toolbar";
import { EntityTable } from "@/components/shared/entity-table";
import { api } from "@/lib/api";
import type { ApiItem } from "@/lib/api";
import { aiSessions as mockSessions } from "@/lib/mock-data";

export default function AISessionsPage() {
  const [aiSessions, setAiSessions] = useState<ApiItem[]>(mockSessions as unknown as ApiItem[]);
  useEffect(() => {
    api.aiSessions().then(setAiSessions).catch(() => undefined);
  }, []);

  return (
    <>
      <PageHeader title="AI Sessions" description="Saved AI execution runs with tool and model context." actionLabel="Save AI Session" />
      <SearchToolbar searchLabel="Search sessions" filterA={{ id: "tool", label: "Tool", items: ["codex", "claude", "aider"] }} filterB={{ id: "module", label: "Source Module", items: ["manual", "project_context_generator", "content_lab"] }} />
      <Tile><EntityTable headers={[{ key: "title", header: "Title" }, { key: "tool", header: "Tool" }, { key: "model", header: "Model" }, { key: "module", header: "Source Module" }, { key: "project", header: "Project" }, { key: "date", header: "Created" }]} rows={aiSessions.map((item, i) => ({ id: `${item.id ?? i}`, title: item.title, tool: item.tool, model: item.model, module: item.source_module ?? item.sourceModule, project: item.project ?? "-", date: (item.created_at || item.createdDate || "").toString().slice(0, 10) }))} /></Tile>
    </>
  );
}
