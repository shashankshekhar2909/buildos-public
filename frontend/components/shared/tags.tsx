import { Tag } from "@carbon/react";
import { Priority, Status } from "@/lib/types";

type TagType = "blue" | "cyan" | "gray" | "green" | "magenta" | "purple" | "red" | "teal" | "cool-gray" | "warm-gray" | "high-contrast" | "outline";

export function StatusTag({ value }: { value: Status }) {
  const tagType: TagType =
    value === "active" || value === "ready" || value === "published"
      ? "green"
      : value === "paused" || value === "review"
      ? "purple"
      : value === "open" || value === "draft" || value === "idea"
      ? "blue"
      : "gray";
  return <Tag type={tagType}>{value}</Tag>;
}

export function PriorityTag({ value }: { value: Priority }) {
  const tagType: TagType = value === "critical" ? "red" : value === "high" ? "magenta" : value === "medium" ? "blue" : "gray";
  return <Tag type={tagType}>{value}</Tag>;
}
