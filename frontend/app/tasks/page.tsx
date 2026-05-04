"use client";

import { Tile } from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchToolbar } from "@/components/shared/search-toolbar";
import { EntityTable } from "@/components/shared/entity-table";
import { PriorityTag, StatusTag } from "@/components/shared/tags";
import { tasks } from "@/lib/mock-data";

export default function TasksPage() {
  return (
    <>
      <PageHeader title="Tasks" description="Execution queue for product and content operations." actionLabel="Add Task" />
      <SearchToolbar searchLabel="Search tasks" filterA={{ id: "status", label: "Status", items: ["open", "active", "done"] }} filterB={{ id: "priority", label: "Priority", items: ["critical", "high", "medium", "low"] }} />
      <Tile>
        <EntityTable
          headers={[{ key: "title", header: "Title" }, { key: "status", header: "Status" }, { key: "priority", header: "Priority" }, { key: "project", header: "Project" }]}
          rows={tasks.map((task, i) => ({ id: `${i}`, title: task.title, status: <StatusTag value={task.status} />, priority: <PriorityTag value={task.priority} />, project: task.project }))}
        />
      </Tile>
    </>
  );
}
