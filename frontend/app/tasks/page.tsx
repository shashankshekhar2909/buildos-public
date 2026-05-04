"use client";

import { useEffect, useState } from "react";
import { Tile } from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchToolbar } from "@/components/shared/search-toolbar";
import { EntityTable } from "@/components/shared/entity-table";
import { PriorityTag, StatusTag } from "@/components/shared/tags";
import { api } from "@/lib/api";
import type { ApiItem } from "@/lib/api";
import { tasks as mockTasks } from "@/lib/mock-data";

export default function TasksPage() {
  const [tasks, setTasks] = useState<ApiItem[]>(mockTasks as unknown as ApiItem[]);
  useEffect(() => {
    api.tasks().then(setTasks).catch(() => undefined);
  }, []);

  return (
    <>
      <PageHeader title="Tasks" description="Execution queue for product and content operations." actionLabel="Add Task" />
      <SearchToolbar searchLabel="Search tasks" filterA={{ id: "status", label: "Status", items: ["todo", "in_progress", "blocked", "done"] }} filterB={{ id: "priority", label: "Priority", items: ["critical", "high", "medium", "low"] }} />
      <Tile><EntityTable headers={[{ key: "title", header: "Title" }, { key: "status", header: "Status" }, { key: "priority", header: "Priority" }, { key: "project", header: "Project" }]} rows={tasks.map((task, i) => ({ id: `${task.id ?? i}`, title: task.title, status: <StatusTag value={String(task.status === "todo" ? "open" : task.status === "in_progress" ? "active" : task.status ?? "open")} />, priority: <PriorityTag value={String(task.priority ?? "low")} />, project: task.project ?? "-" }))} /></Tile>
    </>
  );
}
