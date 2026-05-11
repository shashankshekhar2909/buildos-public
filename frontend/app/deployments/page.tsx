"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  Column,
  Grid,
  InlineNotification,
  Modal,
  OverflowMenu,
  OverflowMenuItem,
  Search,
  Select,
  SelectItem,
  TextArea,
  TextInput,
} from "@carbon/react";
import { Add } from "@carbon/icons-react";
import { PageHeader } from "@/components/shared/page-header";
import { EntityTable } from "@/components/shared/entity-table";
import { StatusTag } from "@/components/shared/tags";
import { api, type ApiItem } from "@/lib/api";
import { copyText } from "@/lib/clipboard";
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [envFilter, setEnvFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [cloudflareInfo, setCloudflareInfo] = useState<{ source: string; available: boolean; count: number; message: string }>({
    source: "",
    available: false,
    count: 0,
    message: "",
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");
  const [form, setForm] = useState<DeploymentForm>(emptyForm);

  const refresh = () => {
    setLoading(true);
    const selectedProject = deployments.find((d) => d.project === projectFilter);
    return Promise.all([
      api.deployments({
        search: q || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        environment: envFilter === "all" ? undefined : envFilter,
        project_id: projectFilter === "all" ? undefined : selectedProject?.projectId,
      }),
      api.projects(),
      api.cloudflareRoutes().catch(() => null),
    ])
      .then(([d, p, c]) => {
        setDeploymentRows(d);
        setProjects(p);
        setDeployments(mapDeploymentRows(d, p));
        if (c) {
          const routes = Array.isArray(c.routes) ? c.routes : [];
          setCloudflareInfo({
            source: String(c.source ?? ""),
            available: Boolean(c.available),
            count: routes.length,
            message: String(c.message ?? ""),
          });
        }
        setError("");
      })
      .catch(() => setError("Backend unavailable. Showing fallback data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void refresh();
  }, [q, statusFilter, envFilter, projectFilter]);

  const projectOptions = useMemo(() => unique(deployments.map((d) => d.project)), [deployments]);

  const openEdit = useCallback(
    (id: string) => {
      const row = deploymentRows.find((r) => String(r.id) === id);
      if (!row) return;
      setActiveId(id);
      setForm(toForm(row));
      setIsEditOpen(true);
    },
    [deploymentRows]
  );

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
      deployments.map((d) => {
        const internalVal = d.internalUrl || "-";
        const exposedVal = d.publicUrl || d.publicDomain || d.cloudflareRouteHostname || d.internalUrl || "-";
        const proj = projects.find((p) => Number(p.id) === d.projectId);
        const gitVal =
          String(
            proj?.github_url ??
              proj?.git_url ??
              proj?.repo_url ??
              proj?.html_url ??
              proj?.clone_url ??
              "-"
          ) || "-";
        const publicVal = d.publicUrl || "-";
        return ({
        id: d.id,
        project: d.project,
        service: d.serviceName,
        environment: d.environment,
        internal: internalVal !== "-" ? (
          <span className="cell--truncate-sm" title={internalVal}>{internalVal}</span>
        ) : "-",
        exposedAt: exposedVal !== "-" ? (
          <span className="cell--truncate-sm" title={exposedVal}>{exposedVal}</span>
        ) : "-",
        projectGit: gitVal !== "-" ? (
          <span className="cell--truncate-sm" title={gitVal}>{gitVal}</span>
        ) : "-",
        public: publicVal !== "-" ? (
          <span className="cell--truncate-sm" title={publicVal}>{publicVal}</span>
        ) : "-",
        status: <StatusTag value={d.status} />,
        actions: (
          <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
            <OverflowMenu size="sm" flipped iconDescription="Copy URLs">
              <OverflowMenuItem
                itemText="Copy internal URL"
                onClick={() => {
                  void copyText(d.internalUrl || "");
                }}
              />
              <OverflowMenuItem
                itemText="Copy public URL"
                onClick={() => {
                  void copyText(d.publicUrl || "");
                }}
              />
              {d.cloudflareRouteHostname && (
                <OverflowMenuItem
                  itemText="Copy cloudflared snippet"
                  onClick={() =>
                    copyText(
                      `- hostname: ${d.cloudflareRouteHostname}\n  service: ${d.internalUrl}`
                    )
                  }
                />
              )}
              {d.publicDomain && d.internalUrl && (
                <OverflowMenuItem
                  itemText="Copy route mapping"
                  onClick={() =>
                    copyText(`${d.publicDomain} -> ${d.internalUrl}`)
                  }
                />
              )}
              <OverflowMenuItem
                itemText="Copy docker logs command"
                onClick={() =>
                  copyText(
                    d.containerName
                      ? `docker logs --tail 200 -f ${d.containerName}`
                      : "docker logs --tail 200 -f <container_name>"
                  )
                }
              />
            </OverflowMenu>
            <Button size="sm" kind="ghost" onClick={() => openEdit(d.id)}>
              Edit
            </Button>
            <Button
              size="sm"
              kind="danger--ghost"
              onClick={() => {
                setActiveId(d.id);
                setIsDeleteOpen(true);
              }}
            >
              Delete
            </Button>
          </div>
        ),
      });
      }),
    [deployments, openEdit, projects]
  );

  const formFields = (
    <div style={{ display: "grid", gap: "var(--space-sm)" }}>
      <Select
        id="project_id"
        labelText="Project"
        value={form.project_id}
        onChange={(e) => setForm((prev) => ({ ...prev, project_id: e.target.value }))}
      >
        <SelectItem value="" text="Unmapped" />
        {projects.map((p) => (
          <SelectItem key={String(p.id)} value={String(p.id)} text={String(p.name)} />
        ))}
      </Select>
      <TextInput
        id="service_name"
        labelText="Service Name"
        value={form.service_name}
        onChange={(e) => setForm((prev) => ({ ...prev, service_name: e.target.value }))}
      />
      <Grid condensed fullWidth>
        <Column sm={4} md={4} lg={8}>
          <Select
            id="environment"
            labelText="Environment"
            value={form.environment}
            onChange={(e) => setForm((prev) => ({ ...prev, environment: e.target.value }))}
          >
            <SelectItem value="local" text="local" />
            <SelectItem value="staging" text="staging" />
            <SelectItem value="production" text="production" />
          </Select>
        </Column>
        <Column sm={4} md={4} lg={8}>
          <Select
            id="status"
            labelText="Status"
            value={form.status}
            onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
          >
            <SelectItem value="planned" text="planned" />
            <SelectItem value="active" text="active" />
            <SelectItem value="broken" text="broken" />
            <SelectItem value="retired" text="retired" />
          </Select>
        </Column>
      </Grid>
      <TextInput
        id="internal_url"
        labelText="Internal URL"
        value={form.internal_url}
        onChange={(e) => setForm((prev) => ({ ...prev, internal_url: e.target.value }))}
      />
      <TextInput
        id="public_url"
        labelText="Public URL"
        value={form.public_url}
        onChange={(e) => setForm((prev) => ({ ...prev, public_url: e.target.value }))}
      />
      <TextInput
        id="container_name"
        labelText="Container Name"
        value={form.container_name}
        onChange={(e) => setForm((prev) => ({ ...prev, container_name: e.target.value }))}
      />
      <TextInput
        id="docker_compose_project"
        labelText="Compose Project"
        value={form.docker_compose_project}
        onChange={(e) => setForm((prev) => ({ ...prev, docker_compose_project: e.target.value }))}
      />
      <TextInput
        id="docker_service_name"
        labelText="Compose Service"
        value={form.docker_service_name}
        onChange={(e) => setForm((prev) => ({ ...prev, docker_service_name: e.target.value }))}
      />
      <TextInput
        id="cloudflare_route_hostname"
        labelText="Cloudflare Route Hostname"
        value={form.cloudflare_route_hostname}
        onChange={(e) => setForm((prev) => ({ ...prev, cloudflare_route_hostname: e.target.value }))}
      />
      <Checkbox
        id="cloudflare_access_enabled"
        labelText="Cloudflare Access enabled"
        checked={form.cloudflare_access_enabled}
        onChange={(_, data) =>
          setForm((prev) => ({ ...prev, cloudflare_access_enabled: Boolean(data.checked) }))
        }
      />
      <TextArea
        id="notes"
        labelText="Notes"
        value={form.notes}
        onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
        rows={3}
      />
    </div>
  );

  return (
    <>
      <PageHeader
        title="Deployments"
        description="Track Docker service routing, internal URLs, domains, and Cloudflare tunnel mappings."
        actionLabel="Add Deployment"
        onAction={() => {
          setForm(emptyForm);
          setIsCreateOpen(true);
        }}
      />

      <InlineNotification
        kind="warning"
        lowContrast
        hideCloseButton
        title="Security"
        subtitle="Do not expose admin/internal services publicly without Cloudflare Access or Tailscale."
        className="notification--stacked"
      />
      {cloudflareInfo.message ? (
        <InlineNotification
          kind={cloudflareInfo.available ? "success" : "info"}
          lowContrast
          hideCloseButton
          title="Cloudflare Routes"
          subtitle={`${cloudflareInfo.message} (${cloudflareInfo.count} discovered from ${cloudflareInfo.source || "configured path"})`}
          className="notification--stacked"
        />
      ) : null}

      {error ? (
        <InlineNotification
          kind="error"
          lowContrast
          hideCloseButton
          title="Live API unavailable"
          subtitle={error}
          className="notification--stacked"
        />
      ) : null}

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="filter-bar__search">
          <Search
            id="deployment-search"
            labelText="Search"
            placeholder="Search service, domain, URL..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="filter-bar__select">
          <Select
            id="deployment-status"
            labelText="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <SelectItem value="all" text="All statuses" />
            <SelectItem value="planned" text="planned" />
            <SelectItem value="active" text="active" />
            <SelectItem value="broken" text="broken" />
            <SelectItem value="retired" text="retired" />
          </Select>
        </div>
        <div className="filter-bar__select">
          <Select
            id="deployment-env"
            labelText="Environment"
            value={envFilter}
            onChange={(e) => setEnvFilter(e.target.value)}
          >
            <SelectItem value="all" text="All environments" />
            <SelectItem value="local" text="local" />
            <SelectItem value="staging" text="staging" />
            <SelectItem value="production" text="production" />
          </Select>
        </div>
        <div className="filter-bar__select">
          <Select
            id="deployment-project"
            labelText="Project"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <SelectItem value="all" text="All projects" />
            {projectOptions.map((p) => (
              <SelectItem key={p} value={p} text={p} />
            ))}
          </Select>
        </div>
        <Button
          kind="primary"
          size="sm"
          renderIcon={Add}
          onClick={() => {
            setForm(emptyForm);
            setIsCreateOpen(true);
          }}
        >
          Add Deployment
        </Button>
      </div>

      <EntityTable
        title={`Deployments (${rows.length})`}
        loading={loading}
        headers={[
          { key: "project", header: "Project" },
          { key: "service", header: "Service" },
          { key: "environment", header: "Environment" },
          { key: "internal", header: "Internal URL" },
          { key: "exposedAt", header: "Exposed At" },
          { key: "projectGit", header: "Git Origin" },
          { key: "public", header: "Public URL" },
          { key: "status", header: "Status" },
          { key: "actions", header: "Actions" },
        ]}
        rows={rows}
      />

      <Modal
        open={isCreateOpen}
        modalHeading="Add Deployment"
        primaryButtonText="Create"
        secondaryButtonText="Cancel"
        onRequestClose={() => setIsCreateOpen(false)}
        onRequestSubmit={() => {
          void onCreate();
        }}
      >
        {formFields}
      </Modal>

      <Modal
        open={isEditOpen}
        modalHeading="Edit Deployment"
        primaryButtonText="Save"
        secondaryButtonText="Cancel"
        onRequestClose={() => setIsEditOpen(false)}
        onRequestSubmit={() => {
          void onUpdate();
        }}
      >
        {formFields}
      </Modal>

      <Modal
        open={isDeleteOpen}
        danger
        modalHeading="Delete Deployment"
        primaryButtonText="Delete"
        secondaryButtonText="Cancel"
        onRequestClose={() => setIsDeleteOpen(false)}
        onRequestSubmit={() => {
          void onDelete();
        }}
      >
        This will remove the deployment record from BuildOS.
      </Modal>
    </>
  );
}
