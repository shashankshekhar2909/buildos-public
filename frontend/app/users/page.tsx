"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Column,
  Grid,
  InlineNotification,
  Modal,
  Search,
  Select,
  SelectItem,
  Tag,
  TextInput,
  Tile,
} from "@carbon/react";
import { TableOfContents, Grid as GridIcon } from "@carbon/icons-react";
import { PageHeader } from "@/components/shared/page-header";
import { EntityTable } from "@/components/shared/entity-table";
import { api } from "@/lib/api";
import type { ApiItem } from "@/lib/api";
import { getAuthMode } from "@/lib/auth";

// ── Local form shape ────────────────────────────────────────────────────────

type UserForm = {
  name: string;
  email: string;
  role: "admin" | "member";
  password: string;
};

const emptyForm: UserForm = { name: "", email: "", role: "member", password: "change-me" };

// ── Sub-components ──────────────────────────────────────────────────────────

function RoleTag({ role }: { role: string }) {
  return (
    <Tag type={role === "admin" ? "blue" : "cool-gray"} size="sm">
      {role}
    </Tag>
  );
}

function StatusTag({ status }: { status: string }) {
  return (
    <Tag type={status === "active" ? "green" : "warm-gray"} size="sm">
      {status}
    </Tag>
  );
}

function UserCard({ user, onToggleActive }: { user: ApiItem; onToggleActive: (user: ApiItem) => void }) {
  const status = user.is_active ? "active" : "inactive";
  return (
    <Tile className="user-card">
      <p className="user-card__name">{user.full_name ?? user.username ?? "-"}</p>
      <p className="user-card__email">{user.email ?? "-"}</p>
      <div style={{ display: "flex", gap: "var(--space-xs)", flexWrap: "wrap" }}>
        <RoleTag role={String(user.role ?? "member")} />
        <StatusTag status={status} />
      </div>
      <p className="user-card__meta">Since {String(user.created_at ?? "").slice(0, 10)}</p>
      <div style={{ marginTop: "var(--space-sm)" }}>
        <Button kind="ghost" size="sm" onClick={() => onToggleActive(user)}>
          {user.is_active ? "Set Inactive" : "Set Active"}
        </Button>
      </div>
    </Tile>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const authMode = getAuthMode();
  const isLocalAuth = authMode === "local";
  const [users, setUsers] = useState<ApiItem[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState<ApiItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [searchQ, setSearchQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [apiError, setApiError] = useState("");
  // "table" | "card" — segmented view toggle
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [loading, setLoading] = useState(true);

  const refreshUsers = async () => {
    try {
      const data = await api.users();
      setUsers(data);
      setApiError("");
    } catch {
      setApiError("Could not load users from backend.");
    }
  };

  useEffect(() => {
    setLoading(true);
    void refreshUsers().finally(() => setLoading(false));
  }, []);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const term = searchQ.trim().toLowerCase();
    return users.filter((u) => {
      const matchSearch =
        !term ||
        String(u.full_name ?? u.username ?? "").toLowerCase().includes(term) ||
        String(u.email ?? "").toLowerCase().includes(term);
      const matchRole = roleFilter === "all" || String(u.role ?? "") === roleFilter;
      const status = u.is_active ? "active" : "inactive";
      const matchStatus = statusFilter === "all" || status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQ, roleFilter, statusFilter]);

  const onAddUser = async () => {
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    if (!trimmedName || !trimmedEmail) return;
    const username =
      trimmedName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, ".") || `user.${Date.now()}`;
    await api.createUser({
      username,
      email: trimmedEmail,
      full_name: trimmedName,
      role: form.role,
      password: form.password.trim() || "change-me",
      is_active: true,
    });
    await refreshUsers();
    setForm(emptyForm);
    setIsCreateOpen(false);
  };

  const onToggleActive = async (user: ApiItem) => {
    await api.updateUser(String(user.id ?? ""), { is_active: !user.is_active });
    await refreshUsers();
  };

  const openPasswordModal = (user: ApiItem) => {
    setPasswordTarget(user);
    setNewPassword("");
    setIsPasswordOpen(true);
  };

  const onChangePassword = async () => {
    const password = newPassword.trim();
    if (!passwordTarget || !password) return;
    await api.updateUser(String(passwordTarget.id ?? ""), { password });
    setIsPasswordOpen(false);
    setPasswordTarget(null);
    setNewPassword("");
  };

  // ── Table rows ──────────────────────────────────────────────────────────────
  const tableRows = filtered.map((u) => ({
    id: String(u.id ?? ""),
    name: String(u.full_name ?? u.username ?? "-"),
    email: String(u.email ?? "-"),
    role: <RoleTag role={String(u.role ?? "member")} />,
    status: <StatusTag status={u.is_active ? "active" : "inactive"} />,
    since: String(u.created_at ?? "").slice(0, 10),
    actions: (
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <Button kind="ghost" size="sm" onClick={() => void onToggleActive(u)}>
          {u.is_active ? "Set Inactive" : "Set Active"}
        </Button>
        {isLocalAuth ? (
          <Button kind="ghost" size="sm" onClick={() => openPasswordModal(u)}>
            Change Password
          </Button>
        ) : null}
      </div>
    ),
  }));

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage BuildOS access. Admin users have full write access; Viewers can browse but not modify."
        actionLabel="Add User"
        onAction={() => setIsCreateOpen(true)}
      />
      {apiError && (
        <InlineNotification
          kind="error"
          lowContrast
          hideCloseButton
                  title="Users API error"
                  subtitle={apiError}
          className="notification--stacked"
        />
      )}

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="filter-bar__search">
          <Search
            id="users-search"
            labelText="Search users"
            placeholder="Search by name or email..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
          />
        </div>
        <div className="filter-bar__select">
          <Select
            id="users-role"
            labelText="Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <SelectItem value="all" text="All roles" />
            <SelectItem value="admin" text="Admin" />
            <SelectItem value="member" text="Member" />
          </Select>
        </div>
        <div className="filter-bar__select">
          <Select
            id="users-status"
            labelText="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <SelectItem value="all" text="All statuses" />
            <SelectItem value="active" text="Active" />
            <SelectItem value="inactive" text="Inactive" />
          </Select>
        </div>

        {/* View toggle — placed at the trailing edge of the filter bar */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: "var(--space-xs)",
            alignItems: "flex-end",
            paddingBottom: "var(--space-xs)",
          }}
        >
          <Button
            kind={viewMode === "table" ? "primary" : "ghost"}
            size="sm"
            renderIcon={TableOfContents}
            iconDescription="Table view"
            hasIconOnly
            tooltipAlignment="center"
            tooltipPosition="bottom"
            onClick={() => setViewMode("table")}
          />
          <Button
            kind={viewMode === "card" ? "primary" : "ghost"}
            size="sm"
            renderIcon={GridIcon}
            iconDescription="Card view"
            hasIconOnly
            tooltipAlignment="center"
            tooltipPosition="bottom"
                  onClick={() => setViewMode("card")}
          />
        </div>
      </div>
      {!isLocalAuth ? (
        <InlineNotification
          kind="info"
          lowContrast
          hideCloseButton
          title="Auth0 mode enabled"
          subtitle="Password changes are managed in Auth0, not in BuildOS."
          className="notification--stacked"
        />
      ) : null}

      {/* Table view */}
      {viewMode === "table" && (
        <EntityTable
          title={`Users (${filtered.length})`}
          loading={loading}
          headers={[
            { key: "name", header: "Name" },
            { key: "email", header: "Email" },
            { key: "role", header: "Role" },
            { key: "status", header: "Status" },
            { key: "since", header: "Member Since" },
            { key: "actions", header: "Actions" },
          ]}
          rows={tableRows}
        />
      )}

      {/* Card view */}
      {viewMode === "card" && (
        <Grid fullWidth>
          {filtered.map((user) => (
            <Column key={String(user.id ?? user.username ?? user.email ?? "")} sm={4} md={4} lg={4} className="column--stack">
              <UserCard user={user} onToggleActive={onToggleActive} />
            </Column>
          ))}
        </Grid>
      )}

      {/* Add User modal */}
      <Modal
        open={isCreateOpen}
        modalHeading="Add User"
        primaryButtonText="Add"
        secondaryButtonText="Cancel"
        onRequestClose={() => {
          setForm(emptyForm);
          setIsCreateOpen(false);
        }}
        onRequestSubmit={onAddUser}
      >
        <div style={{ display: "grid", gap: "var(--space-sm)" }}>
          <TextInput
            id="user-name"
            labelText="Name"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
          <TextInput
            id="user-email"
            labelText="Email"
            placeholder="user@example.com"
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />
          <Select
            id="user-role"
            labelText="Role"
            value={form.role}
            onChange={(e) =>
              setForm((p) => ({ ...p, role: e.target.value as "admin" | "member" }))
            }
          >
            <SelectItem value="member" text="Member — standard access" />
            <SelectItem value="admin" text="Admin — full access" />
          </Select>
          <TextInput
            id="user-password"
            labelText="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          />
        </div>
      </Modal>
      <Modal
        open={isPasswordOpen}
        modalHeading={`Change Password${passwordTarget ? `: ${String(passwordTarget.full_name ?? passwordTarget.username ?? "")}` : ""}`}
        primaryButtonText="Update Password"
        secondaryButtonText="Cancel"
        onRequestClose={() => {
          setIsPasswordOpen(false);
          setPasswordTarget(null);
          setNewPassword("");
        }}
        onRequestSubmit={() => { void onChangePassword(); }}
      >
        <div style={{ display: "grid", gap: "var(--space-sm)" }}>
          <TextInput
            id="new-password"
            labelText="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
      </Modal>
    </>
  );
}
