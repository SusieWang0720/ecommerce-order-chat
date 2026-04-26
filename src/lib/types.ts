export type TicketStatus = "ai-triage" | "human-handoff" | "waiting-customer" | "resolved";

export type TicketPriority = "low" | "medium" | "high";

export type MessageAuthor = "customer" | "ai-agent" | "human-agent" | "system";

export type SupportMessage = {
  id: string;
  author: MessageAuthor;
  name: string;
  time: string;
  body: string;
};

export type SupportTicket = {
  id: string;
  conversationId: string;
  customer: string;
  email: string;
  account: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  channel: "web" | "mobile" | "email";
  lastSeen: string;
  aiSummary: string;
  recommendedReply: string;
  handoffReason: string;
  tags: string[];
  messages: SupportMessage[];
};

export type TriageReply = {
  status: TicketStatus;
  priority: TicketPriority;
  summary: string;
  reply: string;
  handoffReason: string;
};
