export type Role = "creator" | "moderator" | "member" | "guest";

export type MembershipStatus = "active" | "trial" | "gated";

export type TierKey = "free" | "backstage" | "inner-circle";

export type ChannelKind = "announcement" | "chat" | "premium";

export type ModerationStatus = "open" | "reviewing" | "resolved";

export type CommunityMessageAuthor = "creator" | "moderator" | "member" | "system";

export type CommunityMessage = {
  id: string;
  author: CommunityMessageAuthor;
  name: string;
  time: string;
  body: string;
};

export type CommunityMember = {
  id: string;
  name: string;
  handle: string;
  role: Role;
  status: MembershipStatus;
  tier: TierKey;
  bio: string;
  unreadCount: number;
};

export type MembershipTier = {
  id: TierKey;
  name: string;
  priceLabel: string;
  description: string;
  perks: string[];
};

export type CommunityChannel = {
  id: string;
  name: string;
  kind: ChannelKind;
  access: TierKey;
  topic: string;
  unreadCount: number;
  messages: CommunityMessage[];
};

export type DirectThread = {
  id: string;
  title: string;
  participants: string[];
  unreadCount: number;
  messages: CommunityMessage[];
};

export type ModerationReport = {
  id: string;
  reason: string;
  status: ModerationStatus;
  reporter: string;
  target: string;
};

export type CommunityWorkspace = {
  communityId: string;
  name: string;
  slug: string;
  category: string;
  creatorName: string;
  coverTagline: string;
  heroPitch: string;
  nextDrop: string;
  activeMembers: number;
  onlineNow: number;
  members: CommunityMember[];
  membershipTiers: MembershipTier[];
  channels: CommunityChannel[];
  directThreads: DirectThread[];
  reports: ModerationReport[];
};

export type CommunityAssistantReply = {
  summary: string;
  announcement: string;
  moderationAction: string;
};

export type MembershipUpgradeReply = {
  tier: TierKey;
  status: MembershipStatus;
  unlockedChannelIds: string[];
  confirmation: string;
};
