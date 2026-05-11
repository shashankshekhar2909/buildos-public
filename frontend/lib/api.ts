const configuredBase = process.env.NEXT_PUBLIC_API_BASE_URL;
const configuredPort = process.env.NEXT_PUBLIC_API_PORT || "8012";
const dynamicBase =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:${configuredPort}`
    : `http://localhost:${configuredPort}`;
const configuredIsLocal =
  !!configuredBase &&
  (configuredBase.includes("localhost") || configuredBase.includes("127.0.0.1"));
const API_BASE =
  configuredBase && configuredBase.trim().length > 0 && !configuredIsLocal
    ? configuredBase
    : dynamicBase;
function readAccessToken(): string | null {
  if (typeof document === "undefined") return null;
  const part = document.cookie
    .split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith("buildos_access_token="));
  return part ? decodeURIComponent(part.slice("buildos_access_token=".length)) : null;
}

function authHeaders(base?: HeadersInit): HeadersInit {
  const token = readAccessToken();
  const headers: Record<string, string> = {};
  if (base && typeof base === "object" && !Array.isArray(base)) Object.assign(headers, base as Record<string, string>);
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export type ApiItem = { [key: string]: string | number | boolean | null | undefined };

interface ListResp<T> {
  success: boolean;
  data: T[];
  meta: { total: number; page: number; page_size: number };
  message: string;
}

interface OneResp<T> {
  success: boolean;
  data: T;
  message: string;
}

async function fetchList<T>(path: string): Promise<T[]> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store", headers: authHeaders() });
  if (!res.ok) throw new Error(`API ${path} failed`);
  const json = (await res.json()) as ListResp<T>;
  return json.data;
}

function withQuery(path: string, query: Record<string, string | number | boolean | undefined | null>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && `${v}`.length > 0) params.set(k, String(v));
  });
  const q = params.toString();
  return q ? `${path}?${q}` : path;
}

async function fetchOne<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store", headers: authHeaders() });
  if (!res.ok) throw new Error(`API ${path} failed`);
  const json = (await res.json()) as OneResp<T>;
  return json.data;
}

