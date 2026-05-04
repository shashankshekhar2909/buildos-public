"use client";

import { Grid, Column, Tile } from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchToolbar } from "@/components/shared/search-toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { knowledgeNotes } from "@/lib/mock-data";
import { StatusTag } from "@/components/shared/tags";

export default function KnowledgePage() {
  return (
    <>
      <PageHeader title="Knowledge" description="Operational notes and reusable implementation insights." actionLabel="New Note" />
      <SearchToolbar searchLabel="Search notes" filterA={{ id: "status", label: "Status", items: ["active", "planned"] }} />
      <Grid fullWidth>
        {knowledgeNotes.map((note) => (
          <Column key={note.text} sm={4} md={4} lg={5} style={{ marginBottom: "1rem" }}>
            <Tile>
              <StatusTag value={note.status} />
              <p style={{ marginTop: "0.75rem" }}>{note.text}</p>
              <p style={{ color: "#6f6f6f" }}>{note.project ?? "General"}</p>
            </Tile>
          </Column>
        ))}
      </Grid>
      <EmptyState title="No archived notes" description="Archive is empty in Phase 1 mock data." actionLabel="Create Note" />
    </>
  );
}
