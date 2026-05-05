"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Column,
  Grid,
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
import { users as seedUsers } from "@/lib/mock-data";
import type { User } from "@/lib/types";

// ── Local form shape ────────────────────────────────────────────────────────

type UserForm = {
  name: string;
  email: string;
  role: "admin" | "viewer";
};

const emptyForm: UserForm = { name: "", email: "", role: "viewer" };

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

function UserCard({ user }: { user: User }) {
  return (
    <Tile className="user-card">
      <p className="user-card__name">{user.name}</p>
      <p className="user-card__email">{user.email}</p>
      <div style={{ display: "flex", gap: "var(--space-xs)", flexWrap: "wrap" }}>
        <RoleTag role={user.role} />
        <StatusTag status={user.status} />
      </div>
      <p className="user-card__meta">Since {user.createdAt}</p>
    </Tile>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [searchQ, setSearchQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  // "table" | "card" — segmented view toggle
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const term = searchQ.trim().toLowerCase();
    return users.filter((u) => {
      const matchSearch =
        !term ||
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term);
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      const matchStatus = statusFilter === "all" || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQ, roleFilter, statusFilter]);

  // ── Add user (mock — in-memory only) ──────────────────────────────────────
  const onAddUser = () => {
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    if (!trimmedName || !trimmedEmail) return;
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      role: form.role,
      status: "invited",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setUsers((prev) => [newUser, ...prev]);
    setForm(emptyForm);
    setIsCreateOpen(false);
  };

  // ── Table rows ──────────────────────────────────────────────────────────────
  const tableRows = filtered.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: <RoleTag role={u.role} />,
    status: <StatusTag status={u.status} />,
    since: u.createdAt,
  }));

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage BuildOS access. Admin users have full write access; Viewers can browse but not modify."
        actionLabel="Add User"
        onAction={() => setIsCreateOpen(true)}
      />

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
            <SelectItem value="viewer" text="Viewer" />
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
            <SelectItem value="invited" text="Invited" />
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

      {/* Table view */}
      {viewMode === "table" && (
        <EntityTable
          title={`Users (${filtered.length})`}
          headers={[
            { key: "name", header: "Name" },
            { key: "email", header: "Email" },
            { key: "role", header: "Role" },
            { key: "status", header: "Status" },
            { key: "since", header: "Member Since" },
          ]}
          rows={tableRows}
        />
      )}

      {/* Card view */}
      {viewMode === "card" && (
        <Grid fullWidth>
          {filtered.map((user) => (
            <Column key={user.id} sm={4} md={4} lg={4} className="column--stack">
              <UserCard user={user} />
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
              setForm((p) => ({ ...p, role: e.target.value as "admin" | "viewer" }))
            }
          >
            <SelectItem value="viewer" text="Viewer — read-only access" />
            <SelectItem value="admin" text="Admin — full access" />
          </Select>
        </div>
      </Modal>
    </>
  );
}
