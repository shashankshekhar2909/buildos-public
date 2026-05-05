import type { Metadata } from "next";
import "@/styles/globals.scss";
import { AppShell } from "@/components/shell/app-shell";

export const metadata: Metadata = {
  title: "BuildOS",
  description: "Private AI-native operating dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
