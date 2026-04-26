import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ecommerce Order Chat",
  description:
    "A full-stack ecommerce app built with Tencent RTC Chat SDK for product chat, persistent order threads, seller replies, and Stripe-ready checkout.",
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
