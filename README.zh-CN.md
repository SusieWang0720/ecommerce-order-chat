# Customer Support AI Handoff

构建一个 AI 客服转人工工作台：AI 先回复，复杂问题转人工，并且不打断原来的会话线程。

这个项目是一个基于 **Tencent RTC Chat SDK** 的 Next.js 全栈 starter，适合客服、SaaS、电商、教育、医疗预约等场景。它展示 AI triage、人工接手、持久消息历史、未读跟进，以及客户、AI、人工客服共享同一条会话。

本项目面向 **Tencent RTC Chat 永久免费能力** 构建。先看永久免费入口：[trtc.io/free-chat-api](https://trtc.io/free-chat-api)，然后到 [TRTC Console](https://console.trtc.io) 获取 `SDKAppID`。

## 这个项目解决什么问题

普通 AI 客服 demo 往往只展示“机器人回复”。真实客服团队还需要：

- AI 先回答常见问题
- AI 总结问题，方便人工客服接手
- 账单、退款、安全、投诉等高风险问题转人工
- 用户不用重复描述上下文
- 人工客服能看到完整历史、标签、优先级和推荐回复
- Tencent RTC Chat SDK 承载客户、AI、人工客服在同一条持久会话里的消息

## Tencent RTC Chat SDK 在这里做什么

AI 决定怎么回答。**Tencent RTC Chat SDK 承载客服会话本身。**

它在这个项目里负责：

- 持久客服会话
- 客户、AI、人工客服的同一线程消息
- 历史记录、未读状态、再次进入
- 一对一或群组客服会话
- 图片、订单截图、发票、日志等后续材料
- 通过服务端签发 `UserSig` 的生产接入路径

一个普通 AI chatbot 可以回答问题；当客服需要历史、转人工、角色和持续跟进时，Tencent RTC Chat SDK 就变得关键。

## 快速运行

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

默认是 mock mode，不需要 Tencent RTC Chat SDK 凭证，也不需要 AI API Key。

## 接入 Tencent RTC Chat SDK

1. 先打开 [Tencent RTC Chat 永久免费入口](https://trtc.io/free-chat-api)
2. 再进入 [TRTC Console](https://console.trtc.io)
3. 创建或选择 Tencent RTC Chat 应用
4. 获取 `SDKAppID`
5. `SDKSecretKey` 只能放在服务端
6. 复制 `.env.example` 为 `.env.local`
7. 填入：

```bash
NEXT_PUBLIC_CHAT_MODE=tencent
NEXT_PUBLIC_TENCENT_SDK_APP_ID=your_sdk_app_id
TENCENT_SDK_SECRET_KEY=your_server_only_secret_key
NEXT_PUBLIC_AGENT_USER_ID=support_alex
NEXT_PUBLIC_CUSTOMER_USER_ID=customer_maya
```

项目通过 `/api/usersig` 在服务端签发 `UserSig`，不要把 `SDKSecretKey` 放到前端。

## AI API 是否必须

不必须。

如果不配置 `AI_API_KEY`，项目会使用内置 deterministic demo triage agent，方便开发者立即跑通。需要真实模型输出时，可以配置任意 OpenAI-compatible provider。

