"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tile,
  Tag,
  StructuredListWrapper,
  StructuredListBody,
  StructuredListRow,
  StructuredListCell,
  InlineNotification,
  CopyButton,
  Grid,
  Column,
} from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PriorityTag, StatusTag } from "@/components/shared/tags";
import { api, type ApiItem } from "@/lib/api";
import { copyText } from "@/lib/clipboard";
import { mapDeploymentRows, type DeploymentView } from "@/lib/deployments";

export default function ProjectDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const [project, setProject] = useState<ApiItem | null>(null);
  const [projectTasks, setProjectTasks] = useState<ApiItem[]>([]);
  const [projectPrompts, setProjectPrompts] = useState<ApiItem[]>([]);
  const [projectContent, setProjectContent] = useState<ApiItem[]>([]);
  const [projectSessions, setProjectSessions] = useState<ApiItem[]>([]);
  const [projectNotes, setProjectNotes] = useState<ApiItem[]>([]);
  const [projectDeployments, setProjectDeployments] = useState<DeploymentView[]>([]);

  useEffect(() => {
    api.projects()
      .then(async (projects) => {
        const p = projects.find((item) => String(item.slug) === params.slug);
        if (!p || typeof p.id !== "number") {
          router.replace("/projects");
          return;
        }
        setProject(p);

        const [tasks, prompts, content, sessions, notes, deployments, allProjects] = await Promise.all([
          api.tasksByProject(p.id),
          api.promptsByProject(p.id),
          api.contentByProject(p.id),
          api.aiSessionsByProject(p.id),
          api.knowledgeByProject(p.id),
          api.deploymentsByProject(p.id),
          Promise.resolve(projects),
        ]);

        setProjectTasks(tasks);
        setProjectPrompts(prompts);
        setProjectContent(content);
        setProjectSessions(sessions);
        setProjectNotes(notes);
        setProjectDeployments(mapDeploymentRows(deployments, allProjects));
      })
      .catch(() => router.replace("/projects"));
  }, [params.slug, router]);

  const techStack = useMemo(
    () =>
      String(project?.tech_stack ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [project?.tech_stack]
  );

  if (!project) return null;

  return (
    <>
      <PageHeader
        title={String(project.name ?? "Project")}
        description={String(project.goal ?? "No project goal added yet.")}
        breadcrumbs={[{ label: "Projects", href: "/projects" }, { label: String(project.name ?? "Project") }]}
      />

      <Tile className="detail-tile" style={{ marginBottom: "1rem" }}>
        <Grid fullWidth>
          <Column sm={4} md={4} lg={8}>
            <div className="tag-row">
              <StatusTag value={String(project.status ?? "idea")} />
              <PriorityTag value={String(project.priority ?? "medium")} />
              <Tag type="blue" size="sm">{String(project.category ?? "product")}</Tag>
              {techStack.map((item) => <Tag key={item} type="cool-gray" size="sm">{item}</Tag>)}
            </div>
          </Column>
          <Column sm={4} md={4} lg={8}>
            <p style={{ margin: 0 }}><strong>Local Path:</strong> <code>{String(project.local_path ?? "-")}</code></p>
            <p style={{ margin: "0.35rem 0 0" }}><strong>Public URL:</strong> {String(project.public_url ?? "-")}</p>
            <p style={{ margin: "0.35rem 0 0" }}>
              <strong>Git Origin:</strong>{" "}
              {String(
                project.github_url ??
                project.git_url ??
                project.repo_url ??
                project.html_url ??
                project.clone_url ??
                "-"
              )}
            </p>
          </Column>
        </Grid>
      </Tile>

      <Tabs>
        <TabList aria-label="Project modules">
          <Tab>Overview</Tab>
          <Tab>Tasks</Tab>
          <Tab>Prompts</Tab>
          <Tab>Content</Tab>
          <Tab>AI Sessions</Tab>
          <Tab>Knowledge</Tab>
          <Tab>Deployments</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <p>{String(project.goal ?? "No goal configured.")}</p>
            <p style={{ color: "var(--cds-text-secondary)" }}>
              Linked records: {projectTasks.length} tasks, {projectPrompts.length} prompts, {projectContent.length} content items, {projectSessions.length} AI sessions, {projectNotes.length} notes, {projectDeployments.length} deployments.
            </p>
          </TabPanel>

          <TabPanel>
            {projectTasks.length === 0 ? <EmptyState title="No tasks" description="No tasks are mapped to this project yet." /> : (
              <StructuredListWrapper><StructuredListBody>{projectTasks.map((t, i) => <StructuredListRow key={`${t.id ?? i}`}><StructuredListCell>{String(t.title ?? "-")}</StructuredListCell><StructuredListCell><StatusTag value={String(t.status ?? "open")} /></StructuredListCell><StructuredListCell><PriorityTag value={String(t.priority ?? "medium")} /></StructuredListCell></StructuredListRow>)}</StructuredListBody></StructuredListWrapper>
            )}
          </TabPanel>

          <TabPanel>
            {projectPrompts.length === 0 ? <EmptyState title="No prompts" description="No prompts are mapped to this project yet." /> : (
              <StructuredListWrapper><StructuredListBody>{projectPrompts.map((p, i) => <StructuredListRow key={`${p.id ?? i}`}><StructuredListCell>{String(p.title ?? "-")}</StructuredListCell><StructuredListCell>{String(p.category ?? "-")}</StructuredListCell><StructuredListCell>{String(p.recommended_tool ?? "-")}</StructuredListCell></StructuredListRow>)}</StructuredListBody></StructuredListWrapper>
            )}
          </TabPanel>

          <TabPanel>
            {projectContent.length === 0 ? <EmptyState title="No content" description="No content records are mapped to this project yet." /> : (
              <StructuredListWrapper><StructuredListBody>{projectContent.map((c, i) => <StructuredListRow key={`${c.id ?? i}`}><StructuredListCell>{String(c.title ?? "-")}</StructuredListCell><StructuredListCell>{String(c.platform ?? "-")}</StructuredListCell><StructuredListCell><StatusTag value={String(c.status ?? "draft")} /></StructuredListCell></StructuredListRow>)}</StructuredListBody></StructuredListWrapper>
            )}
          </TabPanel>

          <TabPanel>
            {projectSessions.length === 0 ? <EmptyState title="No AI sessions" description="No AI session records are mapped to this project yet." /> : (
              <StructuredListWrapper><StructuredListBody>{projectSessions.map((s, i) => <StructuredListRow key={`${s.id ?? i}`}><StructuredListCell>{String(s.title ?? "-")}</StructuredListCell><StructuredListCell>{String(s.tool ?? "-")}</StructuredListCell><StructuredListCell>{String(s.model ?? "-")}</StructuredListCell></StructuredListRow>)}</StructuredListBody></StructuredListWrapper>
            )}
          </TabPanel>

          <TabPanel>
            {projectNotes.length === 0 ? <EmptyState title="No knowledge notes" description="No knowledge notes are mapped to this project yet." /> : (
              <StructuredListWrapper><StructuredListBody>{projectNotes.map((k, i) => <StructuredListRow key={`${k.id ?? i}`}><StructuredListCell>{String(k.title ?? "-")}</StructuredListCell><StructuredListCell>{String(k.source_type ?? "manual")}</StructuredListCell></StructuredListRow>)}</StructuredListBody></StructuredListWrapper>
            )}
          </TabPanel>

          <TabPanel>
            <InlineNotification kind="warning" lowContrast hideCloseButton title="Safety" subtitle="Do not expose admin/internal services publicly without Cloudflare Access or Tailscale." style={{ marginBottom: "1rem" }} />
            {projectDeployments.length === 0 ? (
              <EmptyState title="No deployments linked" description="Add service routing entries in Deployments and map them to this project." actionLabel="Add Deployment" />
            ) : (
              <StructuredListWrapper>
                <StructuredListBody>
                  {projectDeployments.map((d) => (
                    <StructuredListRow key={d.id}>
                      <StructuredListCell>{d.serviceName}</StructuredListCell>
                      <StructuredListCell>{d.containerName || "-"}</StructuredListCell>
                      <StructuredListCell>{d.internalUrl || "-"}</StructuredListCell>
                      <StructuredListCell>{d.publicUrl || d.publicDomain || d.cloudflareRouteHostname || "Private"}</StructuredListCell>
                      <StructuredListCell>
                        <StatusTag value={d.status} />
                      </StructuredListCell>
                      <StructuredListCell>
                        <div style={{ display: "flex", gap: "0.35rem" }}>
                          <CopyButton iconDescription="Copy internal URL" onClick={() => { void copyText(d.internalUrl || ""); }} />
                          <CopyButton iconDescription="Copy public URL" onClick={() => { void copyText(d.publicUrl || ""); }} />
                          <CopyButton
                            iconDescription="Copy docker logs command"
                            onClick={() =>
                              copyText(
                                d.containerName
                                  ? `docker logs --tail 200 -f ${d.containerName}`
                                  : "docker logs --tail 200 -f <container_name>"
                              )
                            }
                          />
                        </div>
                      </StructuredListCell>
                    </StructuredListRow>
                  ))}
                </StructuredListBody>
              </StructuredListWrapper>
            )}
          </TabPanel>

        </TabPanels>
      </Tabs>
    </>
  );
}
