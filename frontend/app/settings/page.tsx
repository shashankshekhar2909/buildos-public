"use client";

import { useEffect, useState } from "react";
import { Grid, Column, Tile, Toggle, TextInput, Button, InlineNotification } from "@carbon/react";
import { PageHeader } from "@/components/shared/page-header";
import { api } from "@/lib/api";

const LS_API_URL = "buildos:api_base_url";
const LS_LAN_ONLY = "buildos:lan_only";

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState(api.baseUrl);
  const [lanOnly, setLanOnly] = useState(false);
  const [saved, setSaved] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedUrl = localStorage.getItem(LS_API_URL);
    const storedLan = localStorage.getItem(LS_LAN_ONLY);
    if (storedUrl) {
      setApiUrl(storedUrl);
    }
    if (storedLan !== null) {
      setLanOnly(storedLan === "true");
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(LS_API_URL, apiUrl);
    localStorage.setItem(LS_LAN_ONLY, String(lanOnly));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    api.settings().then(() => undefined).catch(() => undefined);
  };

  return (
    <>
      <PageHeader
        title="Settings"
        description="System defaults for BuildOS execution workflows."
        actionLabel="Save Settings"
        onAction={handleSave}
      />

      {saved && (
        <InlineNotification
          kind="success"
          lowContrast
          hideCloseButton
          title="Saved"
          subtitle="Settings persisted to localStorage."
          className="notification--stacked"
        />
      )}

      <Grid fullWidth>
        <Column sm={4} md={4} lg={8}>
          <Tile>
            <h3 className="section-heading">Workspace Preferences</h3>
            <TextInput
              id="workspace"
              labelText="Default workspace name"
              defaultValue="BuildOS"
              helperText="[not saved — cosmetic label only]"
              className="settings-input"
            />
            <TextInput
              id="api-url"
              labelText="API base URL"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              helperText="Persisted to localStorage. Reload the app to apply a new URL."
              className="settings-input"
            />
            <Toggle
              id="local-only"
              labelText="LAN-only mode"
              toggled={lanOnly}
              onToggle={(checked: boolean) => setLanOnly(checked)}
            />
            <div style={{ marginTop: "1.5rem" }}>
              <Button kind="primary" size="sm" onClick={handleSave}>
                Save Settings
              </Button>
            </div>
          </Tile>
        </Column>
      </Grid>
    </>
  );
}
