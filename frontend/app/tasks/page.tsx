"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@carbon/react";
import { Checkmark } from "@carbon/icons-react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchToolbar } from "@/components/shared/search-toolbar";
import { EntityTable } from "@/components/shared/entity-table";
import { PriorityTag, StatusTag } from "@/components/shared/tags";
import { api } from "@/lib/api";
import type { ApiItem } from "@/lib/api";

export default function TasksPage() {
  const [tasks, setTasks] = useState<ApiItem[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.tasks().then(setTasks).catch(() => undefined).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = searchQ.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchSearch =
        !term ||
        String(t.title ?? "").toLowerCase().includes(term) ||
        String(t.project ?? "").toLowerCase().includes(term);
      const matchStatus = statusFilter === "all" || String(t.status ?? "") === statusFilter;
      const matchPriority = priorityFilter === "all" || String(t.priority ?? "") === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [tasks, searchQ, statusFilter, priorityFilter]);

  const markDone = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        String(t.id ?? prev.indexOf(t)) === id ? { ...t, status: "done" } : t
      )
    );
    // Optimistic only — backend call can be wired when API is ready
  };

  const rows = filtered.map((task, i) => {
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
        loading={loading}
        toolbar={
          <SearchToolbar
            searchLabel="Search tasks"
            searchValue={searchQ}
            onSearch={setSearchQ}
            filterA={{ id: "status", label: "Status", items: ["open", "active", "in_progress", "blocked", "done"], value: statusFilter, onChange: setStatusFilter }}
            filterB={{ id: "priority", label: "Priority", items: ["critical", "high", "medium", "low"], value: priorityFilter, onChange: setPriorityFilter }}
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
