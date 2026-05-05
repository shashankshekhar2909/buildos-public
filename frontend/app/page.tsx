"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Grid, Column, InlineNotification } from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { MetricTile } from "@/components/dashboard/metric-tile";
import { ActionTile } from "@/components/dashboard/action-tile";
import { EntityTable } from "@/components/shared/entity-table";
import { PriorityTag, StatusTag } from "@/components/shared/tags";
import { api } from "@/lib/api";
import type { ApiItem } from "@/lib/api";
import {
  aiSessions as mockSessions,
  contentItems as mockContent,
  knowledgeNotes as mockNotes,
  projects as mockProjects,
  prompts as mockPrompts,
  tasks as mockTasks,
} from "@/lib/mock-data";

export default function DashboardPage() {
  const [projects, setProjects] = useState<ApiItem[]>(mockProjects as unknown as ApiItem[]);
  const [prompts, setPrompts] = useState<ApiItem[]>(mockPrompts as unknown as ApiItem[]);
  const [content, setContent] = useState<ApiItem[]>(mockContent as unknown as ApiItem[]);
  const [tasks, setTasks] = useState<ApiItem[]>(mockTasks as unknown as ApiItem[]);
  const [sessions, setSessions] = useState<ApiItem[]>(mockSessions as unknown as ApiItem[]);
  const [knowledge, setKnowledge] = useState<ApiItem[]>(mockNotes as unknown as ApiItem[]);
  const [deploymentsCount, setDeploymentsCount] = useState(0);
  const [containerSummary, setContainerSummary] = useState<Record<string, unknown> | null>(null);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    Promise.all([
      api.projects(),
      api.prompts(),
      api.content(),
      api.tasks(),
      api.aiSessions(),
      api.knowledge(),
      api.deployments(),
      api.containersSummary().catch(() => null),
    ])
      .then(([p, pr, c, t, s, k, d, cs]) => {
        setProjects(p);
        setPrompts(pr);
        setContent(c);
        setTasks(t);
        setSessions(s);
        setKnowledge(k);
        setDeploymentsCount(d.length);
        setContainerSummary(cs);
        setApiError(false);
      })
      .catch(() => setApiError(true));
  }, []);

  const metrics = [
    ["Projects", projects.filter((p) => p.status === "active").length],
    ["Open Tasks", tasks.filter((t) => t.status !== "done").length],
    ["Drafts", content.filter((c) => c.status === "draft").length],
    ["Prompts", prompts.length],
    ["Sessions", sessions.length],
    ["Notes", knowledge.length],
  ] as const;

  const taskRows = tasks.slice(0, 5).map((task, i) => ({
    id: `${i}`,
    title: task.title,
    status: <StatusTag value={String(task.status ?? "open")} />,
    priority: <PriorityTag value={String(task.priority ?? "low")} />,
    project: task.project ?? "-",
  }));

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Operating snapshot for projects, tasks, content, and AI workflows."
      />

      {apiError && (
        <InlineNotification
          kind="warning"
          lowContrast
          hideCloseButton
          title="Backend unavailable"
          subtitle="Showing cached mock data. Start the API server to see live counts."
          className="notification--stacked"
        />
      )}

      <section className="section">
        <h2 className="section-heading">Metrics</h2>
        <Grid className="dashboard-grid">
          {metrics.map(([label, value]) => (
            <Column key={label} sm={4} md={4} lg={4} className="column--stack">
              <MetricTile label={label} value={value} />
            </Column>
          ))}
        </Grid>
      </section>

      <section className="section">
        <h2 className="section-heading">Container Health Snapshot</h2>
        <Grid className="dashboard-grid">
          <Column sm={4} md={4} lg={4} className="column--stack">
            <MetricTile label="Live Containers" value={Number(containerSummary?.total ?? 0)} />
          </Column>
          <Column sm={4} md={4} lg={4} className="column--stack">
            <MetricTile label="Running" value={Number(containerSummary?.running ?? 0)} />
          </Column>
          <Column sm={4} md={4} lg={4} className="column--stack">
            <MetricTile label="Unmapped" value={Number(containerSummary?.unmapped ?? 0)} />
          </Column>
          <Column sm={4} md={4} lg={4} className="column--stack">
            <MetricTile label="Mapped Deployments" value={deploymentsCount} />
          </Column>
        </Grid>
      </section>

      <section className="section">
        <h2 className="section-heading">Quick Actions</h2>
        <Grid className="dashboard-grid">
          <Column sm={4} md={4} lg={4} className="column--stack">
            <ActionTile title="Projects" subtitle="Manage active and planned initiatives" href="/projects" />
          </Column>
          <Column sm={4} md={4} lg={4} className="column--stack">
            <ActionTile title="Tasks" subtitle="Execution queue for product operations" href="/tasks" />
          </Column>
          <Column sm={4} md={4} lg={4} className="column--stack">
            <ActionTile title="Prompts" subtitle="Reusable prompts mapped to tools and models" href="/prompts" />
          </Column>
          <Column sm={4} md={4} lg={4} className="column--stack">
            <ActionTile title="Content Lab" subtitle="Capture, draft, and schedule content ideas" href="/content" />
          </Column>
        </Grid>
      </section>

      <section className="section">
        <EntityTable
          title="Current Tasks"
          headers={[
            { key: "title", header: "Title" },
            { key: "status", header: "Status" },
            { key: "priority", header: "Priority" },
            { key: "project", header: "Project" },
          ]}
          rows={taskRows}
        />
        <div style={{ marginTop: "var(--space-sm)" }}>
          <Link href="/tasks" style={{ fontSize: "0.875rem", color: "var(--cds-interactive)" }}>
            View all tasks →
          </Link>
        </div>
      </section>
    </>
  );
}
