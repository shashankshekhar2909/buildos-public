"use client";

import { Grid, Column, Tile } from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { MetricTile } from "@/components/dashboard/metric-tile";
import { ActionTile } from "@/components/dashboard/action-tile";
import { EntityTable } from "@/components/shared/entity-table";
import { PriorityTag, StatusTag } from "@/components/shared/tags";
import { aiSessions, contentItems, knowledgeNotes, projects, prompts, tasks } from "@/lib/mock-data";

export default function DashboardPage() {
  const metrics = [
    ["Active Projects", projects.filter((p) => p.status === "active").length],
    ["Open Tasks", tasks.filter((t) => t.status !== "done").length],
    ["Content Drafts", contentItems.filter((c) => c.status === "draft").length],
    ["Saved Prompts", prompts.length],
    ["AI Sessions", aiSessions.length],
    ["Knowledge Notes", knowledgeNotes.length],
  ] as const;

  return (
    <>
      <PageHeader title="Dashboard" description="Operating snapshot for projects, tasks, content, and AI workflows." actionLabel="New Project" />
      <Grid fullWidth>
        {metrics.map(([label, value]) => (
          <Column key={label} sm={4} md={4} lg={4} style={{ marginBottom: "1rem" }}>
            <MetricTile label={label} value={value} />
          </Column>
        ))}
      </Grid>
      <h3>Quick Actions</h3>
      <Grid fullWidth>
        <Column sm={4} md={4} lg={5}><ActionTile title="New Prompt" subtitle="Save a reusable prompt asset" href="/prompts" /></Column>
        <Column sm={4} md={4} lg={5}><ActionTile title="New Content Idea" subtitle="Capture and schedule content" href="/content" /></Column>
        <Column sm={4} md={4} lg={6}><ActionTile title="Generate Project Context" subtitle="Prepare agent-ready context files" href="/projects/buildos" /></Column>
      </Grid>
      <h3 style={{ marginTop: "1.5rem" }}>Current Tasks</h3>
      <Tile>
        <EntityTable
          headers={[{ key: "title", header: "Title" }, { key: "status", header: "Status" }, { key: "priority", header: "Priority" }, { key: "project", header: "Project" }]}
          rows={tasks.slice(0, 4).map((task, i) => ({ id: `${i}`, title: task.title, status: <StatusTag value={task.status} />, priority: <PriorityTag value={task.priority} />, project: task.project }))}
        />
      </Tile>
    </>
  );
}
