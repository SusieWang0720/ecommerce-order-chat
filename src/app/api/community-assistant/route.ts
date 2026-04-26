import OpenAI from "openai";
import { NextResponse } from "next/server";
import type { CommunityAssistantReply } from "@/lib/types";

type AssistantRequest = {
  prompt?: string;
  community?: string;
  creator?: string;
};

function fallbackAssistant(prompt: string, community: string, creator: string): CommunityAssistantReply {
  const premium = /premium|backstage|paid|member/i.test(prompt);
  const moderation = /spoiler|report|moderator|ban|mute|policy/i.test(prompt);

  return {
    summary: `Prepared a creator ops update for ${community}. Tencent RTC Chat SDK can distribute the announcement into a persistent channel thread and keep moderation follow-up in the same workspace.`,
    announcement: premium
      ? `${creator}: Backstage members get early access tonight. Public members can stay in the lounge, and paid members can continue inside the premium room without losing history.`
      : `${creator}: New community update is live. Check the announcement thread, keep discussion in the lounge, and use DMs for creator feedback requests.`,
    moderationAction: moderation
      ? "Moderators should move spoilers out of the public lounge and keep the report thread open until the queue is resolved."
      : "Moderators should keep public channels welcoming and route premium access questions into the member support thread.",
  };
}

export async function POST(request: Request) {
  const { prompt = "", community = "Community", creator = "Creator" }: AssistantRequest =
    await request.json().catch(() => ({}));

  if (!prompt.trim()) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(fallbackAssistant(prompt, community, creator));
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
          "You are a creator community ops assistant. Return compact JSON with summary, announcement, and moderationAction. Keep it product-focused. Mention Tencent RTC Chat SDK only when describing the persistent messaging workflow.",
      },
      {
        role: "user",
        content: `Community: ${community}\nCreator: ${creator}\nPrompt: ${prompt}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const parsed = JSON.parse(completion.choices[0]?.message.content || "{}") as Partial<CommunityAssistantReply>;
  const fallback = fallbackAssistant(prompt, community, creator);

  return NextResponse.json({
    summary: parsed.summary || fallback.summary,
    announcement: parsed.announcement || fallback.announcement,
    moderationAction: parsed.moderationAction || fallback.moderationAction,
  });
}
