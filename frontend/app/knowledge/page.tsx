"use client";

import { useEffect, useMemo, useState } from "react";
import { Grid, Column, Tile, Search, Select, SelectItem, Tag } from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusTag } from "@/components/shared/tags";
import { api } from "@/lib/api";
import type { ApiItem } from "@/lib/api";
import { knowledgeNotes as mockNotes } from "@/lib/mock-data";

export default function KnowledgePage() {
  const [knowledgeNotes, setKnowledgeNotes] = useState<ApiItem[]>(mockNotes as unknown as ApiItem[]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    api.knowledge().then(setKnowledgeNotes).catch(() => undefined);
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return knowledgeNotes.filter((note) => {
      const text = String(note.content ?? note.text ?? "").toLowerCase();
      const project = String(note.project ?? "").toLowerCase();
      const matchSearch = !term || text.includes(term) || project.includes(term);
      const matchStatus = statusFilter === "all" || String(note.status ?? "") === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [knowledgeNotes, query, statusFilter]);

  return (
    <>
      <PageHeader
        title="Knowledge"
        description="Operational notes and reusable implementation insights."
        actionLabel="New Note"
        onAction={() => setIsCreateOpen(true)}
      />
      {isCreateOpen && null}

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
            id="knowledge-status"
            labelText="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <SelectItem value="all" text="All statuses" />
            <SelectItem value="active" text="active" />
            <SelectItem value="planned" text="planned" />
            <SelectItem value="archived" text="archived" />
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
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
                    <StatusTag value={String(note.status ?? "active")} />
                    {project && <Tag type="blue" size="sm">{project}</Tag>}
                  </div>
                  <p className="knowledge-card__text">{note.content ?? note.text}</p>
                  <p className="knowledge-card__meta">{note.project ?? "General"}</p>
                </Tile>
              </Column>
            );
          })}
        </Grid>
      )}
    </>
  );
}
