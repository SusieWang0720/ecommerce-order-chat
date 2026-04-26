import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creator Community Chat",
  description:
    "A full-stack creator community app built with Tencent RTC Chat SDK for channels, direct messages, moderation, and optional paid membership.",
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
