"use client";

import { useEffect, useState } from "react";
import { Modal, TextInput, TextArea, Select, SelectItem, OverflowMenu, OverflowMenuItem } from "@carbon/react";
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

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<ApiItem[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [toolFilter, setToolFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("coding");
  const [formTool, setFormTool] = useState("codex");
  const [formModel, setFormModel] = useState("");
  const [formBody, setFormBody] = useState("");
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .prompts({
        search: searchQ || undefined,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        recommended_tool: toolFilter === "all" ? undefined : toolFilter,
      })
      .then(setPrompts)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [searchQ, categoryFilter, toolFilter]);

  const rows = prompts.map((p, i) => ({
    id: `${p.id ?? i}`,
    title: (
      <span className="cell--truncate" title={String(p.title ?? "")}>
        {p.title}
      </span>
    ),
    category: p.category,
    tool: p.recommended_tool ?? p.recommendedTool,
    model: p.recommended_model ?? p.recommendedModel,
    rating: <StarRating value={p.rating} />,
    project: p.project ?? "-",
    actions: (
      <OverflowMenu size="sm" flipped iconDescription="Prompt actions">
        <OverflowMenuItem itemText="Copy title" onClick={() => navigator.clipboard.writeText(String(p.title ?? ""))} />
        <OverflowMenuItem
          itemText="Edit"
          onClick={() => {
            setEditId(typeof p.id === "number" ? p.id : null);
            setFormTitle(String(p.title ?? ""));
            setFormCategory(String(p.category ?? "coding"));
            setFormTool(String(p.recommended_tool ?? "codex"));
            setFormModel(String(p.recommended_model ?? ""));
            setFormBody(String(p.body ?? ""));
            setCreateError("");
            setIsCreateOpen(true);
          }}
        />
        <OverflowMenuItem
          hasDivider
          isDelete
          itemText="Delete"
          onClick={() => {
            setEditId(typeof p.id === "number" ? p.id : null);
            setIsDeleteOpen(true);
          }}
        />
      </OverflowMenu>
    ),
  }));

  return (
    <>
      <PageHeader
        title="Prompts"
        description="Reusable prompts mapped to tools, models, and projects."
        actionLabel="New Prompt"
        onAction={() => setIsCreateOpen(true)}
      />
      <EntityTable
        title="Prompts"
        loading={loading}
        toolbar={
          <SearchToolbar
            searchLabel="Search prompts"
            searchValue={searchQ}
            onSearch={setSearchQ}
            filterA={{ id: "category", label: "Category", items: ["coding", "architecture"], value: categoryFilter, onChange: setCategoryFilter }}
            filterB={{ id: "tool", label: "Tool", items: ["codex", "claude", "aider"], value: toolFilter, onChange: setToolFilter }}
          />
        }
        headers={[
          { key: "title", header: "Title" },
          { key: "category", header: "Category" },
          { key: "tool", header: "Tool" },
          { key: "model", header: "Model" },
          { key: "rating", header: "Rating" },
          { key: "project", header: "Project" },
          { key: "actions", header: "" },
        ]}
        rows={rows}
      />
      <Modal
        open={isCreateOpen}
        modalHeading={editId ? "Edit Prompt" : "Create Prompt"}
        primaryButtonText={createBusy ? (editId ? "Saving..." : "Creating...") : (editId ? "Save" : "Create")}
        secondaryButtonText="Cancel"
        primaryButtonDisabled={createBusy || !formTitle.trim() || !formBody.trim()}
        onRequestClose={() => {
          setIsCreateOpen(false);
          setCreateError("");
        }}
        onRequestSubmit={async () => {
          setCreateError("");
          setCreateBusy(true);
          try {
            const slug = formTitle
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "");
            const payload = {
              title: formTitle.trim(),
              slug: slug || `prompt-${Date.now()}`,
              category: formCategory,
              body: formBody.trim(),
              recommended_tool: formTool,
              recommended_model: formModel.trim() || null,
            };
            if (editId) await api.updatePrompt(editId, payload);
            else await api.createPrompt(payload);
            const next = await api.prompts();
            setPrompts(next);
            setIsCreateOpen(false);
            setEditId(null);
            setFormTitle("");
            setFormCategory("coding");
            setFormTool("codex");
            setFormModel("");
            setFormBody("");
          } catch (e) {
            setCreateError(e instanceof Error ? e.message : "Failed to create prompt");
          } finally {
            setCreateBusy(false);
          }
        }}
      >
        <TextInput id="prompt-title" labelText="Title" value={formTitle} onChange={(e) => setFormTitle(e.currentTarget.value)} />
        <div style={{ height: "0.75rem" }} />
        <Select id="prompt-category" labelText="Category" value={formCategory} onChange={(e) => setFormCategory(e.currentTarget.value)}>
          <SelectItem value="coding" text="coding" />
          <SelectItem value="architecture" text="architecture" />
          <SelectItem value="writing" text="writing" />
          <SelectItem value="ops" text="ops" />
        </Select>
        <div style={{ height: "0.75rem" }} />
        <Select id="prompt-tool" labelText="Recommended Tool" value={formTool} onChange={(e) => setFormTool(e.currentTarget.value)}>
          <SelectItem value="codex" text="codex" />
          <SelectItem value="claude" text="claude" />
          <SelectItem value="aider" text="aider" />
        </Select>
        <div style={{ height: "0.75rem" }} />
        <TextInput id="prompt-model" labelText="Model (optional)" value={formModel} onChange={(e) => setFormModel(e.currentTarget.value)} />
        <div style={{ height: "0.75rem" }} />
        <TextArea id="prompt-body" labelText="Prompt Body" rows={8} value={formBody} onChange={(e) => setFormBody(e.currentTarget.value)} />
        {createError ? <p style={{ color: "var(--cds-support-error)", marginTop: "0.75rem" }}>{createError}</p> : null}
      </Modal>
      <Modal
        open={isDeleteOpen}
        modalHeading="Delete Prompt"
        danger
        primaryButtonText="Delete"
        secondaryButtonText="Cancel"
        onRequestClose={() => setIsDeleteOpen(false)}
        onRequestSubmit={async () => {
          if (!editId) return;
          await api.deletePrompt(editId);
          setPrompts(await api.prompts());
          setIsDeleteOpen(false);
          setEditId(null);
        }}
      >
        This prompt will be permanently deleted.
      </Modal>
    </>
  );
}
