import { NextResponse } from "next/server";
import type { MembershipUpgradeReply, TierKey } from "@/lib/types";

type MembershipRequest = {
  tier?: TierKey;
  memberName?: string;
  community?: string;
};

const unlockedByTier: Record<TierKey, string[]> = {
  free: [],
  backstage: ["channel-backstage"],
  "inner-circle": ["channel-backstage"],
};

export async function POST(request: Request) {
  const { tier, memberName = "Member", community = "community" }: MembershipRequest =
    await request.json().catch(() => ({}));

  if (!tier || !(tier in unlockedByTier)) {
    return NextResponse.json({ error: "Missing or invalid tier" }, { status: 400 });
  }

  const response: MembershipUpgradeReply = {
    tier,
    status: "active",
    unlockedChannelIds: unlockedByTier[tier],
    confirmation:
      tier === "free"
        ? `${memberName} stays on the free tier in ${community}. Public rooms remain available.`
        : `${memberName} upgraded to ${tier.replace("-", " ")} in ${community}. Premium rooms can now continue in the same Tencent RTC Chat SDK thread history.`,
  };

  return NextResponse.json(response);
}
