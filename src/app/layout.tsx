import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
