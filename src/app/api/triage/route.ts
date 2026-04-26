import OpenAI from "openai";
import { NextResponse } from "next/server";
import type { TicketPriority, TicketStatus, TriageReply } from "@/lib/types";

type TriageRequest = {
  message?: string;
  customer?: string;
  account?: string;
};

function fallbackTriage(message: string): TriageReply {
  const urgent = /refund|billing|invoice|angry|cancel|charge|security|down|broken/i.test(message);
  const technical = /api|import|webhook|sso|integration|csv|error/i.test(message);

  return {
    status: urgent ? "human-handoff" : "ai-triage",
    priority: urgent ? "high" : technical ? "medium" : "low",
    summary: urgent
      ? "Customer issue may affect money, trust, or account access. Preserve context and request a human takeover."
      : "Customer question can start with an AI reply while staying in the same support thread.",
    reply: urgent
      ? "I understand this needs careful review. I have summarized the issue and will keep this conversation open for a human support specialist to take over here."
      : "I can help with that. I will keep this thread open and ask one follow-up question so the support team has complete context if we need to escalate.",
    handoffReason: urgent ? "High-risk support issue requires human review." : "No handoff needed yet.",
  };
}

export async function POST(request: Request) {
  const { message = "", customer = "customer", account = "account" }: TriageRequest =
    await request.json().catch(() => ({}));

  if (!message.trim()) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(fallbackTriage(message));
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
          "You are an AI support triage assistant. Return compact JSON with status, priority, summary, reply, and handoffReason. status must be ai-triage, human-handoff, waiting-customer, or resolved. priority must be low, medium, or high. The product uses Tencent RTC Chat SDK so AI and human replies stay in one persistent support thread.",
      },
      {
        role: "user",
        content: `Customer: ${customer}\nAccount: ${account}\nMessage: ${message}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const parsed = JSON.parse(completion.choices[0]?.message.content || "{}") as Partial<TriageReply>;
  const fallback = fallbackTriage(message);
  const status: TicketStatus =
    parsed.status === "human-handoff" ||
    parsed.status === "waiting-customer" ||
    parsed.status === "resolved"
      ? parsed.status
      : "ai-triage";
  const priority: TicketPriority =
    parsed.priority === "high" || parsed.priority === "medium" ? parsed.priority : "low";

  return NextResponse.json({
    status,
    priority,
    summary: parsed.summary || fallback.summary,
    reply: parsed.reply || fallback.reply,
    handoffReason: parsed.handoffReason || fallback.handoffReason,
  });
}
