import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Customer Support AI Handoff",
  description:
    "A free-forever AI customer support handoff inbox built with Tencent RTC Chat SDK.",
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
