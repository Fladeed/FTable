import type { Metadata } from "next";
import { DemoNav } from "@/components/DemoNav/DemoNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "FTable",
  description: "Open-source ERP-style table component",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <DemoNav />
          <div className="app-shell__content">{children}</div>
        </div>
      </body>
    </html>
  );
}
