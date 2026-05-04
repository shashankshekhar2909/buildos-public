import { Grid, Column } from "@carbon/react";
import { SidebarNav } from "@/components/shell/sidebar-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Grid fullWidth>
        <Column sm={4} md={2} lg={3} style={{ padding: 0 }}>
          <SidebarNav />
        </Column>
        <Column sm={4} md={6} lg={13} style={{ padding: 0 }}>
          <main className="page-wrap">{children}</main>
        </Column>
      </Grid>
    </div>
  );
}
