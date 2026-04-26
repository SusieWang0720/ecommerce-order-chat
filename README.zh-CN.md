# Creator Community Chat

构建一个完整的创作者社区应用：注册登录、频道聊天、创作者私信、审核后台，以及可选的付费会员。

这个项目是一个基于 **Tencent RTC Chat SDK** 的 Next.js 全栈 starter，适合创作者社群、粉丝社区、会员社区、兴趣社群等场景。它展示注册后的成员身份、公共频道、创作者公告、私信线程、审核流程，以及升级会员后仍然保持同一条会话历史。

本项目面向 **Tencent RTC Chat 永久免费能力** 构建。先看永久免费入口：[trtc.io/free-chat-api](https://trtc.io/free-chat-api)，然后到 [TRTC Console](https://console.trtc.io) 获取 `SDKAppID`。

## 这个项目解决什么问题

很多社交聊天 demo 只有一个聊天室，但真实社区产品还需要：

- 注册登录后的长期成员身份
- 公共频道和创作者公告
- 创作者与成员之间的私信
- 举报、审核、成员权限管理
- 会员升级后不丢失原来的聊天线程
- Tencent RTC Chat SDK 作为真正的持久消息层

这个 repo 的目标是让开发者看到一个完整社交产品的骨架，而不是一个空白 chat UI。

## Tencent RTC Chat SDK 在这里做什么

社区平台本身决定谁能加入、哪个会员等级能进入哪个房间。**Tencent RTC Chat SDK 承载真正的消息层。**

它在这个项目里负责：

- 社区频道消息
- 创作者与成员私信
- 持久线程历史
- 未读状态与再次进入体验
- 会员升级后的 premium room 会话连续性
- 通过服务端签发 `UserSig` 的生产接入路径

如果只是一个普通社区网站，不一定需要 chat SDK；当它变成有角色、有频道、有私信、有历史的实时社交产品时，Tencent RTC Chat SDK 就变得关键。

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
NEXT_PUBLIC_CREATOR_USER_ID=creator_nova
NEXT_PUBLIC_DEFAULT_MEMBER_USER_ID=member-alina
```

项目通过 `/api/usersig` 在服务端签发 `UserSig`，不要把 `SDKSecretKey` 放到前端。

## AI API 是否必须

不必须。

如果不配置 `AI_API_KEY`，项目会使用内置 deterministic community assistant，方便开发者立即跑通。需要真实模型输出时，可以配置任意 OpenAI-compatible provider。

## 付费系统是否必须

也不必须。

这个 starter 内置的是 mock membership upgrade 流程，所以本地无须 Stripe 就能演示“会员升级后解锁 premium room”。如果后续要接真实支付，可以把 `/api/membership` 换成你自己的 Stripe 或订阅后端。
