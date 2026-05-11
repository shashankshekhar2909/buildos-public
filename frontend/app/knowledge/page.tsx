"use client";

import { useEffect, useMemo, useState } from "react";
import { Grid, Column, Tile, Search, Select, SelectItem, Tag, SkeletonText, Modal, TextInput, TextArea, Button } from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusTag } from "@/components/shared/tags";
import { api } from "@/lib/api";
import type { ApiItem } from "@/lib/api";

export default function KnowledgePage() {
  const [knowledgeNotes, setKnowledgeNotes] = useState<ApiItem[]>([]);
  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formSource, setFormSource] = useState("manual");
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.knowledge().then(setKnowledgeNotes).catch(() => undefined).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return knowledgeNotes.filter((note) => {
      const text = String(note.content ?? note.text ?? "").toLowerCase();
      const project = String(note.project ?? "").toLowerCase();
      const source = String(note.source_type ?? "manual");
      const matchSearch = !term || text.includes(term) || project.includes(term);
      const matchSource = sourceFilter === "all" || source === sourceFilter;
      return matchSearch && matchSource;
    });
  }, [knowledgeNotes, query, sourceFilter]);

  return (
    <>
      <PageHeader
        title="Knowledge"
        description="Operational notes and reusable implementation insights."
        actionLabel="New Note"
        onAction={() => setIsCreateOpen(true)}
      />
      <div className="filter-bar">
        <div className="filter-bar__search">
          <Search
            id="knowledge-search"
            labelText="Search notes"
            placeholder="Filter by text or project..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="filter-bar__select">
          <Select
            id="knowledge-source"
            labelText="Source"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <SelectItem value="all" text="All sources" />
            <SelectItem value="manual" text="manual" />
            <SelectItem value="project" text="project" />
            <SelectItem value="meeting" text="meeting" />
            <SelectItem value="agent" text="agent" />
          </Select>
        </div>
      </div>

      {loading ? (
        <SkeletonText paragraph lineCount={8} width="100%" />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No notes match"
          description="Try a different search term or clear the filter."
        />
      ) : (
        <Grid fullWidth>
          {filtered.map((note, i) => {
            const project = String(note.project ?? "");
            return (
              <Column key={`${note.id ?? i}`} sm={4} md={4} lg={8} className="column--stack">
                <Tile className="knowledge-card">
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                    <StatusTag value={String(note.source_type ?? "manual")} />
                    {project && <Tag type="blue" size="sm">{project}</Tag>}
                  </div>
                  <p className="knowledge-card__text">{note.content ?? note.text}</p>
                  <p className="knowledge-card__meta">{note.project ?? "General"}</p>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Button
                      kind="tertiary"
                      size="sm"
                      onClick={() => {
                        setEditId(typeof note.id === "number" ? note.id : null);
                        setFormTitle(String(note.title ?? ""));
                        setFormContent(String(note.content ?? note.text ?? ""));
                        setFormSource(String(note.source_type ?? "manual"));
                        setIsCreateOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      kind="danger--tertiary"
                      size="sm"
                      onClick={() => {
                        setEditId(typeof note.id === "number" ? note.id : null);
                        setIsDeleteOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </Tile>
              </Column>
            );
          })}
        </Grid>
      )}
      <Modal
        open={isCreateOpen}
        modalHeading={editId ? "Edit Knowledge Note" : "Create Knowledge Note"}
        primaryButtonText={createBusy ? (editId ? "Saving..." : "Creating...") : (editId ? "Save" : "Create")}
        secondaryButtonText="Cancel"
        primaryButtonDisabled={createBusy || !formTitle.trim() || !formContent.trim()}
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
              content: formContent.trim(),
              source_type: formSource,
            };
            if (editId) await api.updateKnowledge(editId, payload);
            else await api.createKnowledge(payload);
            setKnowledgeNotes(await api.knowledge());
            setIsCreateOpen(false);
            setEditId(null);
            setFormTitle("");
            setFormContent("");
            setFormSource("manual");
          } catch (e) {
            setCreateError(e instanceof Error ? e.message : "Failed to create note");
          } finally {
            setCreateBusy(false);
          }
        }}
      >
        <TextInput id="knowledge-title" labelText="Title" value={formTitle} onChange={(e) => setFormTitle(e.currentTarget.value)} />
        <div style={{ height: "0.75rem" }} />
        <Select id="knowledge-source" labelText="Source Type" value={formSource} onChange={(e) => setFormSource(e.currentTarget.value)}>
          <SelectItem value="manual" text="manual" />
          <SelectItem value="project" text="project" />
          <SelectItem value="meeting" text="meeting" />
          <SelectItem value="agent" text="agent" />
        </Select>
        <div style={{ height: "0.75rem" }} />
        <TextArea id="knowledge-content" labelText="Content" rows={8} value={formContent} onChange={(e) => setFormContent(e.currentTarget.value)} />
        {createError ? <p style={{ color: "var(--cds-support-error)", marginTop: "0.75rem" }}>{createError}</p> : null}
      </Modal>
      <Modal
        open={isDeleteOpen}
        modalHeading="Delete Knowledge Note"
        danger
        primaryButtonText="Delete"
        secondaryButtonText="Cancel"
        onRequestClose={() => setIsDeleteOpen(false)}
        onRequestSubmit={async () => {
          if (!editId) return;
          await api.deleteKnowledge(editId);
          setKnowledgeNotes(await api.knowledge());
          setIsDeleteOpen(false);
          setEditId(null);
        }}
      >
        This knowledge note will be permanently deleted.
      </Modal>
    </>
  );
}
