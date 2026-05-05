"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, PasswordInput, TextInput, Tile, InlineNotification } from "@carbon/react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        setError("Invalid username or password.");
        return;
      }
      router.replace("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Tile className="login-card">
        <h1 className="page-header__title">BuildOS Login</h1>
        <p className="page-header__description">Sign in to access your project dashboard.</p>
        {error ? (
          <InlineNotification kind="error" lowContrast hideCloseButton title="Login failed" subtitle={error} style={{ marginBottom: "0.75rem" }} />
        ) : null}
        <form onSubmit={onSubmit}>
          <div className="settings-input">
            <TextInput id="login-username" labelText="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="settings-input">
            <PasswordInput id="login-password" labelText="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</Button>
        </form>
      </Tile>
    </div>
  );
}

