"use client";

import { useEffect, useState } from "react";
import { Button, InlineNotification, Tile } from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { api } from "@/lib/api";

type HealthState = {
  loading: boolean;
  ok: boolean;
  error: string;
  response: string;
};

export default function NetworkDebugPage() {
  const [health, setHealth] = useState<HealthState>({
    loading: false,
    ok: false,
    error: "",
    response: "",
  });

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const host = typeof window !== "undefined" ? window.location.host : "";
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const protocol = typeof window !== "undefined" ? window.location.protocol : "";

  const check = async () => {
    setHealth({ loading: true, ok: false, error: "", response: "" });
    try {
      const res = await fetch(`${api.baseUrl}/health`, { cache: "no-store" });
      const text = await res.text();
      if (!res.ok) {
        setHealth({ loading: false, ok: false, error: `HTTP ${res.status}`, response: text });
        return;
      }
      setHealth({ loading: false, ok: true, error: "", response: text });
    } catch (error) {
      setHealth({ loading: false, ok: false, error: (error as Error).message, response: "" });
    }
  };

  useEffect(() => {
    void check();
  }, []);

  return (
    <>
      <PageHeader
        title="Network Debug"
        description="Verify client hostname/IP resolution and backend connectivity for LAN."
      />
      <Tile style={{ marginBottom: "1rem" }}>
        <p><strong>Browser origin:</strong> <code>{origin}</code></p>
        <p><strong>Browser host:</strong> <code>{host}</code></p>
        <p><strong>Browser hostname:</strong> <code>{hostname}</code></p>
        <p><strong>Browser protocol:</strong> <code>{protocol}</code></p>
        <p><strong>Resolved API base:</strong> <code>{api.baseUrl}</code></p>
      </Tile>
      <Tile>
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <Button onClick={() => void check()} disabled={health.loading}>
            {health.loading ? "Checking..." : "Recheck Backend Health"}
          </Button>
        </div>
        {health.ok ? (
          <InlineNotification
            kind="success"
            lowContrast
            hideCloseButton
            title="Backend reachable"
            subtitle={`${api.baseUrl}/health responded successfully.`}
            style={{ marginBottom: "0.75rem" }}
          />
        ) : null}
        {!health.ok && health.error ? (
          <InlineNotification
            kind="error"
            lowContrast
            hideCloseButton
            title="Backend check failed"
            subtitle={health.error}
            style={{ marginBottom: "0.75rem" }}
          />
        ) : null}
        <p><strong>Raw response:</strong></p>
        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
{health.response || "(no response yet)"}
        </pre>
      </Tile>
    </>
  );
}

