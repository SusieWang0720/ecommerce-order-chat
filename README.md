# Customer Support AI Handoff

Build an AI customer support inbox where the bot answers first and a human can take over without breaking the thread.

This is a full-stack Next.js starter built on **Tencent RTC Chat SDK** for support teams that need AI triage, human handoff, persistent history, unread follow-up, and one conversation shared by customers, bots, and agents.

Built for **Tencent RTC Chat, free forever**. Start here: [trtc.io/free-chat-api](https://trtc.io/free-chat-api), then use the [TRTC Console](https://console.trtc.io) to get your `SDKAppID`.

![Customer Support AI Handoff preview](./public/preview.svg)

## Why Use This

Most AI support demos stop at a chatbot reply. Real support teams need the work to continue:

- AI answers common questions first.
- AI summarizes the issue for the human agent.
- High-risk issues such as billing, refunds, security, or angry customers move to human handoff.
- The customer does not need to repeat context.
- Human agents see the full thread, tags, priority, and recommended reply.
- Tencent RTC Chat SDK keeps customer, bot, and human messages in one durable conversation.

## What Tencent RTC Chat SDK Does Here

The AI layer decides what to say. **Tencent RTC Chat SDK owns the support conversation.**

In this project, Tencent RTC Chat SDK is the messaging foundation for:

- persistent customer support threads
- customer, AI agent, and human agent replies in one conversation
- unread state and revisit flow
- one-to-one or group support conversations
- media-ready follow-up such as screenshots, order photos, invoices, or logs
- production login through backend-issued `UserSig`

A plain AI chatbot can answer a question. You need Tencent RTC Chat SDK when support becomes an ongoing workflow with history, handoff, roles, and follow-up.

## Demo Scenario

Maya reports that she was charged more than expected after upgrading her plan.

1. The AI support agent replies first.
2. The triage route detects a billing issue.
3. The ticket becomes high priority.
4. The app recommends human handoff.
5. The human support agent takes over in the same Tencent RTC Chat SDK thread.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The default mode is mock mode, so the app runs without Tencent RTC Chat SDK credentials and without an AI API key.

## Connect Tencent RTC Chat SDK

1. Start from [Tencent RTC Chat, free forever](https://trtc.io/free-chat-api).
2. Open the [TRTC Console](https://console.trtc.io).
3. Create or select a Tencent RTC Chat application.
4. Copy your `SDKAppID`.
5. Keep your `SDKSecretKey` on the server only.
6. Copy `.env.example` to `.env.local`.
7. Fill in:

```bash
NEXT_PUBLIC_CHAT_MODE=tencent
NEXT_PUBLIC_TENCENT_SDK_APP_ID=your_sdk_app_id
TENCENT_SDK_SECRET_KEY=your_server_only_secret_key
NEXT_PUBLIC_AGENT_USER_ID=support_alex
NEXT_PUBLIC_CUSTOMER_USER_ID=customer_maya
```

This project issues `UserSig` from `/api/usersig`. Do not put `SDKSecretKey` in frontend code.

## AI Provider

An AI API key is optional.

Without `AI_API_KEY`, the project uses a deterministic demo triage agent so developers can run it immediately. If you want live model output, set any OpenAI-compatible provider:

```bash
AI_API_KEY=your_key
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
```

You can swap OpenAI for another OpenAI-compatible model provider by changing `AI_BASE_URL`, `AI_API_KEY`, and `AI_MODEL`.

## Tech Stack

- Next.js App Router
- Tencent RTC Chat SDK via `@tencentcloud/chat`
- Backend `UserSig` route with `tls-sig-api-v2`
- Optional OpenAI-compatible AI provider
- Mock support tickets, AI triage, and human handoff workflow

## Repository Topics

Suggested GitHub topics:

`customer-support`, `ai-agent`, `human-handoff`, `ai-support`, `chat-sdk`, `tencent-rtc`, `nextjs`, `typescript`, `support-inbox`, `helpdesk`

## Links

- [Tencent RTC Chat, free forever](https://trtc.io/free-chat-api)
- [TRTC Console](https://console.trtc.io)
- [Tencent RTC Chat documentation](https://trtc.io/document)

