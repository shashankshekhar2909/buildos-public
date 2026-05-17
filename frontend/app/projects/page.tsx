"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Button,
  Checkbox,
  Modal,
  OverflowMenu,
  OverflowMenuItem,
  Select,
  SelectItem,
  TextArea,
  TextInput,
  InlineNotification,
  Tag,
} from "@carbon/react";
import { ContentSwitcher, Switch } from "@carbon/react";
import { FolderDetails as FolderIcon, Launch } from "@carbon/icons-react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchToolbar } from "@/components/shared/search-toolbar";
import { EntityTable } from "@/components/shared/entity-table";
import { PriorityTag, StatusTag } from "@/components/shared/tags";
import { api } from "@/lib/api";
import type { ApiItem } from "@/lib/api";
import { useAuthContext } from "@/components/shell/app-shell";

type ProjectForm = {
  name: string;
  slug: string;
  category: string;
  status: string;
  priority: string;
  goal: string;
};

const emptyProject: ProjectForm = {
  name: "",
  slug: "",
  category: "product",
  status: "active",
  priority: "medium",
  goal: "",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function ProjectsPage() {
  const { isAdmin } = useAuthContext();
  const [projects, setProjects] = useState<ApiItem[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [projectForm, setProjectForm] = useState<ProjectForm>(emptyProject);
  const [isFilesOpen, setIsFilesOpen] = useState(false);
  const [filesProjectName, setFilesProjectName] = useState("");
  const [filesPath, setFilesPath] = useState(".");
  const [files, setFiles] = useState<ApiItem[]>([]);
  const [filesError, setFilesError] = useState("");
  const [isFinderOpen, setIsFinderOpen] = useState(false);
  const [isRootOpen, setIsRootOpen] = useState(false);
  const [discovered, setDiscovered] = useState<ApiItem[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [finderRoot, setFinderRoot] = useState("");
  const [finderRoots, setFinderRoots] = useState<string[]>([]);
  const [finderMessage, setFinderMessage] = useState("");
  const [newRootPath, setNewRootPath] = useState("");
  const [rootError, setRootError] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const refreshProjects = useCallback(async () => {
    try {
      const data = await api.projects({
        search: searchQ || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        priority: priorityFilter === "all" ? undefined : priorityFilter,
      });
      setProjects(data);
      setApiError("");
    } catch {
      setApiError("Could not load projects. Check that the backend is running.");
    }
  }, [searchQ, statusFilter, priorityFilter]);

  useEffect(() => {
    setLoading(true);
    refreshProjects().finally(() => setLoading(false));
  }, [refreshProjects]);

  const openFiles = async (project: ApiItem, path = ".") => {
    try {
      const data = await api.projectFiles(String(project.id ?? ""), path);
      setFiles((data.items as ApiItem[]) ?? []);
      setFilesPath(String(data.current_path ?? "."));
      setFilesProjectName(String(project.name ?? "Project"));
      setFilesError("");
      setIsFilesOpen(true);
    } catch {
      setFiles([]);
      setFilesError("Could not load project files. Ensure the backend is running.");
      setFilesProjectName(String(project.name ?? "Project"));
      setIsFilesOpen(true);
    }
  };

  const fileRows = useMemo(
    () =>
      files.map((item, i) => ({
        id: String(i),
        name: String(item.name ?? ""),
        type: item.is_dir ? <Tag type="blue">folder</Tag> : <Tag type="cool-gray">file</Tag>,
        path: String(item.path ?? ""),
        size: item.is_dir ? "-" : String(item.size ?? 0),
        updated: String(item.updated_at ?? "").slice(0, 19).replace("T", " "),
      })),
    [files]
  );

  const rows = projects.map((project, i) => {
    const gitUrl = String(
      project.github_url ??
      project.git_url ??
      project.repo_url ??
      project.html_url ??
      project.clone_url ??
      "-"
    );
    return {
    id: `${project.id ?? i}`,
    name: <Link href={`/projects/${project.slug}`}>{project.name}</Link>,
    category: project.category,
    status: <StatusTag value={String(project.status ?? "idea")} />,
    priority: <PriorityTag value={String(project.priority ?? "low")} />,
    git: gitUrl !== "-" ? (
      <span className="cell--truncate" title={gitUrl}>{gitUrl}</span>
    ) : "-",
    updated: (project.updated_at || "").toString().slice(0, 10) || project.updatedDate || "-",
    actions: (
      <>
        <Button as={Link} href={`/projects/${project.slug}`} kind="ghost" size="sm">Open</Button>
        <Button kind="ghost" size="sm" onClick={() => void openFiles(project)}>Browse Files</Button>
        {isAdmin ? (
          <OverflowMenu size="sm" flipped>
            <OverflowMenuItem itemText="Edit" />
          </OverflowMenu>
        ) : null}
      </>
    ),
  };
});

  const onCreateProject = async () => {
    const slug = projectForm.slug || slugify(projectForm.name);
    if (!projectForm.name.trim() || !slug.trim()) return;
    await api.createProject({
      name: projectForm.name,
      slug,
      category: projectForm.category,
      status: projectForm.status,
      priority: projectForm.priority,
      goal: projectForm.goal,
    });
    setIsCreateOpen(false);
    setProjectForm(emptyProject);
    await refreshProjects();
  };

  const openFinder = async () => {
    const data = await api.discoverProjects();
    setDiscovered((data.items as ApiItem[]) ?? []);
    setFinderRoot(String(data.root ?? ""));
    setFinderRoots(Array.isArray(data.roots) ? (data.roots as string[]) : []);
    setSelectedNames([]);
    setFinderMessage("");
    setIsFinderOpen(true);
  };

  const onAddRoot = async () => {
    const path = newRootPath.trim();
    if (!path) return;
    try {
      setRootError("");
      await api.addProjectFinderRoot(path);
      setNewRootPath("");
      setIsRootOpen(false);
      if (isFinderOpen) {
        await openFinder();
      }
    } catch (e) {
      setRootError(e instanceof Error ? e.message : "Failed to add directory");
    }
  };

  const onImportSelected = async () => {
    if (selectedNames.length === 0) return;
    const data = await api.importProjects(selectedNames);
    const imported = ((data.imported as ApiItem[]) ?? []).length;
    const skipped = ((data.skipped as ApiItem[]) ?? []).length;
    setFinderMessage(`Imported: ${imported}, Skipped: ${skipped}`);
    await refreshProjects();
    const fresh = await api.discoverProjects();
    setDiscovered((fresh.items as ApiItem[]) ?? []);
    setSelectedNames([]);
  };

  return (
    <>
      <PageHeader
        title="Projects"
        description="Track active and planned initiatives across product, content, and homelab work."
        actionLabel="New Project"
        onAction={() => setIsCreateOpen(true)}
      />

      {apiError && (
        <InlineNotification
          kind="error"
          lowContrast
          hideCloseButton
          title="API error"
          subtitle={apiError}
          className="notification--stacked"
        />
      )}

      <div style={{ marginBottom: "var(--space-md)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        <ContentSwitcher
          size="sm"
          selectedIndex={viewMode === "grid" ? 0 : 1}
          onChange={({ index }) => setViewMode(index === 0 ? "grid" : "table")}
          style={{ maxWidth: "16rem" }}
        >
          <Switch name="grid" text="Grid" />
          <Switch name="table" text="Table" />
        </ContentSwitcher>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button kind="tertiary" onClick={() => setIsRootOpen(true)}>Add Directory</Button>
          <Button kind="secondary" onClick={() => { void openFinder(); }}>Find Existing Projects</Button>
        </div>
      </div>

      <div style={{ marginBottom: "var(--space-md)" }}>
        <SearchToolbar
          searchLabel="Search projects"
          searchValue={searchQ}
          onSearch={setSearchQ}
          filterA={{ id: "status", label: "Status", items: ["active", "paused", "planned"], value: statusFilter, onChange: setStatusFilter }}
          filterB={{ id: "priority", label: "Priority", items: ["critical", "high", "medium", "low"], value: priorityFilter, onChange: setPriorityFilter }}
        />
      </div>

      {viewMode === "grid" ? (
        <div className="project-grid">
          {projects.map((project, i) => {
            const status = String(project.status ?? "idea");
            const accent = status === "active" ? "green" : status === "paused" ? "warm-gray" : status === "planned" ? "blue" : "gray";
            const gitUrl = String(project.github_url ?? project.git_url ?? project.repo_url ?? project.html_url ?? project.clone_url ?? "");
            return (
              <Link key={String(project.id ?? i)} href={`/projects/${project.slug}`} className="project-card-link">
                <div className={`project-card project-card--${accent}`}>
                  <div className="project-card__head">
                    <span className={`project-card__icon project-card__icon--${accent}`}><FolderIcon size={18} /></span>
                    <div className="project-card__title-wrap">
                      <h3 className="project-card__title">{String(project.name ?? "")}</h3>
                      <p className="project-card__category">{String(project.category ?? "-")}</p>
                    </div>
                  </div>
                  <p className="project-card__goal">{String(project.goal ?? "—")}</p>
                  <div className="project-card__tags">
                    <StatusTag value={status} />
                    <PriorityTag value={String(project.priority ?? "low")} />
                  </div>
                  <div className="project-card__foot">
                    <span className="project-card__meta">{(project.updated_at || "").toString().slice(0, 10) || "—"}</span>
                    {gitUrl ? (
                      <span className="project-card__git" title={gitUrl}><Launch size={12} /> git</span>
                    ) : null}
                  </div>
                </div>
              </Link>
            );
          })}
          {projects.length === 0 && !loading ? (
            <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
              <h3 className="empty-state__title">No projects yet</h3>
              <p className="empty-state__description">Create one or import existing repos from disk.</p>
            </div>
          ) : null}
        </div>
      ) : (
        <EntityTable
          title="Projects"
          loading={loading}
          headers={[
            { key: "name", header: "Name" },
            { key: "category", header: "Category" },
            { key: "status", header: "Status" },
            { key: "priority", header: "Priority" },
            { key: "git", header: "Git Origin" },
            { key: "updated", header: "Updated" },
            { key: "actions", header: "Actions" },
          ]}
          rows={rows}
        />
      )}

      {/* Create Project Modal */}
      <Modal
        open={isCreateOpen}
        modalHeading="Create Project"
        primaryButtonText="Create"
        secondaryButtonText="Cancel"
        onRequestClose={() => setIsCreateOpen(false)}
        onRequestSubmit={() => { void onCreateProject(); }}
      >
        <div style={{ display: "grid", gap: "var(--space-sm)" }}>
          <TextInput
            id="project-name"
            labelText="Name"
            value={projectForm.name}
            onChange={(e) => setProjectForm((p) => ({ ...p, name: e.target.value, slug: p.slug || slugify(e.target.value) }))}
          />
          <TextInput
            id="project-slug"
            labelText="Slug"
            value={projectForm.slug}
            onChange={(e) => setProjectForm((p) => ({ ...p, slug: slugify(e.target.value) }))}
          />
          <TextInput
            id="project-category"
            labelText="Category"
            value={projectForm.category}
            onChange={(e) => setProjectForm((p) => ({ ...p, category: e.target.value }))}
          />
          <Select
            id="project-status"
            labelText="Status"
            value={projectForm.status}
            onChange={(e) => setProjectForm((p) => ({ ...p, status: e.target.value }))}
          >
            <SelectItem value="active" text="active" />
            <SelectItem value="paused" text="paused" />
            <SelectItem value="planned" text="planned" />
            <SelectItem value="archived" text="archived" />
          </Select>
          <Select
            id="project-priority"
            labelText="Priority"
            value={projectForm.priority}
            onChange={(e) => setProjectForm((p) => ({ ...p, priority: e.target.value }))}
          >
            <SelectItem value="critical" text="critical" />
            <SelectItem value="high" text="high" />
            <SelectItem value="medium" text="medium" />
            <SelectItem value="low" text="low" />
          </Select>
          <TextArea
            id="project-goal"
            labelText="Goal"
            value={projectForm.goal}
            onChange={(e) => setProjectForm((p) => ({ ...p, goal: e.target.value }))}
            rows={3}
          />
        </div>
      </Modal>

      {/* Browse Files Modal */}
      <Modal
        open={isFilesOpen}
        modalHeading={`Project Files: ${filesProjectName}`}
        primaryButtonText="Close"
        passiveModal
        onRequestClose={() => setIsFilesOpen(false)}
      >
        <p style={{ marginBottom: "0.75rem" }}>Current path: <code>{filesPath}</code></p>
        {filesError ? (
          <InlineNotification
            kind="error"
            lowContrast
            hideCloseButton
            title="Browse error"
            subtitle={filesError}
            style={{ marginBottom: "0.75rem" }}
          />
        ) : null}
        <EntityTable
          title="Files"
          headers={[
            { key: "name", header: "Name" },
            { key: "type", header: "Type" },
            { key: "path", header: "Path" },
            { key: "size", header: "Size" },
            { key: "updated", header: "Updated" },
          ]}
          rows={fileRows}
        />
      </Modal>

      {/* Project Finder Modal */}
      <Modal
        open={isFinderOpen}
        modalHeading="Project Finder"
        primaryButtonText="Import Selected"
        secondaryButtonText="Close"
        onRequestClose={() => setIsFinderOpen(false)}
        onRequestSubmit={() => { void onImportSelected(); }}
      >
        <p style={{ marginBottom: "0.75rem" }}>Root: <code>{finderRoot}</code></p>
        <p style={{ marginBottom: "0.75rem" }}>Roots: <code>{finderRoots.join(", ") || "-"}</code></p>
        {finderMessage ? (
          <InlineNotification
            kind="success"
            lowContrast
            hideCloseButton
            title="Import status"
            subtitle={finderMessage}
            style={{ marginBottom: "0.75rem" }}
          />
        ) : null}
        <div style={{ display: "grid", gap: "0.5rem", maxHeight: "18rem", overflow: "auto", paddingRight: "0.25rem" }}>
          {discovered.map((item, idx) => {
            const name = String(item.name ?? "");
            const checked = selectedNames.includes(name);
            const disabled = Boolean(item.already_imported);
            return (
              <div key={`${name}-${idx}`} style={{ border: "1px solid var(--cds-border-subtle-01)", padding: "var(--space-xs)" }}>
                <Checkbox
                  id={`finder-${idx}`}
                  labelText={`${name} (${String(item.slug ?? "")})`}
                  checked={checked}
                  disabled={disabled}
                  onChange={(_, data) => {
                    const next = Boolean(data.checked)
                      ? [...selectedNames, name]
                      : selectedNames.filter((v) => v !== name);
                    setSelectedNames(next);
                  }}
                />
                <div style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>
                  <code>{String(item.path ?? "")}</code>
                  {disabled ? " — already imported" : ""}
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      <Modal
        open={isRootOpen}
        modalHeading="Add Project Directory"
        primaryButtonText="Add"
        secondaryButtonText="Cancel"
        onRequestClose={() => setIsRootOpen(false)}
        onRequestSubmit={() => { void onAddRoot(); }}
      >
        {rootError ? (
          <InlineNotification
            kind="error"
            lowContrast
            hideCloseButton
            title="Add directory failed"
            subtitle={rootError}
            style={{ marginBottom: "0.75rem" }}
          />
        ) : null}
        <TextInput
          id="project-root-path"
          labelText="Directory Path"
          placeholder="/app/projects,/workspace,/mnt/projects..."
          value={newRootPath}
          onChange={(e) => setNewRootPath(e.target.value)}
        />
      </Modal>
    </>
  );
}
