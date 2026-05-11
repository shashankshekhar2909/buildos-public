"use client";

import { useEffect, useState } from "react";
import { Button, Modal, TextInput, TextArea, Select, SelectItem, OverflowMenu, OverflowMenuItem } from "@carbon/react";
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
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState("todo");
  const [formPriority, setFormPriority] = useState("medium");
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .tasks({
        search: searchQ || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        priority: priorityFilter === "all" ? undefined : priorityFilter,
      })
      .then(setTasks)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [searchQ, statusFilter, priorityFilter]);

  const markDone = async (id: string) => {
    const task = tasks.find((t, i) => String(t.id ?? i) === id);
    if (!task || typeof task.id !== "number") return;
    try {
      await api.updateTask(task.id, { status: "done", completed_at: new Date().toISOString() });
      setTasks(await api.tasks());
    } catch {
      // keep existing table state on failure
    }
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
      actions: (
        <OverflowMenu size="sm" flipped iconDescription="Task actions">
          <OverflowMenuItem
            itemText="Edit"
            onClick={() => {
              setEditId(typeof task.id === "number" ? task.id : null);
              setFormTitle(String(task.title ?? ""));
              setFormDescription(String(task.description ?? ""));
              setFormStatus(String(task.status ?? "todo"));
              setFormPriority(String(task.priority ?? "medium"));
              setCreateError("");
              setIsCreateOpen(true);
            }}
          />
          <OverflowMenuItem
            hasDivider
            isDelete
            itemText="Delete"
            onClick={() => {
              setEditId(typeof task.id === "number" ? task.id : null);
              setIsDeleteOpen(true);
            }}
          />
        </OverflowMenu>
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
      <EntityTable
        title="Tasks"
        loading={loading}
        toolbar={
          <SearchToolbar
            searchLabel="Search tasks"
            searchValue={searchQ}
            onSearch={setSearchQ}
            filterA={{ id: "status", label: "Status", items: ["todo", "active", "in_progress", "blocked", "done"], value: statusFilter, onChange: setStatusFilter }}
            filterB={{ id: "priority", label: "Priority", items: ["critical", "high", "medium", "low"], value: priorityFilter, onChange: setPriorityFilter }}
          />
        }
        headers={[
          { key: "title", header: "Title" },
          { key: "status", header: "Status" },
          { key: "priority", header: "Priority" },
          { key: "project", header: "Project" },
          { key: "done", header: "Mark Done" },
          { key: "actions", header: "" },
        ]}
        rows={rows}
      />
      <Modal
        open={isCreateOpen}
        modalHeading={editId ? "Edit Task" : "Create Task"}
        primaryButtonText={createBusy ? (editId ? "Saving..." : "Creating...") : (editId ? "Save" : "Create")}
        secondaryButtonText="Cancel"
        primaryButtonDisabled={createBusy || !formTitle.trim()}
        onRequestClose={() => {
          setIsCreateOpen(false);
          setCreateError("");
        }}
        onRequestSubmit={async () => {
          setCreateError("");
          setCreateBusy(true);
          try {
            const payload = {
              title: formTitle.trim(),
              description: formDescription.trim() || null,
              status: formStatus,
              priority: formPriority,
            };
            if (editId) await api.updateTask(editId, payload);
            else await api.createTask(payload);
            setTasks(await api.tasks());
            setIsCreateOpen(false);
            setEditId(null);
            setFormTitle("");
            setFormDescription("");
            setFormStatus("todo");
            setFormPriority("medium");
          } catch (e) {
            setCreateError(e instanceof Error ? e.message : "Failed to create task");
          } finally {
            setCreateBusy(false);
          }
        }}
      >
        <TextInput id="task-title" labelText="Title" value={formTitle} onChange={(e) => setFormTitle(e.currentTarget.value)} />
        <div style={{ height: "0.75rem" }} />
        <TextArea id="task-description" labelText="Description" rows={4} value={formDescription} onChange={(e) => setFormDescription(e.currentTarget.value)} />
        <div style={{ height: "0.75rem" }} />
        <Select id="task-status" labelText="Status" value={formStatus} onChange={(e) => setFormStatus(e.currentTarget.value)}>
          <SelectItem value="todo" text="todo" />
          <SelectItem value="active" text="active" />
          <SelectItem value="in_progress" text="in_progress" />
          <SelectItem value="blocked" text="blocked" />
          <SelectItem value="done" text="done" />
        </Select>
        <div style={{ height: "0.75rem" }} />
        <Select id="task-priority" labelText="Priority" value={formPriority} onChange={(e) => setFormPriority(e.currentTarget.value)}>
          <SelectItem value="critical" text="critical" />
          <SelectItem value="high" text="high" />
          <SelectItem value="medium" text="medium" />
          <SelectItem value="low" text="low" />
        </Select>
        {createError ? <p style={{ color: "var(--cds-support-error)", marginTop: "0.75rem" }}>{createError}</p> : null}
      </Modal>
      <Modal
        open={isDeleteOpen}
        modalHeading="Delete Task"
        danger
        primaryButtonText="Delete"
        secondaryButtonText="Cancel"
        onRequestClose={() => setIsDeleteOpen(false)}
        onRequestSubmit={async () => {
          if (!editId) return;
          await api.deleteTask(editId);
          setTasks(await api.tasks());
          setIsDeleteOpen(false);
          setEditId(null);
        }}
      >
        This task will be permanently deleted.
      </Modal>
    </>
  );
}
