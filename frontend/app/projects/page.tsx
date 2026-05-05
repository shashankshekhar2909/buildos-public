"use client";

import { useEffect, useMemo, useState } from "react";
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
import { PageHeader } from "@/components/shared/page-header";
import { SearchToolbar } from "@/components/shared/search-toolbar";
import { EntityTable } from "@/components/shared/entity-table";
import { PriorityTag, StatusTag } from "@/components/shared/tags";
import { api } from "@/lib/api";
import type { ApiItem } from "@/lib/api";
import { projects as mockProjects } from "@/lib/mock-data";

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
  const [projects, setProjects] = useState<ApiItem[]>(mockProjects as unknown as ApiItem[]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [projectForm, setProjectForm] = useState<ProjectForm>(emptyProject);
  const [isFilesOpen, setIsFilesOpen] = useState(false);
  const [filesProjectName, setFilesProjectName] = useState("");
  const [filesPath, setFilesPath] = useState(".");
  const [files, setFiles] = useState<ApiItem[]>([]);
  const [filesError, setFilesError] = useState("");
  const [isFinderOpen, setIsFinderOpen] = useState(false);
  const [discovered, setDiscovered] = useState<ApiItem[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [finderRoot, setFinderRoot] = useState("");
  const [finderMessage, setFinderMessage] = useState("");

  const refreshProjects = () => api.projects().then(setProjects).catch(() => undefined);

  useEffect(() => {
    refreshProjects();
  }, []);

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

  const rows = projects.map((project, i) => ({
    id: `${project.id ?? i}`,
    name: <Link href={`/projects/${project.slug}`}>{project.name}</Link>,
    category: project.category,
    status: <StatusTag value={String(project.status ?? "idea")} />,
    priority: <PriorityTag value={String(project.priority ?? "low")} />,
    git: String(
      project.github_url ??
      project.git_url ??
      project.repo_url ??
      project.html_url ??
      project.clone_url ??
      "-"
    ),
    updated: (project.updated_at || "").toString().slice(0, 10) || project.updatedDate || "-",
    actions: (
      <>
        <Button as={Link} href={`/projects/${project.slug}`} kind="ghost" size="sm">Open</Button>
        <Button kind="ghost" size="sm" onClick={() => void openFiles(project)}>Browse Files</Button>
        <OverflowMenu size="sm" flipped>
          <OverflowMenuItem itemText="Edit" />
        </OverflowMenu>
      </>
    ),
  }));

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
    setSelectedNames([]);
    setFinderMessage("");
    setIsFinderOpen(true);
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

      <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "flex-end" }}>
        <Button kind="secondary" onClick={() => { void openFinder(); }}>Find Existing Projects</Button>
      </div>

      <EntityTable
        title="Projects"
        toolbar={
          <SearchToolbar
            searchLabel="Search projects"
            filterA={{ id: "status", label: "Status", items: ["active", "paused", "planned"] }}
            filterB={{ id: "priority", label: "Priority", items: ["critical", "high", "medium", "low"] }}
          />
        }
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

      {/* Create Project Modal */}
      <Modal
        open={isCreateOpen}
        modalHeading="Create Project"
        primaryButtonText="Create"
        secondaryButtonText="Cancel"
        onRequestClose={() => setIsCreateOpen(false)}
        onRequestSubmit={() => { void onCreateProject(); }}
      >
        <div style={{ display: "grid", gap: "0.75rem" }}>
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
              <div key={`${name}-${idx}`} style={{ border: "1px solid var(--cds-border-subtle-01)", padding: "0.5rem" }}>
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
    </>
  );
}
