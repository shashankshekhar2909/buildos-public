"use client";

import { useEffect, useState } from "react";
import { Button, Modal, TextInput, Toggle } from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { EntityTable } from "@/components/shared/entity-table";
import { api, type ApiItem } from "@/lib/api";

type UserForm = {
  username: string;
  email: string;
  full_name: string;
  role: string;
  password: string;
  is_active: boolean;
};

const emptyForm: UserForm = {
  username: "",
  email: "",
  full_name: "",
  role: "member",
  password: "",
  is_active: true,
};

export default function UsersPage() {
  const [users, setUsers] = useState<ApiItem[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<UserForm>(emptyForm);

  const refresh = () => api.users().then(setUsers).catch(() => undefined);
  useEffect(() => {
    refresh();
  }, []);

  const onCreate = async () => {
    if (!form.username.trim() || !form.password.trim()) return;
    await api.createUser(form);
    setForm(emptyForm);
    setIsCreateOpen(false);
    await refresh();
  };

  const onToggleActive = async (id: string | number, is_active: boolean) => {
    await api.updateUser(id, { is_active: !is_active });
    await refresh();
  };

  const onDelete = async (id: string | number) => {
    await api.deleteUser(id);
    await refresh();
  };

  const rows = users.map((u, idx) => ({
    id: String(u.id ?? idx),
    username: String(u.username ?? ""),
    email: String(u.email ?? "-"),
    name: String(u.full_name ?? "-"),
    role: String(u.role ?? "member"),
    active: String(u.is_active ? "yes" : "no"),
    actions: (
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Button size="sm" kind="ghost" onClick={() => void onToggleActive(String(u.id ?? ""), Boolean(u.is_active))}>
          {u.is_active ? "Disable" : "Enable"}
        </Button>
        <Button size="sm" kind="danger--ghost" onClick={() => void onDelete(String(u.id ?? ""))}>Delete</Button>
      </div>
    ),
  }));

  return (
    <>
      <PageHeader title="Users" description="Manage BuildOS users and access state." actionLabel="Add User" />
      <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={() => setIsCreateOpen(true)}>Add User</Button>
      </div>
      <EntityTable
        title={`Users (${rows.length})`}
        headers={[
          { key: "username", header: "Username" },
          { key: "email", header: "Email" },
          { key: "name", header: "Name" },
          { key: "role", header: "Role" },
          { key: "active", header: "Active" },
          { key: "actions", header: "Actions" },
        ]}
        rows={rows}
      />

      <Modal
        open={isCreateOpen}
        modalHeading="Add User"
        primaryButtonText="Create"
        secondaryButtonText="Cancel"
        onRequestClose={() => setIsCreateOpen(false)}
        onRequestSubmit={() => { void onCreate(); }}
      >
        <div style={{ display: "grid", gap: "0.75rem" }}>
          <TextInput id="user-username" labelText="Username" value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} />
          <TextInput id="user-email" labelText="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          <TextInput id="user-full-name" labelText="Full Name" value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} />
          <TextInput id="user-role" labelText="Role" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} />
          <TextInput id="user-password" labelText="Password" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
          <Toggle id="user-active" labelText="Active user" toggled={form.is_active} onToggle={(state) => setForm((p) => ({ ...p, is_active: state }))} />
        </div>
      </Modal>
    </>
  );
}