export const api = {
  baseUrl: API_BASE,
  projects: () => fetchList<ApiItem>(withQuery("/api/projects", { page: 1, page_size: 500 })),
  createProject: async (payload: Record<string, unknown>) => {
    const res = await fetch(`${API_BASE}/api/projects`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create project");
    const json = (await res.json()) as OneResp<ApiItem>;
    return json.data;
  },
  projectFiles: async (projectId: string | number, path = ".") => {
    const p = encodeURIComponent(path);
    const res = await fetch(`${API_BASE}/api/projects/${projectId}/files?path=${p}`, { cache: "no-store", headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to load project files");
    const json = (await res.json()) as OneResp<Record<string, unknown>>;
    return json.data;
  },
  discoverProjects: async () => {
    const res = await fetch(`${API_BASE}/api/project-finder/discover`, { cache: "no-store", headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to discover projects");
    const json = (await res.json()) as OneResp<Record<string, unknown>>;
    return json.data;
  },
  importProjects: async (names: string[]) => {
    const res = await fetch(`${API_BASE}/api/project-finder/import`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ names }),
    });
    if (!res.ok) throw new Error("Failed to import projects");
    const json = (await res.json()) as OneResp<Record<string, unknown>>;
    return json.data;
  },
  addProjectFinderRoot: async (path: string) => {
    const res = await fetch(`${API_BASE}/api/project-finder/roots`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ path }),
    });
    if (!res.ok) {
      try {
        const err = (await res.json()) as { detail?: string };
        throw new Error(err.detail || "Failed to add discovery root");
      } catch {
        throw new Error("Failed to add discovery root");
      }
    }
    const json = (await res.json()) as OneResp<Record<string, unknown>>;
    return json.data;
  },
  prompts: () => fetchList<ApiItem>("/api/prompts"),
  createPrompt: async (payload: Record<string, unknown>) => {
    const res = await fetch(`${API_BASE}/api/prompts`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create prompt");
    const json = (await res.json()) as OneResp<ApiItem>;
    return json.data;
  },
  updatePrompt: async (id: string | number, payload: Record<string, unknown>) => {
    const res = await fetch(`${API_BASE}/api/prompts/${id}`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update prompt");
    const json = (await res.json()) as OneResp<ApiItem>;
    return json.data;
  },
  deletePrompt: async (id: string | number) => {
    const res = await fetch(`${API_BASE}/api/prompts/${id}`, { method: "DELETE", headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to delete prompt");
    return res.json();
  },
  promptsByProject: (projectId: number) => fetchList<ApiItem>(withQuery("/api/prompts", { project_id: projectId })),
  content: () => fetchList<ApiItem>("/api/content"),
  createContent: async (payload: Record<string, unknown>) => {
    const res = await fetch(`${API_BASE}/api/content`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create content item");
    const json = (await res.json()) as OneResp<ApiItem>;
    return json.data;
  },
  updateContent: async (id: string | number, payload: Record<string, unknown>) => {
    const res = await fetch(`${API_BASE}/api/content/${id}`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update content item");
    const json = (await res.json()) as OneResp<ApiItem>;
    return json.data;
  },
  deleteContent: async (id: string | number) => {
    const res = await fetch(`${API_BASE}/api/content/${id}`, { method: "DELETE", headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to delete content item");
    return res.json();
  },
  contentByProject: (projectId: number) => fetchList<ApiItem>(withQuery("/api/content", { project_id: projectId })),
  aiSessions: () => fetchList<ApiItem>("/api/ai-sessions"),
  aiSessionsByProject: (projectId: number) => fetchList<ApiItem>(withQuery("/api/ai-sessions", { project_id: projectId })),
  createAiSession: async (payload: Record<string, unknown>) => {
    const res = await fetch(`${API_BASE}/api/ai-sessions`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create AI session");
    const json = (await res.json()) as OneResp<ApiItem>;
    return json.data;
  },
  updateAiSession: async (id: string | number, payload: Record<string, unknown>) => {
    const res = await fetch(`${API_BASE}/api/ai-sessions/${id}`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update AI session");
    const json = (await res.json()) as OneResp<ApiItem>;
    return json.data;
  },
  deleteAiSession: async (id: string | number) => {
    const res = await fetch(`${API_BASE}/api/ai-sessions/${id}`, { method: "DELETE", headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to delete AI session");
    return res.json();
  },
  tasks: () => fetchList<ApiItem>("/api/tasks"),
  createTask: async (payload: Record<string, unknown>) => {
    const res = await fetch(`${API_BASE}/api/tasks`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create task");
    const json = (await res.json()) as OneResp<ApiItem>;
    return json.data;
  },
  updateTask: async (id: string | number, payload: Record<string, unknown>) => {
    const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update task");
    const json = (await res.json()) as OneResp<ApiItem>;
    return json.data;
  },
  deleteTask: async (id: string | number) => {
    const res = await fetch(`${API_BASE}/api/tasks/${id}`, { method: "DELETE", headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to delete task");
    return res.json();
  },
  tasksByProject: (projectId: number) => fetchList<ApiItem>(withQuery("/api/tasks", { project_id: projectId })),
  knowledge: () => fetchList<ApiItem>("/api/knowledge"),
  createKnowledge: async (payload: Record<string, unknown>) => {
    const res = await fetch(`${API_BASE}/api/knowledge`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create knowledge note");
    const json = (await res.json()) as OneResp<ApiItem>;
    return json.data;
  },
  updateKnowledge: async (id: string | number, payload: Record<string, unknown>) => {
    const res = await fetch(`${API_BASE}/api/knowledge/${id}`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update knowledge note");
    const json = (await res.json()) as OneResp<ApiItem>;
    return json.data;
  },
  deleteKnowledge: async (id: string | number) => {
    const res = await fetch(`${API_BASE}/api/knowledge/${id}`, { method: "DELETE", headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to delete knowledge note");
    return res.json();
  },
  knowledgeByProject: (projectId: number) => fetchList<ApiItem>(withQuery("/api/knowledge", { project_id: projectId })),
  deployments: () => fetchList<ApiItem>("/api/deployments"),
  deploymentsByProject: (projectId: number) => fetchList<ApiItem>(withQuery("/api/deployments", { project_id: projectId })),
  users: () => fetchList<ApiItem>("/api/users"),
  createUser: async (payload: Record<string, unknown>) => {
    const res = await fetch(`${API_BASE}/api/users`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create user");
    const json = (await res.json()) as OneResp<ApiItem>;
    return json.data;
  },
  updateUser: async (id: string | number, payload: Record<string, unknown>) => {
    const res = await fetch(`${API_BASE}/api/users/${id}`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update user");
    const json = (await res.json()) as OneResp<ApiItem>;
    return json.data;
  },
  deleteUser: async (id: string | number) => {
    const res = await fetch(`${API_BASE}/api/users/${id}`, { method: "DELETE", headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to delete user");
    return res.json();
  },
  createDeployment: async (payload: Record<string, unknown>) => {
    const res = await fetch(`${API_BASE}/api/deployments`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create deployment");
    const json = (await res.json()) as OneResp<ApiItem>;
    return json.data;
  },
  updateDeployment: async (id: string | number, payload: Record<string, unknown>) => {
    const res = await fetch(`${API_BASE}/api/deployments/${id}`, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update deployment");
    const json = (await res.json()) as OneResp<ApiItem>;
    return json.data;
  },
  deleteDeployment: async (id: string | number) => {
    const res = await fetch(`${API_BASE}/api/deployments/${id}`, { method: "DELETE", headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to delete deployment");
    return res.json();
  },
  settings: () => fetchList<ApiItem>("/api/settings"),
  systemSnapshot: () => fetchOne<Record<string, unknown>>("/api/system/snapshot"),
  cloudflareRoutes: () => fetchOne<Record<string, unknown>>("/api/cloudflare/routes"),
  containers: () => fetchOne<Record<string, unknown>>("/api/containers"),
  containersSummary: () => fetchOne<Record<string, unknown>>("/api/containers/summary"),
  attachContainerProject: async (containerId: string, project_id: number, notes?: string) => {
    const res = await fetch(`${API_BASE}/api/containers/${encodeURIComponent(containerId)}/attach-project`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ project_id, notes }),
    });
    if (!res.ok) throw new Error("Failed to attach container");
    const json = (await res.json()) as OneResp<ApiItem>;
    return json.data;
  },
  detachContainerProject: async (containerId: string) => {
    const res = await fetch(`${API_BASE}/api/containers/${encodeURIComponent(containerId)}/detach-project`, {
      method: "POST",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to detach container");
    const json = (await res.json()) as OneResp<Record<string, unknown>>;
    return json.data;
  },
  generateProjectContext: async (payload: Record<string, unknown>) => {
    const res = await fetch(`${API_BASE}/api/ai/generate-project-context`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      try {
        const err = (await res.json()) as { detail?: string };
        throw new Error(err.detail || "Failed to generate project context");
      } catch {
        throw new Error("Failed to generate project context");
      }
    }
    const json = (await res.json()) as OneResp<Record<string, unknown>>;
    return json.data;
  },
};
