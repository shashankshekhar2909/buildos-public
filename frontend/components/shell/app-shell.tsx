"use client";

import { Theme, Header, HeaderName, SideNav, SideNavItems, Button } from "@carbon/react";
import { usePathname, useRouter } from "next/navigation";
import { SidebarNav } from "@/components/shell/sidebar-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname === "/login";

  const onLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  return (
    <Theme theme="g10">
      {!isAuthPage ? (
        <>
          <Header aria-label="BuildOS">
            <HeaderName href="/" prefix="BuildWithShashank">
              BuildOS
            </HeaderName>
            <div style={{ marginLeft: "auto", paddingRight: "1rem" }}>
              <Button kind="ghost" size="sm" onClick={onLogout}>Logout</Button>
            </div>
          </Header>
          <SideNav isFixedNav expanded aria-label="Side navigation">
            <SideNavItems>
              <SidebarNav />
            </SideNavItems>
          </SideNav>
        </>
      ) : null}
      <main className="app-content cds--content">{children}</main>
    </Theme>
  );
}
