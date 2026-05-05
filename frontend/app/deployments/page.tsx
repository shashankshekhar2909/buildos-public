"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  Column,
  CopyButton,
  Grid,
  InlineNotification,
  Modal,
  Search,
  Select,
  SelectItem,
  TextArea,
  TextInput,
  Tile,
} from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { EntityTable } from "@/components/shared/entity-table";
import { api, type ApiItem } from "@/lib/api";
import { fallbackDeployments, mapDeploymentRows, type DeploymentView } from "@/lib/deployments";

type DeploymentForm = {
  project_id: string;
  environment: string;
  service_name: string;
  service_type: string;
  docker_compose_project: string;
  docker_service_name: string;
  container_name: string;
  internal_host: string;
  internal_port: string;
  internal_url: string;
  public_domain: string;
  public_url: string;
  cloudflare_tunnel_name: string;
  cloudflare_route_hostname: string;
  cloudflare_access_enabled: boolean;
  health_check_url: string;
  status: string;
  notes: string;
};

const unique = (items: string[]) => Array.from(new Set(items)).filter(Boolean).sort();

const emptyForm: DeploymentForm = {
  project_id: "",
  environment: "local",
  service_name: "",
  service_type: "other",
  docker_compose_project: "",
  docker_service_name: "",
  container_name: "",
  internal_host: "",
  internal_port: "",
  internal_url: "",
  public_domain: "",
  public_url: "",
  cloudflare_tunnel_name: "",
  cloudflare_route_hostname: "",
  cloudflare_access_enabled: false,
  health_check_url: "",
  status: "planned",
  notes: "",
};

function asPayload(form: DeploymentForm): Record<string, unknown> {
  return {
    project_id: form.project_id ? Number(form.project_id) : null,
    environment: form.environment,
    service_name: form.service_name,
    service_type: form.service_type,
    docker_compose_project: form.docker_compose_project || null,
    docker_service_name: form.docker_service_name || null,
    container_name: form.container_name || null,
    internal_host: form.internal_host || null,
    internal_port: form.internal_port ? Number(form.internal_port) : null,
    internal_url: form.internal_url || null,
    public_domain: form.public_domain || null,
    public_url: form.public_url || null,
    cloudflare_tunnel_name: form.cloudflare_tunnel_name || null,
    cloudflare_route_hostname: form.cloudflare_route_hostname || null,
    cloudflare_access_enabled: form.cloudflare_access_enabled,
    health_check_url: form.health_check_url || null,
    status: form.status,
    notes: form.notes || null,
  };
}

