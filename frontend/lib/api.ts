const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8011";

export type ApiItem = { [key: string]: string | number | boolean | null | undefined };

interface ListResp<T> {
  success: boolean;
  data: T[];
  meta: { total: number; page: number; page_size: number };
  message: string;
}

async function fetchList<T>(path: string): Promise<T[]> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${path} failed`);
  const json = (await res.json()) as ListResp<T>;
  return json.data;
}

export const api = {
  projects: () => fetchList<ApiItem>("/api/projects"),
  prompts: () => fetchList<ApiItem>("/api/prompts"),
  content: () => fetchList<ApiItem>("/api/content"),
  aiSessions: () => fetchList<ApiItem>("/api/ai-sessions"),
  tasks: () => fetchList<ApiItem>("/api/tasks"),
  knowledge: () => fetchList<ApiItem>("/api/knowledge"),
  settings: () => fetchList<ApiItem>("/api/settings"),
};
