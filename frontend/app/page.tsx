"use client";

import { useEffect, useState } from "react";
import { Grid, Column, Tile } from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { MetricTile } from "@/components/dashboard/metric-tile";
import { ActionTile } from "@/components/dashboard/action-tile";
import { EntityTable } from "@/components/shared/entity-table";
import { PriorityTag, StatusTag } from "@/components/shared/tags";
import { api } from "@/lib/api";
import type { ApiItem } from "@/lib/api";
import { aiSessions as mockSessions, contentItems as mockContent, knowledgeNotes as mockNotes, projects as mockProjects, prompts as mockPrompts, tasks as mockTasks } from "@/lib/mock-data";

export default function DashboardPage() {
  const [projects, setProjects] = useState<ApiItem[]>(mockProjects as unknown as ApiItem[]);
  const [prompts, setPrompts] = useState<ApiItem[]>(mockPrompts as unknown as ApiItem[]);
  const [content, setContent] = useState<ApiItem[]>(mockContent as unknown as ApiItem[]);
  const [tasks, setTasks] = useState<ApiItem[]>(mockTasks as unknown as ApiItem[]);
  const [sessions, setSessions] = useState<ApiItem[]>(mockSessions as unknown as ApiItem[]);
  const [knowledge, setKnowledge] = useState<ApiItem[]>(mockNotes as unknown as ApiItem[]);
  const [system, setSystem] = useState({ cpu: 0, mem: 0, containers: 0, running: 0 });

  useEffect(() => {
    Promise.all([api.projects(), api.prompts(), api.content(), api.tasks(), api.aiSessions(), api.knowledge()])
      .then(([p, pr, c, t, s, k]) => {
        setProjects(p);
        setPrompts(pr);
        setContent(c);
        setTasks(t);
        setSessions(s);
        setKnowledge(k);
      })
      .catch(() => undefined);

    api.systemSnapshot().then((snap) => {
      const host = (snap.host ?? {}) as Record<string, unknown>;
      const docker = (snap.docker ?? {}) as Record<string, unknown>;
      setSystem({
        cpu: Number(host.cpu_percent ?? 0),
        mem: Number(host.memory_percent ?? 0),
        containers: Number(docker.containers_total ?? 0),
        running: Number(docker.containers_running ?? 0),
      });
    }).catch(() => undefined);
  }, []);

  const metrics = [
    ["Active Projects", projects.filter((p) => p.status === "active").length],
    ["Open Tasks", tasks.filter((t) => t.status !== "done").length],
    ["Content Drafts", content.filter((c) => c.status === "draft").length],
    ["Saved Prompts", prompts.length],
    ["AI Sessions", sessions.length],
    ["Knowledge Notes", knowledge.length],
  ] as const;

  return (
    <>
      <PageHeader title="Dashboard" description="Operating snapshot for projects, tasks, content, and AI workflows." actionLabel="New Project" />
      <Grid fullWidth>{metrics.map(([label, value]) => <Column key={label} sm={4} md={4} lg={4} style={{ marginBottom: "1rem" }}><MetricTile label={label} value={value} /></Column>)}</Grid>

      <h3>Live System Snapshot</h3>
      <Grid fullWidth>
        <Column sm={4} md={4} lg={4} style={{ marginBottom: "1rem" }}><MetricTile label="CPU %" value={Math.round(system.cpu)} /></Column>
        <Column sm={4} md={4} lg={4} style={{ marginBottom: "1rem" }}><MetricTile label="Memory %" value={Math.round(system.mem)} /></Column>
        <Column sm={4} md={4} lg={4} style={{ marginBottom: "1rem" }}><MetricTile label="Containers" value={system.containers} /></Column>
        <Column sm={4} md={4} lg={4} style={{ marginBottom: "1rem" }}><MetricTile label="Running Containers" value={system.running} /></Column>
      </Grid>

      <h3>Quick Actions</h3>
      <Grid fullWidth>
        <Column sm={4} md={4} lg={5}><ActionTile title="New Prompt" subtitle="Save a reusable prompt asset" href="/prompts" /></Column>
        <Column sm={4} md={4} lg={5}><ActionTile title="New Content Idea" subtitle="Capture and schedule content" href="/content" /></Column>
        <Column sm={4} md={4} lg={6}><ActionTile title="Generate Project Context" subtitle="Prepare agent-ready context files" href="/projects/buildos" /></Column>
      </Grid>
      <h3 style={{ marginTop: "1.5rem" }}>Current Tasks</h3>
      <Tile>
        <EntityTable headers={[{ key: "title", header: "Title" }, { key: "status", header: "Status" }, { key: "priority", header: "Priority" }, { key: "project", header: "Project" }]} rows={tasks.slice(0, 4).map((task, i) => ({ id: `${i}`, title: task.title, status: <StatusTag value={String(task.status === "todo" ? "open" : task.status ?? "open")} />, priority: <PriorityTag value={String(task.priority ?? "low")} />, project: task.project ?? "-" }))} />
      </Tile>
    </>
  );
}
