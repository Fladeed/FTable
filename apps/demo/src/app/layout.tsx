import type { Metadata } from "next";
import { DemoNav } from "@/components/DemoNav/DemoNav";
import { ThemeToggle } from "@/components/ThemeToggle/ThemeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "FloTable",
  description: "Open-source ERP-style table component",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeToggle />
        <div className="app-shell">
          <DemoNav />
          <div className="app-shell__content">{children}</div>
        </div>
      </body>
    </html>
  );
}
