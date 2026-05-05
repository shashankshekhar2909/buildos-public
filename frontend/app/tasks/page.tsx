"use client";

import { useEffect, useState } from "react";
import { Button } from "@carbon/react";
import { Checkmark } from "@carbon/icons-react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchToolbar } from "@/components/shared/search-toolbar";
import { EntityTable } from "@/components/shared/entity-table";
import { PriorityTag, StatusTag } from "@/components/shared/tags";
import { api } from "@/lib/api";
import type { ApiItem } from "@/lib/api";
import { tasks as mockTasks } from "@/lib/mock-data";

export default function TasksPage() {
  const [tasks, setTasks] = useState<ApiItem[]>(mockTasks as unknown as ApiItem[]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    api.tasks().then(setTasks).catch(() => undefined);
  }, []);

  const markDone = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        String(t.id ?? prev.indexOf(t)) === id ? { ...t, status: "done" } : t
      )
    );
    // Optimistic only — backend call can be wired when API is ready
  };

  const rows = tasks.map((task, i) => {
    const id = `${task.id ?? i}`;
    const status = String(task.status ?? "open");
    const isDone = status === "done";
    return {
      id,
      title: task.title,
      status: <StatusTag value={status} />,
      priority: <PriorityTag value={String(task.priority ?? "low")} />,
      project: task.project ?? "-",
      done: isDone ? null : (
        <Button
          kind="ghost"
          size="sm"
          renderIcon={Checkmark}
          iconDescription="Mark done"
          hasIconOnly
          onClick={() => markDone(id)}
        />
      ),
    };
  });

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Execution queue for product and content operations."
        actionLabel="Add Task"
        onAction={() => setIsCreateOpen(true)}
      />
      {isCreateOpen && null}
      <EntityTable
        title="Tasks"
        toolbar={
          <SearchToolbar
            searchLabel="Search tasks"
            filterA={{ id: "status", label: "Status", items: ["open", "active", "in_progress", "blocked", "done"] }}
            filterB={{ id: "priority", label: "Priority", items: ["critical", "high", "medium", "low"] }}
          />
        }
        headers={[
          { key: "title", header: "Title" },
          { key: "status", header: "Status" },
          { key: "priority", header: "Priority" },
          { key: "project", header: "Project" },
          { key: "done", header: "Mark Done" },
        ]}
        rows={rows}
      />
    </>
  );
}
