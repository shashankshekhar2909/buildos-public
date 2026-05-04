"use client";

import { Tile } from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchToolbar } from "@/components/shared/search-toolbar";
import { EntityTable } from "@/components/shared/entity-table";
import { aiSessions } from "@/lib/mock-data";

export default function AISessionsPage() {
  return (
    <>
      <PageHeader title="AI Sessions" description="Saved AI execution runs with tool and model context." actionLabel="Save AI Session" />
      <SearchToolbar searchLabel="Search sessions" filterA={{ id: "tool", label: "Tool", items: ["Codex", "Claude", "Aider"] }} filterB={{ id: "module", label: "Source Module", items: ["Projects", "Architecture", "Prompts"] }} />
      <Tile>
        <EntityTable
          headers={[{ key: "title", header: "Title" }, { key: "tool", header: "Tool" }, { key: "model", header: "Model" }, { key: "module", header: "Source Module" }, { key: "project", header: "Project" }, { key: "date", header: "Created" }]}
          rows={aiSessions.map((item, i) => ({ id: `${i}`, title: item.title, tool: item.tool, model: item.model, module: item.sourceModule, project: item.project, date: item.createdDate }))}
        />
      </Tile>
    </>
  );
}
