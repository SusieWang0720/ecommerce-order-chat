"use client";

import {
  Bot,
  CreditCard,
  Crown,
  KeyRound,
  LockKeyhole,
  MessageCircleReply,
  Radio,
  SendHorizontal,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { clsx } from "clsx";
import { useState, useTransition } from "react";
import { creatorCommunityDemo } from "@/lib/demo-data";
import { initTencentRtcChat } from "@/lib/tencent-rtc-chat";
import type {
  CommunityAssistantReply,
  CommunityMember,
  CommunityMessage,
  CommunityWorkspace,
  MembershipStatus,
  MembershipTier,
  TierKey,
} from "@/lib/types";

const chatMode = process.env.NEXT_PUBLIC_CHAT_MODE || "mock";
const sdkAppId = Number(process.env.NEXT_PUBLIC_TENCENT_SDK_APP_ID || 0);
const creatorUserId = process.env.NEXT_PUBLIC_CREATOR_USER_ID || "creator_nova";
const defaultMemberUserId = process.env.NEXT_PUBLIC_DEFAULT_MEMBER_USER_ID || "member-alina";

type SurfaceState =
  | { kind: "channel"; id: string }
  | { kind: "dm"; id: string };

const tierRank: Record<TierKey, number> = {
  free: 0,
  backstage: 1,
  "inner-circle": 2,
};

function canAccess(memberTier: TierKey, requiredTier: TierKey) {
  return tierRank[memberTier] >= tierRank[requiredTier];
}

function nowLabel() {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function roleLabel(member: CommunityMember) {
  return member.role === "creator"
    ? "Creator"
    : member.role === "moderator"
      ? "Moderator"
      : member.role === "guest"
        ? "Guest"
        : "Member";
}

function statusLabel(status: MembershipStatus) {
  return status === "active" ? "Active" : status === "trial" ? "Trial" : "Gated";
}

function TierBadge({ tier }: { tier: TierKey }) {
  return <span className={clsx("tier-badge", `tier-${tier}`)}>{tier.replace("-", " ")}</span>;
}

function MemberBadge({ member }: { member: CommunityMember }) {
  return (
    <span className={clsx("member-badge", `role-${member.role}`)}>
      {roleLabel(member)} · {statusLabel(member.status)}
    </span>
  );
}

function makeSystemMessage(body: string): CommunityMessage {
  return {
    id: `system-${Date.now()}`,
    author: "system",
    name: "Tencent RTC Chat SDK",
    time: nowLabel(),
    body,
  };
}

export function CreatorCommunityChatApp() {
  const [workspace, setWorkspace] = useState<CommunityWorkspace>(creatorCommunityDemo);
  const [viewerId] = useState(defaultMemberUserId);
  const [surface, setSurface] = useState<SurfaceState>({
    kind: "channel",
    id: creatorCommunityDemo.channels[1]?.id || creatorCommunityDemo.channels[0].id,
  });
  const [composer, setComposer] = useState(
    "I just joined from TikTok. Which room should I use for short-form editing feedback?",
  );
  const [automationPrompt, setAutomationPrompt] = useState(
    "Announce tonight's backstage listening room and tell moderators to move spoilers out of the public lounge.",
  );
  const [sdkState, setSdkState] = useState(
    chatMode === "tencent" ? "Tencent mode ready to connect" : "Mock mode: no credentials required",
  );
  const [membershipNote, setMembershipNote] = useState(
    "Free members can join public channels immediately. Paid tiers unlock premium rooms without breaking chat history.",
  );
  const [isAssistantPending, startAssistantTransition] = useTransition();
  const [isUpgradePending, startUpgradeTransition] = useTransition();

  const viewer = workspace.members.find((member) => member.id === viewerId) || workspace.members[0];
  const selectedChannel =
    surface.kind === "channel"
      ? workspace.channels.find((channel) => channel.id === surface.id) || workspace.channels[0]
      : null;
  const selectedDm =
    surface.kind === "dm"
      ? workspace.directThreads.find((thread) => thread.id === surface.id) || workspace.directThreads[0]
      : null;
  const currentMessages = selectedChannel?.messages || selectedDm?.messages || [];
  const premiumLocked = Boolean(
    selectedChannel && !canAccess(viewer.tier, selectedChannel.access),
  );
  const openReports = workspace.reports.filter((report) => report.status !== "resolved").length;
  const premiumRoomCount = workspace.channels.filter((channel) => channel.access !== "free").length;

  async function connectTencentChat() {
    if (chatMode !== "tencent") {
      setSdkState("Switch NEXT_PUBLIC_CHAT_MODE=tencent and add credentials to connect.");
      return;
    }

    if (!sdkAppId) {
      setSdkState("Missing NEXT_PUBLIC_TENCENT_SDK_APP_ID.");
      return;
    }

    setSdkState("Requesting backend-issued UserSig...");
    const response = await fetch("/api/usersig", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: creatorUserId }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setSdkState(payload.error || "Could not issue UserSig.");
      return;
    }

    setSdkState("Logging in to Tencent RTC Chat SDK...");
    await initTencentRtcChat({
      sdkAppId: payload.sdkAppId,
      userId: payload.userId,
      userSig: payload.userSig,
    });
    setSdkState(`Connected as ${payload.userId}. Community channels and DMs can sync through Tencent RTC Chat SDK.`);
  }

  function activateProfile() {
    setWorkspace((current) => ({
      ...current,
      members: current.members.map((member) =>
        member.id === viewer.id
          ? {
              ...member,
              status: "active",
              unreadCount: member.unreadCount + 1,
            }
          : member,
      ),
      channels: current.channels.map((channel) =>
        channel.id === "channel-lounge"
          ? {
              ...channel,
              messages: [
                ...channel.messages,
                {
                  id: `welcome-${Date.now()}`,
                  author: "system",
                  name: "Tencent RTC Chat SDK",
                  time: nowLabel(),
                  body: `${viewer.name} finished profile onboarding. Community identity stays consistent across channels and DMs.`,
                },
              ],
            }
          : channel,
      ),
    }));
    setMembershipNote("Profile activated. Public channels, member directory, and creator DMs now use the same community identity.");
  }

  function sendMessage() {
    const body = composer.trim();
    if (!body) return;

    if (premiumLocked) {
      setMembershipNote("This room is gated. Upgrade the member tier first, then the same thread unlocks with full history.");
      return;
    }

    const memberMessage: CommunityMessage = {
      id: `member-${Date.now()}`,
      author: "member",
      name: viewer.name,
      time: nowLabel(),
      body,
    };

    setWorkspace((current) => ({
      ...current,
      channels: current.channels.map((channel) =>
        surface.kind === "channel" && channel.id === surface.id
          ? {
              ...channel,
              messages: [...channel.messages, memberMessage],
            }
          : channel,
      ),
      directThreads: current.directThreads.map((thread) =>
        surface.kind === "dm" && thread.id === surface.id
          ? {
              ...thread,
              messages: [...thread.messages, memberMessage],
            }
          : thread,
      ),
    }));

    setComposer("");
  }

  function resolveReport(reportId: string) {
    setWorkspace((current) => ({
      ...current,
      reports: current.reports.map((report) =>
        report.id === reportId ? { ...report, status: "resolved" } : report,
      ),
    }));
  }

  function upgradeTier(tier: TierKey) {
    startUpgradeTransition(async () => {
      const response = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, memberName: viewer.name, community: workspace.name }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setMembershipNote(payload.error || "Upgrade failed.");
        return;
      }

      setWorkspace((current) => ({
        ...current,
        members: current.members.map((member) =>
          member.id === viewer.id
            ? {
                ...member,
                tier: payload.tier,
                status: payload.status,
              }
            : member,
        ),
        channels: current.channels.map((channel) =>
          payload.unlockedChannelIds.includes(channel.id)
            ? {
                ...channel,
                unreadCount: channel.unreadCount + 1,
                messages: [...channel.messages, makeSystemMessage(payload.confirmation)],
              }
            : channel,
        ),
      }));

      setMembershipNote(payload.confirmation);
      if (payload.unlockedChannelIds[0]) {
        setSurface({ kind: "channel", id: payload.unlockedChannelIds[0] });
      }
    });
  }

  function runCommunityAssistant() {
    const prompt = automationPrompt.trim();
    if (!prompt) return;

    startAssistantTransition(async () => {
      const response = await fetch("/api/community-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          community: workspace.name,
          creator: workspace.creatorName,
        }),
      });
      const payload = (await response.json()) as CommunityAssistantReply & { error?: string };

      if (!response.ok) {
        setMembershipNote(payload.error || "Community assistant failed.");
        return;
      }

      setWorkspace((current) => ({
        ...current,
        channels: current.channels.map((channel) =>
          channel.id === "channel-announcements"
            ? {
                ...channel,
                unreadCount: channel.unreadCount + 1,
                messages: [
                  ...channel.messages,
                  {
                    id: `creator-announcement-${Date.now()}`,
                    author: "creator",
                    name: current.creatorName,
                    time: nowLabel(),
                    body: payload.announcement,
                  },
                  makeSystemMessage(payload.summary),
                ],
              }
            : channel,
        ),
        reports: current.reports.map((report, index) =>
          index === 0 && report.status !== "resolved"
            ? {
                ...report,
                status: "reviewing",
                reason: `${report.reason} ${payload.moderationAction}`,
              }
            : report,
        ),
      }));

      setAutomationPrompt("");
      setSurface({ kind: "channel", id: "channel-announcements" });
    });
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-card">
          <div className="eyebrow">
            <Sparkles size={16} />
            Tencent RTC Chat, free forever
          </div>
          <h1>Creator communities need more than a landing page and a chat box.</h1>
          <p>
            Build a full-stack social product with sign-up, member profiles, public channels,
            creator DMs, moderation, and optional paid membership on top of Tencent RTC Chat SDK.
          </p>
          <div className="hero-actions">
            <button onClick={connectTencentChat} className="primary-action">
              <ShieldCheck size={18} />
              Connect Chat SDK
            </button>
            <a href="https://trtc.io/free-chat-api" target="_blank" rel="noreferrer" className="secondary-action">
              <KeyRound size={18} />
              Start free forever
            </a>
          </div>
        </div>

        <div className="hero-side-card">
          <div className="hero-side-icon">
            <Radio size={34} />
          </div>
          <h2>{workspace.name}</h2>
          <p>{workspace.coverTagline}</p>
          <span>{workspace.nextDrop}</span>
        </div>
      </section>

      <section className="stats-grid">
        <div>
          <strong>{workspace.activeMembers.toLocaleString()}</strong>
          <span>registered members</span>
        </div>
        <div>
          <strong>{workspace.onlineNow}</strong>
          <span>online right now</span>
        </div>
        <div>
          <strong>{premiumRoomCount}</strong>
          <span>premium rooms</span>
        </div>
        <div>
          <strong>{openReports}</strong>
          <span>open moderation items</span>
        </div>
      </section>

      <section className="workspace">
        <aside className="sidebar-panel">
          <div className="panel-title">
            <UsersRound size={18} />
            Community Hub
          </div>

          <div className="viewer-card">
            <div>
              <span className="tiny-label">Signed in as</span>
              <h3>{viewer.name}</h3>
              <p>@{viewer.handle}</p>
            </div>
            <MemberBadge member={viewer} />
            <TierBadge tier={viewer.tier} />
          </div>

          <div className="list-block">
            <span className="tiny-label">Channels</span>
            {workspace.channels.map((channel) => {
              const locked = !canAccess(viewer.tier, channel.access);
              return (
                <button
                  key={channel.id}
                  onClick={() => setSurface({ kind: "channel", id: channel.id })}
                  className={clsx(
                    "nav-row",
                    surface.kind === "channel" && surface.id === channel.id && "selected",
                    locked && "locked",
                  )}
                >
                  <div>
                    <strong>{channel.name}</strong>
                    <small>{channel.topic}</small>
                  </div>
                  <div className="nav-meta">
                    {locked ? <LockKeyhole size={16} /> : <span>{channel.unreadCount}</span>}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="list-block">
            <span className="tiny-label">Creator DMs</span>
            {workspace.directThreads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setSurface({ kind: "dm", id: thread.id })}
                className={clsx("nav-row", surface.kind === "dm" && surface.id === thread.id && "selected")}
              >
                <div>
                  <strong>{thread.title}</strong>
                  <small>{thread.participants.length} participants</small>
                </div>
                <div className="nav-meta">
                  <span>{thread.unreadCount}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="conversation-panel">
          <header className="thread-header">
            <div>
              <span>{surface.kind === "channel" ? workspace.category : "Direct message"}</span>
              <h2>{selectedChannel?.name || selectedDm?.title}</h2>
              <p>{selectedChannel?.topic || "Persistent creator-member thread with unread state and history."}</p>
            </div>
            <div className="thread-pills">
              {selectedChannel ? <TierBadge tier={selectedChannel.access} /> : null}
              <span className="thread-owner">Tencent RTC Chat SDK thread</span>
            </div>
          </header>

          <div className="summary-grid">
            <article>
              <span>Community promise</span>
              <p>{workspace.heroPitch}</p>
            </article>
            <article>
              <span>Membership state</span>
              <p>{membershipNote}</p>
            </article>
          </div>

          {premiumLocked ? (
            <div className="locked-room-card">
              <div className="panel-title">
                <LockKeyhole size={18} />
                Premium room locked
              </div>
              <p>
                This channel requires the <strong>{selectedChannel?.access.replace("-", " ")}</strong> tier.
                Upgrade the member account and the same Tencent RTC Chat SDK conversation can continue with full history.
              </p>
              <button onClick={() => upgradeTier(selectedChannel?.access || "backstage")} className="primary-action" disabled={isUpgradePending}>
                <CreditCard size={18} />
                {isUpgradePending ? "Unlocking..." : "Unlock this room"}
              </button>
            </div>
          ) : (
            <div className="messages">
              <div className="panel-title">
                <MessageCircleReply size={18} />
                Persistent messages
              </div>
              {currentMessages.map((message) => (
                <article key={message.id} className={clsx("message", `from-${message.author}`)}>
                  <div>
                    <strong>{message.name}</strong>
                    <span>{message.time}</span>
                  </div>
                  <p>{message.body}</p>
                </article>
              ))}
            </div>
          )}

          <div className="composer">
            <textarea
              value={composer}
              onChange={(event) => setComposer(event.target.value)}
              placeholder="Post as the signed-in member..."
            />
            <div>
              <button onClick={sendMessage} disabled={premiumLocked}>
                <SendHorizontal size={18} />
                Send message
              </button>
              <button onClick={activateProfile} className="secondary-action compact-action">
                <Crown size={18} />
                Complete onboarding
              </button>
            </div>
          </div>
        </section>

        <aside className="operations-panel">
          <div className="panel-title">
            <Crown size={18} />
            Creator Ops
          </div>

          <div className="ops-card">
            <span>Automation prompt</span>
            <textarea
              value={automationPrompt}
              onChange={(event) => setAutomationPrompt(event.target.value)}
              placeholder="Generate a creator announcement or moderation reminder..."
            />
            <button onClick={runCommunityAssistant} className="primary-action full-width" disabled={isAssistantPending}>
              <Bot size={18} />
              {isAssistantPending ? "Running assistant..." : "Run community assistant"}
            </button>
          </div>

          <div className="ops-card">
            <span>Membership tiers</span>
            <div className="tier-grid">
              {workspace.membershipTiers.map((tier: MembershipTier) => (
                <article key={tier.id} className={clsx("tier-card", viewer.tier === tier.id && "selected-tier")}>
                  <div>
                    <strong>{tier.name}</strong>
                    <small>{tier.priceLabel}</small>
                  </div>
                  <p>{tier.description}</p>
                  <div className="tags">
                    {tier.perks.map((perk) => (
                      <small key={perk}>{perk}</small>
                    ))}
                  </div>
                  {tier.id !== "free" ? (
                    <button onClick={() => upgradeTier(tier.id)} className="secondary-action compact-action" disabled={isUpgradePending}>
                      <CreditCard size={16} />
                      Upgrade
                    </button>
                  ) : null}
                </article>
              ))}
            </div>
          </div>

          <div className="ops-card">
            <span>Moderation queue</span>
            <div className="report-list">
              {workspace.reports.map((report) => (
                <article key={report.id} className="report-row">
                  <div>
                    <strong>{report.reason}</strong>
                    <small>
                      {report.reporter} {" -> "} {report.target}
                    </small>
                  </div>
                  <div className="report-actions">
                    <span className={clsx("report-status", `status-${report.status}`)}>{report.status}</span>
                    {report.status !== "resolved" ? (
                      <button onClick={() => resolveReport(report.id)} className="secondary-action compact-action">
                        <ShieldAlert size={16} />
                        Resolve
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="ops-card">
            <span>SDK state</span>
            <p>{sdkState}</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
