"use client";

import { notFound, useParams } from "next/navigation";
import { Tab, TabList, TabPanel, TabPanels, Tabs, Tile, Button, Tag } from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PriorityTag, StatusTag } from "@/components/shared/tags";
import { aiSessions, contentItems, knowledgeNotes, projects, prompts, tasks } from "@/lib/mock-data";

export default function ProjectDetailPage() {
  const params = useParams<{ slug: string }>();
  const project = projects.find((item) => item.slug === params.slug);
  if (!project) return notFound();

  return (
    <>
      <PageHeader title={project.name} description={project.goal} actionLabel="Generate Context Files" />
      <Tile style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <StatusTag value={project.status} />
          <PriorityTag value={project.priority} />
          <Tag type="blue">{project.category}</Tag>
          {project.techStack.map((item) => <Tag key={item} type="cool-gray">{item}</Tag>)}
        </div>
      </Tile>
      <Tabs>
        <TabList aria-label="Project modules">
          <Tab>Overview</Tab>
          <Tab>Tasks</Tab>
          <Tab>Prompts</Tab>
          <Tab>Content</Tab>
          <Tab>AI Sessions</Tab>
          <Tab>Knowledge</Tab>
          <Tab>Context Generator</Tab>
        </TabList>
        <TabPanels>
          <TabPanel><p>{project.goal}</p></TabPanel>
          <TabPanel>{tasks.filter((t) => t.project === project.name).map((t) => <p key={t.title}>{t.title}</p>)}</TabPanel>
          <TabPanel>{prompts.filter((p) => p.project === project.name).map((p) => <p key={p.title}>{p.title}</p>)}</TabPanel>
          <TabPanel>{contentItems.filter((c) => c.project === project.name).map((c) => <p key={c.title}>{c.title}</p>)}</TabPanel>
          <TabPanel>{aiSessions.filter((s) => s.project === project.name).map((s) => <p key={s.title}>{s.title}</p>)}</TabPanel>
          <TabPanel>{knowledgeNotes.filter((k) => (k.project ?? project.name) === project.name).map((k) => <p key={k.text}>{k.text}</p>)}</TabPanel>
          <TabPanel>
            <EmptyState title="Context files not generated yet" description="Phase 1 keeps this static. Phase 4 will generate AGENTS.md, PLAN.md, ARCHITECTURE.md, and related files." actionLabel="Generate Context Files" />
            <div style={{ marginTop: "1rem" }}>
              <Button kind="primary">Generate Context Files</Button>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
}
