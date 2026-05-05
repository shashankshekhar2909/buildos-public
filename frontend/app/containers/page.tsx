"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, InlineNotification, Modal, Search, Select, SelectItem } from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { EntityTable } from "@/components/shared/entity-table";
import { StatusTag } from "@/components/shared/tags";
import { api, type ApiItem } from "@/lib/api";
import { copyText } from "@/lib/clipboard";

type ContainerItem = {
  id: string;
  name: string;
  status: string;
  health?: string | null;
  image: string;
  compose_project?: string | null;
  compose_service?: string | null;
  published_ports?: { host_port?: string; container_port?: string }[];
  networks?: string[];
  mapped_project_id?: number | null;
  mapped_service_name?: string | null;
};

export default function ContainersPage() {
  const [items, setItems] = useState<ContainerItem[]>([]);
  const [projects, setProjects] = useState<ApiItem[]>([]);
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [activeContainer, setActiveContainer] = useState<ContainerItem | null>(null);
  const [attachProjectId, setAttachProjectId] = useState("");

  const refresh = () =>
    Promise.all([api.containers(), api.containersSummary(), api.projects()])
      .then(([containersResp, summaryResp, projectRows]) => {
        setItems((containersResp.items as ContainerItem[]) ?? []);
        setSummary(summaryResp);
        setProjects(projectRows);
        setError("");
      })
      .catch(() => setError("Docker access is not configured. Mount Docker socket read-only or configure Docker Socket Proxy."));

  useEffect(() => {
    refresh();
  }, []);

  const projectNameById = useMemo(() => {
    const m = new Map<number, string>();
    projects.forEach((p) => {
      if (typeof p.id === "number" && typeof p.name === "string") m.set(p.id, p.name);
    });
    return m;
  }, [projects]);

  const filtered = useMemo(() => {
    const t = q.toLowerCase();
    return items.filter((i) => {
      const matchQ =
        !t ||
        [i.name, i.image, i.compose_project, i.compose_service]
          .join(" ")
          .toLowerCase()
          .includes(t);
      const matchStatus = statusFilter === "all" || i.status === statusFilter;
      const matchProject =
        projectFilter === "all" || String(i.mapped_project_id ?? "") === projectFilter;
      return matchQ && matchStatus && matchProject;
    });
  }, [items, q, statusFilter, projectFilter]);

  const rows = filtered.map((c) => ({
    id: c.id,
    name: c.name,
    project: c.mapped_project_id ? projectNameById.get(c.mapped_project_id) ?? `#${c.mapped_project_id}` : "Unmapped",
    status: <StatusTag value={c.status} />,
    health: c.health ?? "-",
    image: c.image,
    compose: c.compose_project || "-",
    service: c.compose_service || "-",
    ports:
      c.published_ports && c.published_ports.length > 0
        ? c.published_ports.map((p) => `${p.host_port}->${p.container_port}`).join(", ")
        : "-",
    networks: c.networks?.join(", ") || "-",
    actions: (
      <div style={{ display: "flex", gap: "0.35rem" }}>
        <Button
          kind="ghost"
          size="sm"
          onClick={() => {
            setActiveContainer(c);
            setAttachProjectId(c.mapped_project_id ? String(c.mapped_project_id) : "");
          }}
        >
          {c.mapped_project_id ? "Remap" : "Attach"}
        </Button>
        <Button
          kind="ghost"
          size="sm"
          onClick={() =>
            void copyText(
              c.name
                ? `docker logs --tail 200 -f ${c.name}`
                : "docker logs --tail 200 -f <container_name>"
            )
          }
        >
          Copy Logs Cmd
        </Button>
        {c.mapped_project_id ? (
          <Button
            kind="danger--ghost"
            size="sm"
            onClick={async () => {
              await api.detachContainerProject(c.id);
              await refresh();
            }}
          >
            Detach
          </Button>
        ) : null}
      </div>
    ),
  }));

  return (
    <>
      <PageHeader title="Containers" description="Live Docker container inventory with BuildOS project mapping." />
      {error ? (
        <InlineNotification kind="warning" lowContrast hideCloseButton title="Docker unavailable" subtitle={error} style={{ marginBottom: "1rem" }} />
      ) : null}
      {summary ? (
        <InlineNotification
          kind="info"
          lowContrast
          hideCloseButton
          title="Container Health Snapshot"
          subtitle={`Total ${summary.total ?? 0} | Running ${summary.running ?? 0} | Stopped ${summary.stopped ?? 0} | Unhealthy ${summary.unhealthy ?? 0} | Unmapped ${summary.unmapped ?? 0}`}
          style={{ marginBottom: "1rem" }}
        />
      ) : null}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: "1 1 16rem" }}>
          <Search id="container-search" labelText="Search" placeholder="Search containers..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div style={{ minWidth: "12rem" }}>
          <Select id="container-status" labelText="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <SelectItem value="all" text="All statuses" />
            <SelectItem value="running" text="running" />
            <SelectItem value="exited" text="exited" />
            <SelectItem value="created" text="created" />
          </Select>
        </div>
        <div style={{ minWidth: "12rem" }}>
          <Select id="container-project" labelText="Project" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
            <SelectItem value="all" text="All projects" />
            {projects.map((p) => (
              <SelectItem key={String(p.id)} value={String(p.id)} text={String(p.name)} />
            ))}
          </Select>
        </div>
      </div>

      <EntityTable
        title={`Containers (${rows.length})`}
        headers={[
          { key: "name", header: "Container" },
          { key: "project", header: "Project Mapping" },
          { key: "status", header: "Status" },
          { key: "health", header: "Health" },
          { key: "image", header: "Image" },
          { key: "compose", header: "Compose Project" },
          { key: "service", header: "Compose Service" },
          { key: "ports", header: "Ports" },
          { key: "networks", header: "Networks" },
          { key: "actions", header: "Actions" },
        ]}
        rows={rows}
      />

      <Modal
        open={!!activeContainer}
        modalHeading={`Attach ${activeContainer?.name ?? "container"} to project`}
        primaryButtonText="Attach"
        secondaryButtonText="Cancel"
        onRequestClose={() => setActiveContainer(null)}
        onRequestSubmit={async () => {
          if (!activeContainer || !attachProjectId) return;
          await api.attachContainerProject(activeContainer.id, Number(attachProjectId));
          setActiveContainer(null);
          await refresh();
        }}
      >
        <Select id="attach-project-id" labelText="Project" value={attachProjectId} onChange={(e) => setAttachProjectId(e.target.value)}>
          <SelectItem value="" text="Select project" />
          {projects.map((p) => (
            <SelectItem key={String(p.id)} value={String(p.id)} text={String(p.name)} />
          ))}
        </Select>
      </Modal>
    </>
  );
}
