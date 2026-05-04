import { AISession, ContentItem, KnowledgeNote, Project, Prompt, Task } from "@/lib/types";

export const projects: Project[] = [
  {
    name: "BuildOS",
    slug: "buildos",
    category: "product",
    status: "active",
    priority: "critical",
    goal: "Build a private AI-native operating dashboard for projects, prompts, content, AI sessions, tasks, and reusable project context.",
    techStack: ["Next.js", "Carbon", "FastAPI", "SQLite", "Docker"],
    updatedDate: "2026-05-04",
  },
  {
    name: "AI Stack Lab",
    slug: "ai-stack-lab",
    category: "portfolio",
    status: "active",
    priority: "high",
    goal: "Curated AI tools and workflow platform for builders.",
    publicUrl: "https://ai.buildwithshashank.com",
    techStack: ["Next.js", "SQLite", "Docker"],
    updatedDate: "2026-05-02",
  },
  {
    name: "KnowMy Homelab",
    slug: "knowmy-homelab",
    category: "homelab",
    status: "active",
    priority: "high",
    goal: "Public-safe homelab learning and architecture platform.",
    publicUrl: "https://homelab.buildwithshashank.com",
    techStack: ["Proxmox", "Docker", "LiteLLM", "Cloudflare", "Next.js"],
    updatedDate: "2026-05-01",
  },
  {
    name: "GhostPilot",
    slug: "ghostpilot",
    category: "product",
    status: "active",
    priority: "medium",
    goal: "AI-assisted editorial dashboard for Ghost publishers.",
    techStack: ["FastAPI", "Ghost CMS", "Docker"],
    updatedDate: "2026-04-30",
  },
  {
    name: "Cascade UI",
    slug: "cascade-ui",
    category: "product",
    status: "paused",
    priority: "medium",
    goal: "Carbon/Tailwind-inspired reusable design system and component library.",
    techStack: ["React", "Storybook", "npm"],
    updatedDate: "2026-04-27",
  },
];

export const prompts: Prompt[] = [
  {
    title: "Codex Phase Builder",
    category: "coding",
    recommendedTool: "codex",
    recommendedModel: "gpt-5.5",
    tags: ["phase", "implementation", "build"],
    rating: 5,
    project: "BuildOS",
  },
  {
    title: "Claude Architecture Review",
    category: "architecture",
    recommendedTool: "claude",
    recommendedModel: "claude-opus",
    tags: ["review", "risk", "decisions"],
    rating: 4,
    project: "BuildOS",
  },
  {
    title: "Carbon UI Page Builder",
    category: "coding",
    recommendedTool: "codex",
    recommendedModel: "gpt-5.5",
    tags: ["carbon", "nextjs", "layout"],
    rating: 5,
    project: "Cascade UI",
  },
];

export const contentItems: ContentItem[] = [
  { title: "Why I am building BuildOS", platform: "LinkedIn", contentType: "post", status: "draft", hook: "Execution beats scattered chats.", project: "BuildOS", scheduledDate: "2026-05-08" },
  { title: "How I use Codex, Claude, Aider, and Groq together", platform: "YouTube", contentType: "video", status: "idea", hook: "A practical multi-agent stack.", project: "AI Stack Lab" },
  { title: "Why prompts should be saved like reusable assets", platform: "Blog", contentType: "article", status: "review", hook: "Prompts are operating assets.", project: "BuildOS", scheduledDate: "2026-05-10" },
];

export const aiSessions: AISession[] = [
  { title: "BuildOS Phase 1 frontend pass", tool: "Codex", model: "gpt-5.5", sourceModule: "Projects", project: "BuildOS", tags: ["frontend", "carbon"], rating: 5, createdDate: "2026-05-04" },
  { title: "Architecture risk review", tool: "Claude", model: "claude-opus", sourceModule: "Architecture", project: "BuildOS", tags: ["design", "review"], rating: 4, createdDate: "2026-05-03" },
  { title: "Prompt cleanup sprint", tool: "Aider", model: "deepseek-coder", sourceModule: "Prompts", project: "AI Stack Lab", tags: ["prompts"], rating: 4, createdDate: "2026-05-01" },
];

export const tasks: Task[] = [
  { title: "Create BuildOS frontend shell using Carbon", status: "active", priority: "critical", project: "BuildOS" },
  { title: "Create dashboard with operating snapshot", status: "open", priority: "high", project: "BuildOS" },
  { title: "Create projects page with Carbon table/cards", status: "open", priority: "high", project: "BuildOS" },
  { title: "Create FastAPI backend skeleton", status: "open", priority: "medium", project: "BuildOS" },
  { title: "Connect frontend to backend", status: "open", priority: "medium", project: "BuildOS" },
];

export const knowledgeNotes: KnowledgeNote[] = [
  { text: "BuildOS is not a chatbot.", project: "BuildOS", status: "active" },
  { text: "BuildOS is an execution layer.", project: "BuildOS", status: "active" },
  { text: "The first valuable AI feature is project context generation.", project: "BuildOS", status: "planned" },
  { text: "The UI must follow ai-tools-dir and Carbon.", status: "active" },
  { text: "SQLite is enough for the first version.", status: "planned" },
];