function toForm(row: ApiItem): DeploymentForm {
  return {
    project_id: row.project_id ? String(row.project_id) : "",
    environment: String(row.environment ?? "local"),
    service_name: String(row.service_name ?? ""),
    service_type: String(row.service_type ?? "other"),
    docker_compose_project: String(row.docker_compose_project ?? ""),
    docker_service_name: String(row.docker_service_name ?? ""),
    container_name: String(row.container_name ?? ""),
    internal_host: String(row.internal_host ?? ""),
    internal_port: row.internal_port ? String(row.internal_port) : "",
    internal_url: String(row.internal_url ?? ""),
    public_domain: String(row.public_domain ?? ""),
    public_url: String(row.public_url ?? ""),
    cloudflare_tunnel_name: String(row.cloudflare_tunnel_name ?? ""),
    cloudflare_route_hostname: String(row.cloudflare_route_hostname ?? ""),
    cloudflare_access_enabled: Boolean(row.cloudflare_access_enabled),
    health_check_url: String(row.health_check_url ?? ""),
    status: String(row.status ?? "planned"),
    notes: String(row.notes ?? ""),
  };
}

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<DeploymentView[]>(fallbackDeployments());
  const [deploymentRows, setDeploymentRows] = useState<ApiItem[]>([]);
  const [projects, setProjects] = useState<ApiItem[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [environment, setEnvironment] = useState("all");
  const [project, setProject] = useState("all");
  const [composeProject, setComposeProject] = useState("all");
  const [error, setError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");
  const [form, setForm] = useState<DeploymentForm>(emptyForm);

  const refresh = () =>
    Promise.all([api.deployments(), api.projects()])
      .then(([d, p]) => {
        setDeploymentRows(d);
        setProjects(p);
        setDeployments(mapDeploymentRows(d, p));
        setError("");
      })
      .catch(() => setError("Backend unavailable. Showing fallback data."));

  useEffect(() => {
    refresh();
  }, []);

  const projectOptions = useMemo(() => unique(deployments.map((d) => d.project)), [deployments]);
  const composeOptions = useMemo(() => unique(deployments.map((d) => d.dockerComposeProject)), [deployments]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return deployments.filter((d) => {
      const matchesSearch =
        term.length === 0 ||
        [
          d.project,
          d.serviceName,
          d.serviceType,
          d.containerName,
          d.internalUrl,
          d.publicDomain,
          d.publicUrl,
          d.cloudflareRouteHostname,
          d.dockerComposeProject,
          d.dockerServiceName,
          d.notes,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);

      const matchesStatus = status === "all" || d.status === status;
      const matchesEnv = environment === "all" || d.environment === environment;
      const matchesProject = project === "all" || d.project === project;
      const matchesCompose = composeProject === "all" || d.dockerComposeProject === composeProject;

      return matchesSearch && matchesStatus && matchesEnv && matchesProject && matchesCompose;
    });
  }, [deployments, q, status, environment, project, composeProject]);

  const openEdit = useCallback((id: string) => {
    const row = deploymentRows.find((r) => String(r.id) === id);
    if (!row) return;
    setActiveId(id);
    setForm(toForm(row));
    setIsEditOpen(true);
  }, [deploymentRows]);

  const onCreate = async () => {
    if (!form.service_name.trim()) return;
    await api.createDeployment(asPayload(form));
    setIsCreateOpen(false);
    setForm(emptyForm);
    await refresh();
  };

  const onUpdate = async () => {
    if (!activeId || !form.service_name.trim()) return;
    await api.updateDeployment(activeId, asPayload(form));
    setIsEditOpen(false);
    setForm(emptyForm);
    setActiveId("");
    await refresh();
  };

  const onDelete = async () => {
    if (!activeId) return;
    await api.deleteDeployment(activeId);
    setIsDeleteOpen(false);
    setActiveId("");
    await refresh();
  };

  const rows = useMemo(
    () =>
      filtered.map((d) => ({
        id: d.id,
        project: d.project,
        environment: d.environment,
        service: d.serviceName,
        type: d.serviceType,
        compose: `${d.dockerComposeProject}/${d.dockerServiceName}`,
        container: d.containerName,
        internal: d.internalUrl,
        public: d.publicUrl || "-",
        cloudflare: d.cloudflareRouteHostname || "-",
        status: d.status,
        actions: (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <CopyButton iconDescription="Copy internal URL" onClick={() => navigator.clipboard.writeText(d.internalUrl)} />
            <CopyButton iconDescription="Copy public URL" onClick={() => navigator.clipboard.writeText(d.publicUrl || "")} />
            <CopyButton iconDescription="Copy cloudflared snippet" onClick={() => navigator.clipboard.writeText(`- hostname: ${d.cloudflareRouteHostname}\n  service: ${d.internalUrl}`)} />
            <CopyButton iconDescription="Copy route mapping" onClick={() => navigator.clipboard.writeText(`${d.publicDomain} -> ${d.internalUrl}`)} />
            <Button size="sm" kind="ghost" onClick={() => openEdit(d.id)}>Edit</Button>
            <Button size="sm" kind="danger--ghost" onClick={() => { setActiveId(d.id); setIsDeleteOpen(true); }}>Delete</Button>
          </div>
        ),
      })),
    [filtered, openEdit]
  );

  const formFields = (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      <Select id="project_id" labelText="Project" value={form.project_id} onChange={(e) => setForm((prev) => ({ ...prev, project_id: e.target.value }))}>
        <SelectItem value="" text="Unmapped" />
        {projects.map((p) => <SelectItem key={String(p.id)} value={String(p.id)} text={String(p.name)} />)}
      </Select>
      <TextInput id="service_name" labelText="Service Name" value={form.service_name} onChange={(e) => setForm((prev) => ({ ...prev, service_name: e.target.value }))} />
      <Grid condensed fullWidth>
        <Column sm={4} md={4} lg={8}>
          <Select id="environment" labelText="Environment" value={form.environment} onChange={(e) => setForm((prev) => ({ ...prev, environment: e.target.value }))}>
            <SelectItem value="local" text="local" />
            <SelectItem value="staging" text="staging" />
            <SelectItem value="production" text="production" />
          </Select>
        </Column>
        <Column sm={4} md={4} lg={8}>
          <Select id="status" labelText="Status" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
            <SelectItem value="planned" text="planned" />
            <SelectItem value="active" text="active" />
            <SelectItem value="broken" text="broken" />
            <SelectItem value="retired" text="retired" />
          </Select>
        </Column>
      </Grid>
      <TextInput id="service_type" labelText="Service Type" value={form.service_type} onChange={(e) => setForm((prev) => ({ ...prev, service_type: e.target.value }))} />
      <TextInput id="internal_url" labelText="Internal URL" value={form.internal_url} onChange={(e) => setForm((prev) => ({ ...prev, internal_url: e.target.value }))} />
      <TextInput id="public_url" labelText="Public URL" value={form.public_url} onChange={(e) => setForm((prev) => ({ ...prev, public_url: e.target.value }))} />
      <TextInput id="container_name" labelText="Container Name" value={form.container_name} onChange={(e) => setForm((prev) => ({ ...prev, container_name: e.target.value }))} />
      <TextInput id="docker_compose_project" labelText="Compose Project" value={form.docker_compose_project} onChange={(e) => setForm((prev) => ({ ...prev, docker_compose_project: e.target.value }))} />
      <TextInput id="docker_service_name" labelText="Compose Service" value={form.docker_service_name} onChange={(e) => setForm((prev) => ({ ...prev, docker_service_name: e.target.value }))} />
      <TextInput id="cloudflare_route_hostname" labelText="Cloudflare Route Hostname" value={form.cloudflare_route_hostname} onChange={(e) => setForm((prev) => ({ ...prev, cloudflare_route_hostname: e.target.value }))} />
      <Checkbox id="cloudflare_access_enabled" labelText="Cloudflare Access enabled" checked={form.cloudflare_access_enabled} onChange={(_, data) => setForm((prev) => ({ ...prev, cloudflare_access_enabled: Boolean(data.checked) }))} />
      <TextArea id="notes" labelText="Notes" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} rows={3} />
    </div>
  );

  return (
    <>
      <PageHeader title="Deployments" description="Track Docker service routing, internal URLs, domains, and Cloudflare tunnel mappings." actionLabel="Add Deployment" />
      <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={() => { setForm(emptyForm); setIsCreateOpen(true); }}>Add Deployment</Button>
      </div>
      <InlineNotification
        kind="warning"
        lowContrast
        hideCloseButton
        title="Security warning"
        subtitle="Do not expose admin/internal services publicly without Cloudflare Access or Tailscale."
        style={{ marginBottom: "1rem" }}
      />
      {error ? (
        <InlineNotification kind="error" lowContrast hideCloseButton title="Live API unavailable" subtitle={error} style={{ marginBottom: "1rem" }} />
      ) : null}

      <Tile style={{ marginBottom: "1rem" }}>
        <Grid fullWidth>
          <Column sm={4} md={4} lg={6}>
            <Search id="deployment-search" labelText="Search" placeholder="Search service, domain, container, compose..." value={q} onChange={(e) => setQ(e.target.value)} />
          </Column>
          <Column sm={4} md={2} lg={3}>
            <Select id="deployment-status" labelText="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <SelectItem value="all" text="All statuses" />
              <SelectItem value="planned" text="planned" />
              <SelectItem value="active" text="active" />
              <SelectItem value="broken" text="broken" />
              <SelectItem value="retired" text="retired" />
            </Select>
          </Column>
          <Column sm={4} md={2} lg={3}>
            <Select id="deployment-env" labelText="Environment" value={environment} onChange={(e) => setEnvironment(e.target.value)}>
              <SelectItem value="all" text="All environments" />
              <SelectItem value="local" text="local" />
              <SelectItem value="staging" text="staging" />
              <SelectItem value="production" text="production" />
            </Select>
          </Column>
          <Column sm={4} md={2} lg={3}>
            <Select id="deployment-project" labelText="Project" value={project} onChange={(e) => setProject(e.target.value)}>
              <SelectItem value="all" text="All projects" />
              {projectOptions.map((p) => <SelectItem key={p} value={p} text={p} />)}
            </Select>
          </Column>
          <Column sm={4} md={2} lg={3}>
            <Select id="deployment-compose" labelText="Compose Project" value={composeProject} onChange={(e) => setComposeProject(e.target.value)}>
              <SelectItem value="all" text="All compose projects" />
              {composeOptions.map((cp) => <SelectItem key={cp} value={cp} text={cp} />)}
            </Select>
          </Column>
        </Grid>
      </Tile>

      <Tile>
        <EntityTable
          title={`Deployments (${rows.length})`}
          headers={[
            { key: "project", header: "Project" },
            { key: "environment", header: "Env" },
            { key: "service", header: "Service" },
            { key: "type", header: "Type" },
            { key: "compose", header: "Compose" },
            { key: "container", header: "Container" },
            { key: "internal", header: "Internal URL" },
            { key: "public", header: "Public URL" },
            { key: "cloudflare", header: "Cloudflare Route" },
            { key: "status", header: "Status" },
            { key: "actions", header: "Actions" },
          ]}
          rows={rows}
        />
      </Tile>

      <Modal open={isCreateOpen} modalHeading="Add Deployment" primaryButtonText="Create" secondaryButtonText="Cancel" onRequestClose={() => setIsCreateOpen(false)} onRequestSubmit={() => { void onCreate(); }}>
        {formFields}
      </Modal>

      <Modal open={isEditOpen} modalHeading="Edit Deployment" primaryButtonText="Save" secondaryButtonText="Cancel" onRequestClose={() => setIsEditOpen(false)} onRequestSubmit={() => { void onUpdate(); }}>
        {formFields}
      </Modal>

      <Modal open={isDeleteOpen} danger modalHeading="Delete Deployment" primaryButtonText="Delete" secondaryButtonText="Cancel" onRequestClose={() => setIsDeleteOpen(false)} onRequestSubmit={() => { void onDelete(); }}>
        This will remove the deployment record from BuildOS.
      </Modal>
    </>
  );
}
