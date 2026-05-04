"use client";

import { useEffect, useState } from "react";
import { Grid, Column, Tile, Toggle, TextInput } from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState("http://localhost:8011");
  useEffect(() => {
    api.settings().then(() => undefined).catch(() => undefined);
  }, []);

  return (
    <>
      <PageHeader title="Settings" description="System defaults for BuildOS execution workflows." actionLabel="Save Settings" />
      <Grid fullWidth>
        <Column sm={4} md={4} lg={8}>
          <Tile>
            <h3 style={{ marginTop: 0 }}>Workspace Preferences</h3>
            <TextInput id="workspace" labelText="Default workspace name" defaultValue="BuildOS" style={{ marginBottom: "1rem" }} />
            <TextInput id="api-url" labelText="Phase 3 API base URL" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} style={{ marginBottom: "1rem" }} />
            <Toggle id="local-only" labelText="LAN-only mode" toggled />
          </Tile>
        </Column>
      </Grid>
    </>
  );
}
