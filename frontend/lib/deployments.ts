import type { ApiItem } from "@/lib/api";
import { deployments as mockDeployments } from "@/lib/mock-data";

export type DeploymentView = {
  id: string;
  project: string;
  environment: string;
  serviceName: string;
  serviceType: string;
  dockerComposeProject: string;
  dockerServiceName: string;
  containerName: string;
  internalHost: string;
  internalPort: number | null;
  internalUrl: string;
  publicDomain: string;
  publicUrl: string;
  cloudflareTunnelName: string;
  cloudflareRouteHostname: string;
  cloudflareAccessEnabled: boolean;
  healthCheckUrl: string;
  status: string;
  notes: string;
};

export function mapDeploymentRows(rows: ApiItem[], projects: ApiItem[]): DeploymentView[] {
  const projectNameById = new Map<number, string>();
  projects.forEach((p) => {
    if (typeof p.id === "number" && typeof p.name === "string") {
      projectNameById.set(p.id, p.name);
    }
  });

  return rows.map((row, index) => {
    const projectId = typeof row.project_id === "number" ? row.project_id : null;
    const projectName = projectId ? projectNameById.get(projectId) : null;
    return {
      id: String(row.id ?? index),
      project: projectName ?? "Unmapped",
      environment: String(row.environment ?? "local"),
      serviceName: String(row.service_name ?? "Unknown Service"),
      serviceType: String(row.service_type ?? "other"),
      dockerComposeProject: String(row.docker_compose_project ?? ""),
      dockerServiceName: String(row.docker_service_name ?? ""),
      containerName: String(row.container_name ?? ""),
      internalHost: String(row.internal_host ?? ""),
      internalPort: typeof row.internal_port === "number" ? row.internal_port : null,
      internalUrl: String(row.internal_url ?? ""),
      publicDomain: String(row.public_domain ?? ""),
      publicUrl: String(row.public_url ?? ""),
      cloudflareTunnelName: String(row.cloudflare_tunnel_name ?? ""),
      cloudflareRouteHostname: String(row.cloudflare_route_hostname ?? ""),
      cloudflareAccessEnabled: Boolean(row.cloudflare_access_enabled),
      healthCheckUrl: String(row.health_check_url ?? ""),
      status: String(row.status ?? "planned"),
      notes: String(row.notes ?? ""),
    };
  });
}

export function fallbackDeployments(): DeploymentView[] {
  return mockDeployments.map((d) => ({ ...d }));
}
