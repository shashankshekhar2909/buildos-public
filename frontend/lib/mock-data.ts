import { AISession, ContentItem, Deployment, KnowledgeNote, Project, Prompt, Task, User } from "@/lib/types";

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
    publicUrl: "https://ai.example.com",
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
    publicUrl: "https://homelab.example.com",
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
  { title: "Codex Phase Builder", category: "coding", recommendedTool: "codex", recommendedModel: "gpt-5.5", tags: ["phase", "implementation", "build"], rating: 5, project: "BuildOS" },
  { title: "Claude Architecture Review", category: "architecture", recommendedTool: "claude", recommendedModel: "claude-opus", tags: ["review", "risk", "decisions"], rating: 4, project: "BuildOS" },
  { title: "Carbon UI Page Builder", category: "coding", recommendedTool: "codex", recommendedModel: "gpt-5.5", tags: ["carbon", "nextjs", "layout"], rating: 5, project: "Cascade UI" },
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

export const users: User[] = [
  { id: "usr-1", name: "BuildOS Admin", email: "admin@example.com", role: "admin", status: "active", createdAt: "2026-04-01" },
  { id: "usr-2", name: "Priya Mehta", email: "priya@example.com", role: "admin", status: "active", createdAt: "2026-04-05" },
  { id: "usr-3", name: "Alex Rivera", email: "alex@example.com", role: "viewer", status: "active", createdAt: "2026-04-10" },
  { id: "usr-4", name: "Jordan Kim", email: "jordan@example.com", role: "viewer", status: "invited", createdAt: "2026-04-15" },
  { id: "usr-5", name: "Sam Okafor", email: "sam@example.com", role: "viewer", status: "active", createdAt: "2026-04-20" },
  { id: "usr-6", name: "Taylor Nguyen", email: "taylor@example.com", role: "viewer", status: "invited", createdAt: "2026-04-28" },
  { id: "usr-7", name: "Dana Patel", email: "dana@example.com", role: "admin", status: "active", createdAt: "2026-05-01" },
];

export const deployments: Deployment[] = [
  {
    id: "dep-1",
    project: "BuildOS",
    environment: "production",
    serviceName: "BuildOS Frontend",
    serviceType: "frontend",
    dockerComposeProject: "buildos",
    dockerServiceName: "frontend",
    containerName: "buildos-frontend-phase3",
    internalHost: "frontend",
    internalPort: 3000,
    internalUrl: "http://frontend:3000",
    publicDomain: "buildos.example.com",
    publicUrl: "https://buildos.example.com",
    cloudflareTunnelName: "homelab-main",
    cloudflareRouteHostname: "buildos.example.com",
    cloudflareAccessEnabled: true,
    healthCheckUrl: "https://buildos.example.com",
    status: "active",
    notes: "Primary UI route via Cloudflare Tunnel.",
  },
  {
    id: "dep-2",
    project: "BuildOS",
    environment: "production",
    serviceName: "BuildOS Backend",
    serviceType: "backend",
    dockerComposeProject: "buildos",
    dockerServiceName: "backend",
    containerName: "buildos-backend-phase2",
    internalHost: "backend",
    internalPort: 8000,
    internalUrl: "http://backend:8000",
    publicDomain: "buildos-api.example.com",
    publicUrl: "https://buildos-api.example.com",
    cloudflareTunnelName: "homelab-main",
    cloudflareRouteHostname: "buildos-api.example.com",
    cloudflareAccessEnabled: true,
    healthCheckUrl: "https://buildos-api.example.com/health",
    status: "active",
    notes: "API route behind tunnel + Access.",
  },
  {
    id: "dep-3",
    project: "KnowMy Homelab",
    environment: "local",
    serviceName: "Obsidian Vault SMB",
    serviceType: "other",
    dockerComposeProject: "homelab",
    dockerServiceName: "smb",
    containerName: "samba-obsidian",
    internalHost: "smb",
    internalPort: null,
    internalUrl: "smb://homelab.local/obsidian-vault",
    publicDomain: "",
    publicUrl: "",
    cloudflareTunnelName: "",
    cloudflareRouteHostname: "",
    cloudflareAccessEnabled: false,
    healthCheckUrl: "",
    status: "planned",
    notes: "Not exposed publicly. Access through SMB/Tailscale only.",
    internalPath: "/srv/obsidian-vault",
  },
];
