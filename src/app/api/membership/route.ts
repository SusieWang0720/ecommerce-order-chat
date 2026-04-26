import { NextResponse } from "next/server";
import type { CheckoutReply, PaymentProvider } from "@/lib/types";

type CheckoutRequest = {
  productId?: string;
  productTitle?: string;
  amount?: number;
  paymentProvider?: PaymentProvider;
  buyerName?: string;
};

export async function POST(request: Request) {
  const {
    productId = "product",
    productTitle = "product",
    amount = 0,
    paymentProvider = "mock",
    buyerName = "Buyer",
  }: CheckoutRequest = await request.json().catch(() => ({}));

  if (!productId || !amount) {
    return NextResponse.json({ error: "Missing product or amount" }, { status: 400 });
  }

  const paid = paymentProvider === "stripe";
  const response: CheckoutReply = {
    orderId: `order-${Date.now()}`,
    stage: paid ? "paid" : "payment-pending",
    paymentProvider,
    paymentStatus: paid ? "paid" : "pending",
    amount,
    confirmation: paid
      ? `${buyerName} completed Stripe payment for ${productTitle}. Keep shipping and support updates in the same order thread.`
      : `${buyerName} started a mock checkout for ${productTitle}. The order thread stays open while payment is pending.`,
  };

  return NextResponse.json(response);
}
