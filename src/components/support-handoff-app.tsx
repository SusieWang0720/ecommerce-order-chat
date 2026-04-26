"use client";

import {
  Bot,
  Headset,
  Inbox,
  KeyRound,
  MessageCircleReply,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import { useState, useTransition } from "react";
import { clsx } from "clsx";
import { supportTickets } from "@/lib/demo-data";
import { initTencentRtcChat } from "@/lib/tencent-rtc-chat";
import type { SupportMessage, SupportTicket, TriageReply } from "@/lib/types";

const chatMode = process.env.NEXT_PUBLIC_CHAT_MODE || "mock";
const sdkAppId = Number(process.env.NEXT_PUBLIC_TENCENT_SDK_APP_ID || 0);
const agentUserId = process.env.NEXT_PUBLIC_AGENT_USER_ID || "support_alex";

function StatusBadge({ status }: { status: SupportTicket["status"] }) {
  const label = {
    "ai-triage": "AI triage",
    "human-handoff": "Human handoff",
    "waiting-customer": "Waiting customer",
    resolved: "Resolved",
  }[status];

  return <span className={clsx("badge", `badge-${status}`)}>{label}</span>;
}

function PriorityDot({ priority }: { priority: SupportTicket["priority"] }) {
  return <span className={clsx("priority-dot", `priority-${priority}`)} />;
}

function makeAgentMessage(triage: TriageReply): SupportMessage {
  return {
    id: `msg-${Date.now()}`,
    author: triage.status === "human-handoff" ? "human-agent" : "ai-agent",
    name: triage.status === "human-handoff" ? "Handoff Queue" : "AI Support Agent",
    time: new Intl.DateTimeFormat("en", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date()),
    body: `${triage.reply} Handoff reason: ${triage.handoffReason}`,
  };
}

export function SupportHandoffApp() {
  const [tickets, setTickets] = useState(supportTickets);
  const [selectedId, setSelectedId] = useState(supportTickets[0].id);
  const [draft, setDraft] = useState("I was charged twice after upgrading. Please get a human to review this.");
  const [sdkState, setSdkState] = useState(
    chatMode === "tencent" ? "Tencent mode ready to connect" : "Mock mode: no credentials required",
  );
  const [isPending, startTransition] = useTransition();

  const selected = tickets.find((ticket) => ticket.id === selectedId) || tickets[0];

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
      body: JSON.stringify({ userId: agentUserId }),
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
    setSdkState(`Connected as ${payload.userId}. Support threads can sync through Tencent RTC Chat SDK.`);
  }

  function runTriage() {
    const message = draft.trim();
    if (!message) return;

    startTransition(async () => {
      const response = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: selected.customer,
          account: selected.account,
          message,
        }),
      });
      const triage = (await response.json()) as TriageReply;
      const newMessage = makeAgentMessage(triage);

      setTickets((current) =>
        current.map((ticket) =>
          ticket.id === selected.id
            ? {
                ...ticket,
                status: triage.status,
                priority: triage.priority,
                aiSummary: triage.summary,
                recommendedReply: triage.reply,
                handoffReason: triage.handoffReason,
                messages: [
                  ...ticket.messages,
                  {
                    id: `customer-${Date.now()}`,
                    author: "customer",
                    name: ticket.customer,
                    time: newMessage.time,
                    body: message,
                  },
                  newMessage,
                ],
              }
            : ticket,
        ),
      );
      setDraft("");
    });
  }

  function takeOver() {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === selected.id
          ? {
              ...ticket,
              status: "human-handoff",
              handoffReason: "Human agent manually accepted this ticket.",
              messages: [
                ...ticket.messages,
                {
                  id: `human-${Date.now()}`,
                  author: "human-agent",
                  name: "Alex from Support",
                  time: new Intl.DateTimeFormat("en", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date()),
                  body: "I am taking over from the AI assistant. I can see the full context and will continue in this same thread.",
                },
              ],
            }
          : ticket,
      ),
    );
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-card">
          <div className="eyebrow">
            <Sparkles size={16} />
            Tencent RTC Chat, free forever
          </div>
          <h1>AI support that hands off without losing the thread.</h1>
          <p>
            Build a customer support inbox where AI answers first, summarizes the issue, and
            hands off to a human in the same persistent Tencent RTC Chat SDK conversation.
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
        <div className="handoff-card">
          <div className="handoff-icon">
            <UsersRound size={34} />
          </div>
          <h2>Why this is not just a chatbot</h2>
          <p>
            AI can draft the first reply. Tencent RTC Chat SDK keeps the customer, bot, and
            human agent inside one durable thread with history, unread state, roles, and media.
          </p>
          <span>{sdkState}</span>
        </div>
      </section>

      <section className="stats-grid">
        <div>
          <strong>{tickets.length}</strong>
          <span>support tickets</span>
        </div>
        <div>
          <strong>{tickets.filter((ticket) => ticket.status === "human-handoff").length}</strong>
          <span>human handoffs</span>
        </div>
        <div>
          <strong>0</strong>
          <span>credentials needed in mock mode</span>
        </div>
      </section>

      <section className="workspace">
        <aside className="ticket-list">
          <div className="panel-title">
            <Inbox size={18} />
            Support Inbox
          </div>
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => setSelectedId(ticket.id)}
              className={clsx("ticket-row", ticket.id === selected.id && "selected")}
            >
              <div className="ticket-meta">
                <PriorityDot priority={ticket.priority} />
                <strong>{ticket.customer}</strong>
                <small>{ticket.lastSeen}</small>
              </div>
              <span>{ticket.account}</span>
              <p>{ticket.subject}</p>
              <StatusBadge status={ticket.status} />
            </button>
          ))}
        </aside>

        <section className="ticket-thread">
          <header className="thread-header">
            <div>
              <span>{selected.account}</span>
              <h2>{selected.subject}</h2>
              <p>{selected.customer} · {selected.email}</p>
            </div>
            <StatusBadge status={selected.status} />
          </header>

          <div className="summary-grid">
            <article>
              <span>AI summary</span>
              <p>{selected.aiSummary}</p>
            </article>
            <article>
              <span>Recommended reply</span>
              <p>{selected.recommendedReply}</p>
            </article>
          </div>

          <div className="messages">
            <div className="panel-title">
              <MessageCircleReply size={18} />
              Persistent support thread
            </div>
            {selected.messages.map((message) => (
              <article key={message.id} className={clsx("message", `from-${message.author}`)}>
                <div>
                  <strong>{message.name}</strong>
                  <span>{message.time}</span>
                </div>
                <p>{message.body}</p>
              </article>
            ))}
          </div>

          <div className="composer">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Paste a new customer message, then let AI triage it..."
            />
            <div>
              <button onClick={runTriage} disabled={isPending}>
                <Bot size={18} />
                {isPending ? "Triaging..." : "AI triage"}
              </button>
              <button onClick={takeOver} className="takeover">
                <UserRoundCheck size={18} />
                Human takeover
              </button>
            </div>
          </div>
        </section>

        <aside className="operations">
          <div className="panel-title">
            <Headset size={18} />
            Handoff Ops
          </div>
          <div className="ops-card">
            <span>Handoff reason</span>
            <p>{selected.handoffReason}</p>
          </div>
          <div className="ops-card">
            <span>Conversation owner</span>
            <p>Tencent RTC Chat SDK</p>
            <code>{selected.conversationId}</code>
          </div>
          <div className="ops-card">
            <span>Tags</span>
            <div className="tags">
              {selected.tags.map((tag) => (
                <small key={tag}>{tag}</small>
              ))}
            </div>
          </div>
          <div className="ops-card">
            <span>Production path</span>
            <p>Use `/api/usersig` to issue server-side UserSig, then sync customer, AI, and human replies into the same conversation.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
