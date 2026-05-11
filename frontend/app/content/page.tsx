"use client";

import { useEffect, useState } from "react";
import { Tag, Modal, TextInput, TextArea, Select, SelectItem, OverflowMenu, OverflowMenuItem } from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchToolbar } from "@/components/shared/search-toolbar";
import { EntityTable } from "@/components/shared/entity-table";
import { StatusTag } from "@/components/shared/tags";
import { api } from "@/lib/api";
import type { ApiItem } from "@/lib/api";

function truncate(text: string, maxLen = 60) {
  if (!text) return "-";
  return text.length > maxLen ? text.slice(0, maxLen) + "…" : text;
}

export default function ContentPage() {
  const [contentItems, setContentItems] = useState<ApiItem[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [formTitle, setFormTitle] = useState("");
  const [formHook, setFormHook] = useState("");
  const [formPlatform, setFormPlatform] = useState("linkedin");
  const [formType, setFormType] = useState("post");
  const [formStatus, setFormStatus] = useState("idea");
  const [formBody, setFormBody] = useState("");
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .content({
        search: searchQ || undefined,
        platform: platformFilter === "all" ? undefined : platformFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
      })
      .then(setContentItems)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [searchQ, platformFilter, statusFilter]);

  const rows = contentItems.map((item, i) => {
    const platform = String(item.platform ?? "");
    const contentType = String(item.content_type ?? item.contentType ?? "");
    const titleStr = String(item.title ?? "-");
    const hookStr = truncate(String(item.hook ?? ""));
    return {
      id: `${item.id ?? i}`,
      title: (
        <span className="cell--truncate" title={titleStr}>{titleStr}</span>
      ),
      hook: hookStr !== "-" ? (
        <span className="cell--truncate" title={String(item.hook ?? "")}>{hookStr}</span>
      ) : "-",
      typePlatform: (
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
          {contentType && <Tag type="blue" size="sm">{contentType}</Tag>}
          {platform && <Tag type="teal" size="sm">{platform}</Tag>}
        </div>
      ),
      status: <StatusTag value={String(item.status ?? "idea")} />,
      project: item.project ?? "-",
      actions: (
        <OverflowMenu size="sm" flipped iconDescription="Content actions">
          <OverflowMenuItem
            itemText="Edit"
            onClick={() => {
              setEditId(typeof item.id === "number" ? item.id : null);
              setFormTitle(String(item.title ?? ""));
              setFormHook(String(item.hook ?? ""));
              setFormPlatform(String(item.platform ?? "linkedin"));
              setFormType(String(item.content_type ?? "post"));
              setFormStatus(String(item.status ?? "idea"));
              setFormBody(String(item.body ?? ""));
              setCreateError("");
              setIsCreateOpen(true);
            }}
          />
          <OverflowMenuItem
            hasDivider
            isDelete
            itemText="Delete"
            onClick={() => {
              setEditId(typeof item.id === "number" ? item.id : null);
              setIsDeleteOpen(true);
            }}
          />
        </OverflowMenu>
      ),
    };
  });

  return (
    <>
      <PageHeader
        title="Content Lab"
        description="Manage ideas, drafts, reviews, and publication pipeline."
        actionLabel="New Content Idea"
        onAction={() => setIsCreateOpen(true)}
      />
      <EntityTable
        title="Content"
        loading={loading}
        toolbar={
          <SearchToolbar
            searchLabel="Search content"
            searchValue={searchQ}
            onSearch={setSearchQ}
            filterA={{ id: "platform", label: "Platform", items: ["linkedin", "youtube", "blog"], value: platformFilter, onChange: setPlatformFilter }}
            filterB={{ id: "status", label: "Status", items: ["idea", "draft", "review", "ready", "published"], value: statusFilter, onChange: setStatusFilter }}
          />
        }
        headers={[
          { key: "title", header: "Title" },
          { key: "hook", header: "Hook" },
          { key: "typePlatform", header: "Type / Platform" },
          { key: "status", header: "Status" },
          { key: "project", header: "Project" },
          { key: "actions", header: "" },
        ]}
        rows={rows}
      />
      <Modal
        open={isCreateOpen}
        modalHeading={editId ? "Edit Content Item" : "Create Content Item"}
        primaryButtonText={createBusy ? (editId ? "Saving..." : "Creating...") : (editId ? "Save" : "Create")}
        secondaryButtonText="Cancel"
        primaryButtonDisabled={createBusy || !formTitle.trim()}
        onRequestClose={() => {
          setIsCreateOpen(false);
          setCreateError("");
        }}
        onRequestSubmit={async () => {
          setCreateError("");
          setCreateBusy(true);
          try {
            const payload = {
              title: formTitle.trim(),
              hook: formHook.trim() || null,
              platform: formPlatform,
              content_type: formType,
              status: formStatus,
              body: formBody.trim() || null,
            };
            if (editId) await api.updateContent(editId, payload);
            else await api.createContent(payload);
            setContentItems(await api.content());
            setIsCreateOpen(false);
            setEditId(null);
            setFormTitle("");
            setFormHook("");
            setFormBody("");
            setFormPlatform("linkedin");
            setFormType("post");
            setFormStatus("idea");
          } catch (e) {
            setCreateError(e instanceof Error ? e.message : "Failed to create content item");
          } finally {
            setCreateBusy(false);
          }
        }}
      >
        <TextInput id="content-title" labelText="Title" value={formTitle} onChange={(e) => setFormTitle(e.currentTarget.value)} />
        <div style={{ height: "0.75rem" }} />
        <TextInput id="content-hook" labelText="Hook" value={formHook} onChange={(e) => setFormHook(e.currentTarget.value)} />
        <div style={{ height: "0.75rem" }} />
        <Select id="content-platform" labelText="Platform" value={formPlatform} onChange={(e) => setFormPlatform(e.currentTarget.value)}>
          <SelectItem value="linkedin" text="linkedin" />
          <SelectItem value="youtube" text="youtube" />
          <SelectItem value="blog" text="blog" />
        </Select>
        <div style={{ height: "0.75rem" }} />
        <Select id="content-type" labelText="Content Type" value={formType} onChange={(e) => setFormType(e.currentTarget.value)}>
          <SelectItem value="post" text="post" />
          <SelectItem value="thread" text="thread" />
          <SelectItem value="video" text="video" />
          <SelectItem value="article" text="article" />
        </Select>
        <div style={{ height: "0.75rem" }} />
        <Select id="content-status" labelText="Status" value={formStatus} onChange={(e) => setFormStatus(e.currentTarget.value)}>
          <SelectItem value="idea" text="idea" />
          <SelectItem value="draft" text="draft" />
          <SelectItem value="review" text="review" />
          <SelectItem value="ready" text="ready" />
          <SelectItem value="published" text="published" />
        </Select>
        <div style={{ height: "0.75rem" }} />
        <TextArea id="content-body" labelText="Body" rows={6} value={formBody} onChange={(e) => setFormBody(e.currentTarget.value)} />
        {createError ? <p style={{ color: "var(--cds-support-error)", marginTop: "0.75rem" }}>{createError}</p> : null}
      </Modal>
      <Modal
        open={isDeleteOpen}
        modalHeading="Delete Content Item"
        danger
        primaryButtonText="Delete"
        secondaryButtonText="Cancel"
        onRequestClose={() => setIsDeleteOpen(false)}
        onRequestSubmit={async () => {
          if (!editId) return;
          await api.deleteContent(editId);
          setContentItems(await api.content());
          setIsDeleteOpen(false);
          setEditId(null);
        }}
      >
        This content item will be permanently deleted.
      </Modal>
    </>
  );
}
