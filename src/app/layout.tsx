import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ecommerce Seller Chat",
  description:
    "A full-stack ecommerce app built with Tencent RTC Chat SDK for product chat, order threads, seller ops, and Stripe-ready checkout.",
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
