"use client";

import { useEffect, useState } from "react";
import { Grid, Column, Tile } from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchToolbar } from "@/components/shared/search-toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { api } from "@/lib/api";
import type { ApiItem } from "@/lib/api";
import { knowledgeNotes as mockNotes } from "@/lib/mock-data";
import { StatusTag } from "@/components/shared/tags";

export default function KnowledgePage() {
  const [knowledgeNotes, setKnowledgeNotes] = useState<ApiItem[]>(mockNotes as unknown as ApiItem[]);
  useEffect(() => {
    api.knowledge().then(setKnowledgeNotes).catch(() => undefined);
  }, []);

  return (
    <>
      <PageHeader title="Knowledge" description="Operational notes and reusable implementation insights." actionLabel="New Note" />
      <SearchToolbar searchLabel="Search notes" filterA={{ id: "status", label: "Status", items: ["active", "planned"] }} />
      <Grid fullWidth>
        {knowledgeNotes.map((note, i) => <Column key={`${note.id ?? i}`} sm={4} md={4} lg={5} style={{ marginBottom: "1rem" }}><Tile><StatusTag value={String(note.status ?? "active")} /><p style={{ marginTop: "0.75rem" }}>{note.content ?? note.text}</p><p style={{ color: "#6f6f6f" }}>{note.project ?? "General"}</p></Tile></Column>)}
      </Grid>
      <EmptyState title="No archived notes" description="Archive is empty for now." actionLabel="Create Note" />
    </>
  );
}
