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
  SkeletonText,
  SkeletonPlaceholder,
  Button,
  TextArea,
  TextInput,
  Checkbox,
  Accordion,
  AccordionItem,
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
  const [contextGoal, setContextGoal] = useState("");
  const [contextState, setContextState] = useState("");
  const [contextStack, setContextStack] = useState("");
  const [contextAgent, setContextAgent] = useState("codex");
  const [contextExtra, setContextExtra] = useState("");
  const [contextFiles, setContextFiles] = useState<string[]>([
    "AGENTS.md",
    "CLAUDE.md",
    "CODEX.md",
    "PLAN.md",
    "ARCHITECTURE.md",
    "UI_SPEC.md",
    "API_SPEC.md",
    "DATA_MODEL.md",
  ]);
  const [generatedFiles, setGeneratedFiles] = useState<Array<{ filename: string; content: string }>>([]);
  const [contextError, setContextError] = useState("");
  const [contextLoading, setContextLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [contextConfigured, setContextConfigured] = useState<boolean | null>(null);
  const [contextProviderLabel, setContextProviderLabel] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.projects()
      .then(async (projects) => {
        const p = projects.find((item) => String(item.slug) === params.slug);
        if (!p || typeof p.id !== "number") {
          router.replace("/projects");
          return;
        }
        setProject(p);
        setContextGoal(String(p.goal ?? ""));
        setContextStack(String(p.tech_stack ?? ""));

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
      .catch(() => router.replace("/projects"))
      .finally(() => setLoading(false));
  }, [params.slug, router]);

  useEffect(() => {
    api
      .aiContextCapabilities()
      .then((d) => {
        setContextConfigured(Boolean(d.configured));
        const model = String(d.model ?? "");
        const provider = String(d.provider_url ?? "");
        setContextProviderLabel([model, provider].filter(Boolean).join(" @ "));
      })
      .catch(() => {
        setContextConfigured(false);
        setContextProviderLabel("");
      });
  }, []);

  const techStack = useMemo(
    () =>
      String(project?.tech_stack ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [project?.tech_stack]
  );

  if (loading || !project) {
    return (
      <>
        <div style={{ marginBottom: "var(--space-xl)" }}>
          <SkeletonText heading width="40%" />
          <div style={{ marginTop: "var(--space-sm)" }}>
            <SkeletonText paragraph lineCount={2} width="60%" />
          </div>
        </div>
        <SkeletonPlaceholder style={{ width: "100%", height: "8rem", marginBottom: "1rem" }} />
        <SkeletonText paragraph lineCount={4} width="100%" />
      </>
    );
  }

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
            {(() => {
              const localPath = String(project.local_path ?? "-");
              const publicUrl = String(project.public_url ?? "-");
              const gitUrl = String(
                project.github_url ??
                project.git_url ??
                project.repo_url ??
                project.html_url ??
                project.clone_url ??
                "-"
              );
              return (
                <>
                  <p style={{ margin: 0 }}>
                    <strong>Local Path:</strong>{" "}
                    <code
                      className="cell--truncate"
                      style={{ display: "inline-block", maxWidth: "28rem", verticalAlign: "bottom" }}
                      title={localPath}
                    >
                      {localPath}
                    </code>
                  </p>
                  <p style={{ margin: "0.35rem 0 0" }}>
                    <strong>Public URL:</strong>{" "}
                    <span className="cell--truncate" style={{ display: "inline-block", maxWidth: "28rem", verticalAlign: "bottom" }} title={publicUrl}>
                      {publicUrl}
                    </span>
                  </p>
                  <p style={{ margin: "0.35rem 0 0" }}>
                    <strong>Git Origin:</strong>{" "}
                    <span className="cell--truncate" style={{ display: "inline-block", maxWidth: "28rem", verticalAlign: "bottom" }} title={gitUrl}>
                      {gitUrl}
                    </span>
                  </p>
                </>
              );
            })()}
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
          <Tab>Context</Tab>
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

          <TabPanel>
            <Tile className="detail-tile" style={{ marginBottom: "1rem" }}>
              {contextConfigured === false ? (
                <InlineNotification
                  kind="warning"
                  hideCloseButton
                  lowContrast
                  title="AI context generation is not configured"
                  subtitle="Set AI_CONTEXT_PROVIDER_URL, AI_CONTEXT_MODEL, and AI_CONTEXT_API_KEY in backend env."
                  style={{ marginBottom: "1rem" }}
                />
              ) : null}
              {contextConfigured === true && contextProviderLabel ? (
                <InlineNotification
                  kind="info"
                  hideCloseButton
                  lowContrast
                  title="Generator ready"
                  subtitle={contextProviderLabel}
                  style={{ marginBottom: "1rem" }}
                />
              ) : null}
              <Grid fullWidth>
                <Column sm={4} md={4} lg={8}>
                  <TextInput
                    id="context-target-agent"
                    labelText="Target Agent"
                    value={contextAgent}
                    onChange={(e) => setContextAgent(e.currentTarget.value)}
                  />
                </Column>
                <Column sm={4} md={4} lg={8}>
                  <TextInput
                    id="context-tech-stack"
                    labelText="Tech Stack"
                    value={contextStack}
                    onChange={(e) => setContextStack(e.currentTarget.value)}
                  />
                </Column>
                <Column sm={4} md={8} lg={16}>
                  <TextArea
                    id="context-goal"
                    labelText="Goal"
                    rows={3}
                    value={contextGoal}
                    onChange={(e) => setContextGoal(e.currentTarget.value)}
                  />
                </Column>
                <Column sm={4} md={8} lg={16}>
                  <TextArea
                    id="context-state"
                    labelText="Current State"
                    rows={3}
                    value={contextState}
                    onChange={(e) => setContextState(e.currentTarget.value)}
                  />
                </Column>
                <Column sm={4} md={8} lg={16}>
                  <TextArea
                    id="context-extra"
                    labelText="Additional Context"
                    rows={4}
                    value={contextExtra}
                    onChange={(e) => setContextExtra(e.currentTarget.value)}
                  />
                </Column>
                <Column sm={4} md={8} lg={16}>
                  <p style={{ margin: "0 0 0.5rem", color: "var(--cds-text-secondary)" }}>Output Files</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1rem" }}>
                    {[
                      "AGENTS.md",
                      "CLAUDE.md",
                      "CODEX.md",
                      "PLAN.md",
                      "ARCHITECTURE.md",
                      "UI_SPEC.md",
                      "API_SPEC.md",
                      "DATA_MODEL.md",
                    ].map((file) => (
                      <Checkbox
                        key={file}
                        id={`ctx-file-${file}`}
                        labelText={file}
                        checked={contextFiles.includes(file)}
                        onChange={(checked) =>
                          setContextFiles((prev) =>
                            checked ? [...prev, file] : prev.filter((f) => f !== file)
                          )
                        }
                      />
                    ))}
                  </div>
                </Column>
                <Column sm={4} md={8} lg={16}>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                    <Button
                      disabled={contextLoading || contextFiles.length === 0 || contextConfigured !== true}
                      onClick={async () => {
                        if (typeof project.id !== "number") return;
                        setContextError("");
                        setContextLoading(true);
                        try {
                          const out = await api.generateProjectContext({
                            project_id: project.id,
                            target_agent: contextAgent || "codex",
                            desired_files: contextFiles,
                            goal: contextGoal,
                            current_state: contextState,
                            tech_stack: contextStack,
                            extra_context: contextExtra,
                          });
                          const files = Array.isArray(out.files)
                            ? out.files
                                .filter((f): f is { filename: string; content: string } => !!f && typeof f === "object")
                                .map((f) => ({
                                  filename: String((f as Record<string, unknown>).filename ?? ""),
                                  content: String((f as Record<string, unknown>).content ?? ""),
                                }))
                            : [];
                          setGeneratedFiles(files);
                        } catch (e) {
                          setContextError(e instanceof Error ? e.message : "Failed to generate context");
                        } finally {
                          setContextLoading(false);
                        }
                      }}
                    >
                      {contextLoading ? "Generating..." : "Generate Context Files"}
                    </Button>
                    <Button
                      kind="secondary"
                      disabled={saveLoading || generatedFiles.length === 0 || typeof project.id !== "number"}
                      onClick={async () => {
                        if (typeof project.id !== "number") return;
                        const merged = generatedFiles
                          .map((f) => `# ${f.filename}\n\n${f.content}`)
                          .join("\n\n---\n\n");
                        setSaveLoading(true);
                        try {
                          await api.createAiSession({
                            title: `Context Pack: ${String(project.name ?? "Project")}`,
                            tool: "codex",
                            model: "context-generator",
                            input_prompt: contextExtra || contextGoal,
                            output_text: merged,
                            summary: `Generated ${generatedFiles.length} context files for ${String(project.name ?? "project")}`,
                            project_id: project.id,
                            source_module: "project-context-generator",
                            tags: "context,agents,planning",
                            rating: 0,
                          });
                        } catch (e) {
                          setContextError(e instanceof Error ? e.message : "Failed to save AI session");
                        } finally {
                          setSaveLoading(false);
                        }
                      }}
                    >
                      {saveLoading ? "Saving..." : "Save To AI Sessions"}
                    </Button>
                  </div>
                </Column>
              </Grid>
            </Tile>

            {contextError ? (
              <InlineNotification
                kind="error"
                hideCloseButton
                lowContrast
                title="Context generation failed"
                subtitle={contextError}
                style={{ marginBottom: "1rem" }}
              />
            ) : null}

            {generatedFiles.length === 0 ? (
              <EmptyState title="No generated files yet" description="Run context generation to review and export markdown files." />
            ) : (
              <Accordion align="start">
                {generatedFiles.map((f) => (
                  <AccordionItem key={f.filename} title={f.filename}>
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <Button
                        size="sm"
                        kind="tertiary"
                        onClick={() => {
                          void copyText(f.content);
                        }}
                      >
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        kind="tertiary"
                        onClick={() => {
                          const blob = new Blob([f.content], { type: "text/markdown;charset=utf-8" });
                          const href = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = href;
                          a.download = f.filename;
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          URL.revokeObjectURL(href);
                        }}
                      >
                        Export
                      </Button>
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        background: "var(--cds-layer)",
                        padding: "0.75rem",
                        borderRadius: "4px",
                        border: "1px solid var(--cds-border-subtle)",
                        maxHeight: "24rem",
                        overflow: "auto",
                      }}
                    >
                      {f.content}
                    </pre>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </TabPanel>

        </TabPanels>
      </Tabs>
    </>
  );
}
