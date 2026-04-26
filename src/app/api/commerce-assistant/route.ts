import OpenAI from "openai";
import { NextResponse } from "next/server";
import type { CommerceAssistantReply } from "@/lib/types";

type AssistantRequest = {
  prompt?: string;
  store?: string;
  seller?: string;
};

function fallbackAssistant(prompt: string, store: string, seller: string): CommerceAssistantReply {
  const payment = /stripe|pay|checkout|invoice|card/i.test(prompt);
  const shipping = /ship|tracking|delivery|dispatch/i.test(prompt);

  return {
    summary: `Prepared an order-thread update for ${store}. Tencent RTC Chat SDK can keep pre-sale questions, payment updates, and post-purchase follow-up inside the same buyer-seller workflow.`,
    sellerReply: payment
      ? `${seller}: I can send the Stripe payment link in this thread and keep your order conversation open after payment clears.`
      : `${seller}: I can confirm inventory here and keep the order thread active for shipping updates after you place the order.`,
    opsAction: shipping
      ? "Order ops should post tracking and dispatch notes in the order thread instead of moving the buyer to email."
      : "Store ops should keep product questions, payment confirmation, and post-purchase follow-up attached to the same product or order thread.",
  };
}

export async function POST(request: Request) {
  const { prompt = "", store = "Store", seller = "Seller" }: AssistantRequest =
    await request.json().catch(() => ({}));

  if (!prompt.trim()) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(fallbackAssistant(prompt, store, seller));
  }

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.AI_BASE_URL || undefined,
  });

  const completion = await client.chat.completions.create({
    model: process.env.AI_MODEL || "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an ecommerce order assistant. Return compact JSON with summary, sellerReply, and opsAction. Keep it grounded in buyer-seller chat, payment workflow, and post-purchase order continuity.",
      },
      {
        role: "user",
        content: `Store: ${store}\nSeller: ${seller}\nPrompt: ${prompt}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const parsed = JSON.parse(completion.choices[0]?.message.content || "{}") as Partial<CommerceAssistantReply>;
  const fallback = fallbackAssistant(prompt, store, seller);

  return NextResponse.json({
    summary: parsed.summary || fallback.summary,
    sellerReply: parsed.sellerReply || fallback.sellerReply,
    opsAction: parsed.opsAction || fallback.opsAction,
  });
}
