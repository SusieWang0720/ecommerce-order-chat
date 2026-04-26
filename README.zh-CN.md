# Ecommerce Seller Chat

构建一个完整电商应用：买家注册、商品详情、卖家聊天、支付路径，以及支付后继续沿用同一条订单线程。

这个项目是一个基于 **Tencent RTC Chat SDK** 的 Next.js 全栈 starter，适合电商、独立卖家、精品商店、平台型 marketplace 等场景。它展示买家身份、商品咨询、卖家回复、支付确认、订单跟进，以及售后消息都在同一条持续会话里完成。

本项目面向 **Tencent RTC Chat 永久免费能力** 构建。先看永久免费入口：[trtc.io/free-chat-api](https://trtc.io/free-chat-api)，然后到 [TRTC Console](https://console.trtc.io) 获取 `SDKAppID`。

## 这个项目解决什么问题

很多电商 demo 只展示商品页和 checkout，但真实电商产品还需要：

- 买家注册后的长期身份
- 商品详情页上的买卖双方聊天
- 支付前咨询与支付后订单跟进保持连续
- 卖家在同一条线程里发送发货和售后更新
- 订单、支付、物流与会话映射到同一个业务对象
- Tencent RTC Chat SDK 作为真正的持久消息层

这个 repo 的目标是让开发者看到一个真实电商聊天产品，而不是一个孤立 storefront，也不是一个孤立 chat widget。

## Tencent RTC Chat SDK 在这里做什么

商品、支付、订单本身属于电商业务层。**Tencent RTC Chat SDK 承载买家和卖家的会话层。**

它在这个项目里负责：

- 商品咨询线程
- 支付前后的持久历史
- 未读状态与再次进入体验
- 订单发货和售后在同一线程里的连续性
- 卖家运营与订单会话映射
- 通过服务端签发 `UserSig` 的生产接入路径

如果只是一个简单商品站，不一定需要 chat SDK；当商品咨询、支付状态、订单跟进成为连续工作流时，Tencent RTC Chat SDK 就很关键。

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
NEXT_PUBLIC_SELLER_USER_ID=seller_mira
NEXT_PUBLIC_DEFAULT_BUYER_USER_ID=buyer-lena
```

项目通过 `/api/usersig` 在服务端签发 `UserSig`，不要把 `SDKSecretKey` 放到前端。

## Stripe 要不要保留

要保留。

这里更合理的做法不是把 repo 名字写成 checkout，而是在产品能力里保留 `Stripe-ready`：

- 本地默认用 mock checkout，方便零门槛演示
- 真正生产接入时，推荐替换成 Stripe checkout session 或 payment intent
- Tencent RTC Chat SDK 继续负责支付前后的会话连续性

## AI API 是否必须

不必须。

如果不配置 `AI_API_KEY`，项目会使用内置 deterministic seller assistant，方便开发者立即跑通。需要真实模型输出时，可以配置任意 OpenAI-compatible provider。
