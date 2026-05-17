import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kidos Learning Academy",
  description: "A warm, child-focused learning academy landing page.",
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
