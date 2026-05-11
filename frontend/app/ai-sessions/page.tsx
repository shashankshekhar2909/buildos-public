"use client";

import { useEffect, useMemo, useState } from "react";
import { Tag, Modal, TextInput, TextArea, Select, SelectItem, OverflowMenu, OverflowMenuItem } from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchToolbar } from "@/components/shared/search-toolbar";
import { EntityTable } from "@/components/shared/entity-table";
import { api } from "@/lib/api";
import type { ApiItem } from "@/lib/api";

function StarRating({ value }: { value: unknown }) {
  const n = Number(value ?? 0);
  const stars = Math.max(0, Math.min(5, Math.round(n)));
  return (
    <span style={{ letterSpacing: "0.05em", color: "var(--cds-text-primary)" }}>
      {"★".repeat(stars)}{"☆".repeat(5 - stars)}
    </span>
  );
}

export default function AISessionsPage() {
  const [aiSessions, setAiSessions] = useState<ApiItem[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [toolFilter, setToolFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [formTitle, setFormTitle] = useState("");
  const [formTool, setFormTool] = useState("codex");
  const [formModel, setFormModel] = useState("");
  const [formModule, setFormModule] = useState("manual");
  const [formSummary, setFormSummary] = useState("");
  const [formOutput, setFormOutput] = useState("");
  const [formTags, setFormTags] = useState("");
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.aiSessions().then(setAiSessions).catch(() => undefined).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = searchQ.trim().toLowerCase();
    return aiSessions.filter((item) => {
      const matchSearch =
        !term ||
        String(item.title ?? "").toLowerCase().includes(term) ||
        String(item.project ?? "").toLowerCase().includes(term);
      const tool = String(item.tool ?? "").toLowerCase();
      const matchTool = toolFilter === "all" || tool === toolFilter.toLowerCase();
      const srcModule = String(item.source_module ?? item.sourceModule ?? "").toLowerCase();
      const matchModule = moduleFilter === "all" || srcModule === moduleFilter.toLowerCase();
      return matchSearch && matchTool && matchModule;
    });
  }, [aiSessions, searchQ, toolFilter, moduleFilter]);

  const rows = filtered.map((item, i) => {
    const rawTags: string[] = Array.isArray(item.tags)
      ? (item.tags as string[])
      : String(item.tags ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

    return {
      id: `${item.id ?? i}`,
      title: (
        <span className="cell--truncate" title={String(item.title ?? "")}>
          {item.title}
        </span>
      ),
      tool: item.tool,
      model: item.model,
      module: item.source_module ?? item.sourceModule,
      tags: (
        <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
          {rawTags.map((tag) => (
            <Tag key={tag} type="cool-gray" size="sm">{tag}</Tag>
          ))}
        </div>
      ),
      rating: <StarRating value={item.rating} />,
      project: item.project ?? "-",
      date: (item.created_at || item.createdDate || "").toString().slice(0, 10),
      actions: (
        <OverflowMenu size="sm" flipped iconDescription="AI session actions">
          <OverflowMenuItem
            itemText="Edit"
            onClick={() => {
              setEditId(typeof item.id === "number" ? item.id : null);
              setFormTitle(String(item.title ?? ""));
              setFormTool(String(item.tool ?? "codex"));
              setFormModel(String(item.model ?? ""));
              setFormModule(String(item.source_module ?? "manual"));
              setFormSummary(String(item.summary ?? ""));
              setFormOutput(String(item.output_text ?? ""));
              setFormTags(String(item.tags ?? ""));
              setCreateError("");
              setIsCreateOpen(true);
            }}
          />
          <OverflowMenuItem
            hasDivider
            isDelete
            itemText="Delete"
            onClick={() => {
              setEditId(typeof item.id === "number" ? item.id : null);
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
        title="AI Sessions"
        description="Saved AI execution runs with tool and model context."
        actionLabel="Save AI Session"
        onAction={() => setIsCreateOpen(true)}
      />
      <EntityTable
        title="AI Sessions"
        loading={loading}
        toolbar={
          <SearchToolbar
            searchLabel="Search sessions"
            searchValue={searchQ}
            onSearch={setSearchQ}
            filterA={{ id: "tool", label: "Tool", items: ["Codex", "Claude", "Aider"], value: toolFilter, onChange: setToolFilter }}
            filterB={{ id: "module", label: "Source Module", items: ["Projects", "Architecture", "Prompts"], value: moduleFilter, onChange: setModuleFilter }}
          />
        }
        headers={[
          { key: "title", header: "Title" },
          { key: "tool", header: "Tool" },
          { key: "model", header: "Model" },
          { key: "module", header: "Source Module" },
          { key: "tags", header: "Tags" },
          { key: "rating", header: "Rating" },
          { key: "project", header: "Project" },
          { key: "date", header: "Created" },
          { key: "actions", header: "" },
        ]}
        rows={rows}
      />
      <Modal
        open={isCreateOpen}
        modalHeading={editId ? "Edit AI Session" : "Save AI Session"}
        primaryButtonText={createBusy ? (editId ? "Saving..." : "Saving...") : (editId ? "Save" : "Save")}
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
              tool: formTool,
              model: formModel.trim() || null,
              source_module: formModule,
              summary: formSummary.trim() || null,
              output_text: formOutput.trim() || null,
              tags: formTags.trim() || null,
              rating: 0,
            };
            if (editId) await api.updateAiSession(editId, payload);
            else await api.createAiSession(payload);
            setAiSessions(await api.aiSessions());
            setIsCreateOpen(false);
            setEditId(null);
            setFormTitle("");
            setFormTool("codex");
            setFormModel("");
            setFormModule("manual");
            setFormSummary("");
            setFormOutput("");
            setFormTags("");
          } catch (e) {
            setCreateError(e instanceof Error ? e.message : "Failed to save AI session");
          } finally {
            setCreateBusy(false);
          }
        }}
      >
        <TextInput id="ai-title" labelText="Title" value={formTitle} onChange={(e) => setFormTitle(e.currentTarget.value)} />
        <div style={{ height: "0.75rem" }} />
        <Select id="ai-tool" labelText="Tool" value={formTool} onChange={(e) => setFormTool(e.currentTarget.value)}>
          <SelectItem value="codex" text="codex" />
          <SelectItem value="claude" text="claude" />
          <SelectItem value="aider" text="aider" />
        </Select>
        <div style={{ height: "0.75rem" }} />
        <TextInput id="ai-model" labelText="Model" value={formModel} onChange={(e) => setFormModel(e.currentTarget.value)} />
        <div style={{ height: "0.75rem" }} />
        <Select id="ai-module" labelText="Source Module" value={formModule} onChange={(e) => setFormModule(e.currentTarget.value)}>
          <SelectItem value="manual" text="manual" />
          <SelectItem value="projects" text="projects" />
          <SelectItem value="prompts" text="prompts" />
          <SelectItem value="architecture" text="architecture" />
        </Select>
        <div style={{ height: "0.75rem" }} />
        <TextInput id="ai-tags" labelText="Tags (comma-separated)" value={formTags} onChange={(e) => setFormTags(e.currentTarget.value)} />
        <div style={{ height: "0.75rem" }} />
        <TextArea id="ai-summary" labelText="Summary" rows={3} value={formSummary} onChange={(e) => setFormSummary(e.currentTarget.value)} />
        <div style={{ height: "0.75rem" }} />
        <TextArea id="ai-output" labelText="Output Text" rows={6} value={formOutput} onChange={(e) => setFormOutput(e.currentTarget.value)} />
        {createError ? <p style={{ color: "var(--cds-support-error)", marginTop: "0.75rem" }}>{createError}</p> : null}
      </Modal>
      <Modal
        open={isDeleteOpen}
        modalHeading="Delete AI Session"
        danger
        primaryButtonText="Delete"
        secondaryButtonText="Cancel"
        onRequestClose={() => setIsDeleteOpen(false)}
        onRequestSubmit={async () => {
          if (!editId) return;
          await api.deleteAiSession(editId);
          setAiSessions(await api.aiSessions());
          setIsDeleteOpen(false);
          setEditId(null);
        }}
      >
        This AI session will be permanently deleted.
      </Modal>
    </>
  );
}
