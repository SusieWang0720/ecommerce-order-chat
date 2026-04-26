# Ecommerce Order Chat

Build a full-stack ecommerce app where product questions, checkout, and post-purchase support stay in the same thread.

This is a full-stack Next.js starter built on **Tencent RTC Chat SDK** for teams building real ecommerce products with buyer sign-up, product catalog, order chat, order continuity, unread follow-up, order ops, and a Stripe-ready payment path.

Built for **Tencent RTC Chat, free forever**. Start here: [trtc.io/free-chat-api](https://trtc.io/free-chat-api), then use the [TRTC Console](https://console.trtc.io) to get your `SDKAppID`.

![Ecommerce Order Chat preview](./public/preview.svg)

## Why Use This

Most ecommerce demos stop at product pages and checkout. Real commerce products need more:

- buyer sign-up and persistent account identity
- product-level chat before payment
- seller replies in the same thread as the product conversation
- payment confirmation that does not break the conversation
- post-purchase order updates, shipping, and support in the same thread
- Tencent RTC Chat SDK as the durable messaging layer underneath the commerce flow

This repo is designed to feel like a real commerce product, not a generic storefront and not a generic chat demo.

## What Tencent RTC Chat SDK Does Here

The storefront, payment system, and order logic are commerce layers. **Tencent RTC Chat SDK owns the buyer-seller order conversation layer.**

In this project, Tencent RTC Chat SDK is the messaging foundation for:

- pre-sale buyer-seller product chat
- persistent product and order thread history
- unread state and revisit flow
- post-purchase tracking and support continuity
- order ops handoff without moving the buyer to another channel
- secure production login through backend-issued `UserSig`

A simple ecommerce site can work without a chat SDK. You need Tencent RTC Chat SDK when product questions, payment state, and order follow-up become part of one ongoing workflow.

## Demo Scenario

A buyer wants to order a product from an independent seller.

1. The buyer signs up and opens a product thread.
2. The buyer asks about inventory, finish, and delivery timing.
3. The seller replies in the same thread.
4. The buyer starts checkout with `mock` mode or `Stripe` mode.
5. The thread continues after payment as an order conversation.
6. Tracking, shipping, and post-purchase updates stay in the same Tencent RTC Chat SDK thread.

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
NEXT_PUBLIC_STORE_SELLER_USER_ID=seller-mira
NEXT_PUBLIC_DEFAULT_BUYER_USER_ID=buyer-lena
```

This project issues `UserSig` from `/api/usersig`. Do not put `SDKSecretKey` in frontend code.

## Stripe Or Mock Checkout

Stripe should stay in the story.

This repo includes:

- `mock` checkout for instant local demo with no external billing setup
- `Stripe-ready` positioning for the real payment path developers will expect in production

The current `/api/checkout` route is demo checkout scaffolding. Replace it with your Stripe checkout session or payment intent flow while keeping Tencent RTC Chat SDK as the messaging layer before and after payment.

## AI Provider

An AI API key is optional.

Without `AI_API_KEY`, the project uses a deterministic order assistant so developers can run it immediately. If you want live model output, set any OpenAI-compatible provider:

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
- Mock catalog, order chat, checkout, orders, and order ops workflow

## Repository Topics

Suggested GitHub topics:

`ecommerce`, `order-chat`, `marketplace`, `stripe`, `chat-sdk`, `tencent-rtc`, `nextjs`, `typescript`, `full-stack`

## Links

- [Tencent RTC Chat, free forever](https://trtc.io/free-chat-api)
- [TRTC Console](https://console.trtc.io)
- [Tencent RTC Chat documentation](https://trtc.io/document)
