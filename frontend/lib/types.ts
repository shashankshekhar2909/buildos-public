export type Status = "active" | "paused" | "planned" | "done" | "idea" | "draft" | "review" | "ready" | "published" | "repurpose" | "open";
export type Priority = "critical" | "high" | "medium" | "low";

export interface Project {
  name: string;
  slug: string;
  category: string;
  status: "active" | "paused" | "planned";
  priority: "critical" | "high" | "medium" | "low";
  goal: string;
  techStack: string[];
  updatedDate: string;
  publicUrl?: string;
}

export interface Prompt {
  title: string;
  category: string;
  recommendedTool: string;
  recommendedModel: string;
  tags: string[];
  rating: number;
  project?: string;
}

export interface ContentItem {
  title: string;
  platform: string;
  contentType: string;
  status: "idea" | "draft" | "review" | "ready" | "published" | "repurpose";
  hook: string;
  project: string;
  scheduledDate?: string;
}

export interface AISession {
  title: string;
  tool: string;
  model: string;
  sourceModule: string;
  project: string;
  tags: string[];
  rating: number;
  createdDate: string;
}

export interface Task {
  title: string;
  status: "open" | "active" | "done";
  priority: "critical" | "high" | "medium" | "low";
  project: string;
}

export interface KnowledgeNote {
  text: string;
  project?: string;
  status: "active" | "planned";
}
