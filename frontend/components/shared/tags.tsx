import { Tag } from "@carbon/react";

type TagType = "blue" | "cyan" | "gray" | "green" | "magenta" | "purple" | "red" | "teal" | "cool-gray" | "warm-gray" | "high-contrast" | "outline";

export function StatusTag({ value }: { value: string }) {
  const normalized = value || "unknown";
  const tagType: TagType =
    normalized === "active" || normalized === "ready" || normalized === "published"
      ? "green"
      : normalized === "in_progress"
      ? "teal"
      : normalized === "review"
      ? "purple"
      : normalized === "paused" || normalized === "blocked"
      ? "warm-gray"
      : normalized === "open" || normalized === "draft" || normalized === "idea" || normalized === "todo"
      ? "blue"
      : normalized === "done" || normalized === "archived"
      ? "gray"
      : "gray";
  return <Tag type={tagType} size="sm">{normalized}</Tag>;
}

export function PriorityTag({ value }: { value: string }) {
  const normalized = value || "low";
  const tagType: TagType =
    normalized === "critical" ? "red" : normalized === "high" ? "magenta" : normalized === "medium" ? "blue" : "gray";
  return <Tag type={tagType} size="sm">{normalized}</Tag>;
}
