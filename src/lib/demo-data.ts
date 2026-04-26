import type { SupportTicket } from "./types";

export const supportTickets: SupportTicket[] = [
  {
    id: "ticket-1001",
    conversationId: "C2C_customer_maya_support_alex",
    customer: "Maya Chen",
    email: "maya@example.com",
    account: "Northstar Clinics",
    subject: "Billing code looks wrong after plan upgrade",
    status: "human-handoff",
    priority: "high",
    channel: "web",
    lastSeen: "3 min ago",
    aiSummary:
      "Customer upgraded plan, then saw a billing line item that does not match the quoted amount. She is frustrated and asks for a human review.",
    recommendedReply:
      "Acknowledge the billing concern, confirm the invoice ID, and tell Maya a human support specialist is reviewing the account in this same thread.",
    handoffReason: "Billing dispute with potential refund or account adjustment.",
    tags: ["billing", "plan-upgrade", "handoff"],
    messages: [
      {
        id: "m1",
        author: "customer",
        name: "Maya Chen",
        time: "09:31",
        body: "I upgraded yesterday, but today's invoice is higher than what your pricing page showed.",
      },
      {
        id: "m2",
        author: "ai-agent",
        name: "AI Support Agent",
        time: "09:31",
        body: "I can help check this. Please share the invoice ID while I summarize the account change for a specialist.",
      },
      {
        id: "m3",
        author: "system",
        name: "Tencent RTC Chat SDK",
        time: "09:32",
        body: "AI triage preserved in conversation C2C_customer_maya_support_alex. Human handoff requested.",
      },
    ],
  },
  {
    id: "ticket-1002",
    conversationId: "C2C_customer_leo_support_alex",
    customer: "Leo Park",
    email: "leo@example.com",
    account: "Copper & Pine",
    subject: "Need help importing order history",
    status: "ai-triage",
    priority: "medium",
    channel: "email",
    lastSeen: "18 min ago",
    aiSummary:
      "Customer is importing order history from Shopify and needs a CSV field mapping example.",
    recommendedReply:
      "Send the import template, ask which fields are failing, and offer to keep the same support thread open for screenshots.",
    handoffReason: "No handoff needed yet.",
    tags: ["import", "csv", "onboarding"],
    messages: [
      {
        id: "m1",
        author: "customer",
        name: "Leo Park",
        time: "09:14",
        body: "My Shopify order CSV import keeps failing. Which columns are required?",
      },
      {
        id: "m2",
        author: "ai-agent",
        name: "AI Support Agent",
        time: "09:15",
        body: "Required columns are order_id, customer_email, item_sku, quantity, and paid_at. You can upload a screenshot here if the error continues.",
      },
    ],
  },
  {
    id: "ticket-1003",
    conversationId: "GROUP_enterprise_support_workspace",
    customer: "Priya Shah",
    email: "priya@example.com",
    account: "Atlas Education",
    subject: "Enterprise SSO question",
    status: "waiting-customer",
    priority: "low",
    channel: "mobile",
    lastSeen: "1 hr ago",
    aiSummary:
      "Customer asks whether SAML SSO is available on the current plan and is waiting on internal domain details.",
    recommendedReply:
      "Ask for the identity provider and expected domain before routing to enterprise support.",
    handoffReason: "May need enterprise support if SAML setup begins.",
    tags: ["sso", "enterprise", "setup"],
    messages: [
      {
        id: "m1",
        author: "customer",
        name: "Priya Shah",
        time: "08:20",
        body: "Do you support SAML SSO for our school district?",
      },
      {
        id: "m2",
        author: "ai-agent",
        name: "AI Support Agent",
        time: "08:21",
        body: "Yes, SAML SSO is available on enterprise plans. Which identity provider will your team use?",
      },
    ],
  },
];
