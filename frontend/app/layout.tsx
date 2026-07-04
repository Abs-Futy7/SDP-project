import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "University Management System",
  description: "University management portal for registration, notices, and role dashboards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
