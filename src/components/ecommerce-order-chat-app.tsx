"use client";

import {
  Bot,
  CreditCard,
  KeyRound,
  MessageCircleReply,
  Package,
  Receipt,
  SendHorizontal,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
} from "lucide-react";
import { clsx } from "clsx";
import { useState, useTransition } from "react";
import { ecommerceOrderChatDemo } from "@/lib/demo-data";
import { initTencentRtcChat } from "@/lib/tencent-rtc-chat";
import type {
  CheckoutReply,
  CommerceAssistantReply,
  CommerceMessage,
  CommerceRole,
  CommerceUser,
  EcommerceWorkspace,
  PaymentProvider,
  SellerThread,
  ThreadStage,
} from "@/lib/types";

const chatMode = process.env.NEXT_PUBLIC_CHAT_MODE || "mock";
const sdkAppId = Number(process.env.NEXT_PUBLIC_TENCENT_SDK_APP_ID || 0);
const sellerUserId = process.env.NEXT_PUBLIC_STORE_SELLER_USER_ID || "seller-mira";
const defaultBuyerUserId = process.env.NEXT_PUBLIC_DEFAULT_BUYER_USER_ID || "buyer-lena";

type SurfaceState = {
  threadId: string;
};

function nowLabel() {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function roleLabel(role: CommerceRole) {
  return role === "seller" ? "Seller" : role === "ops" ? "Ops" : "Buyer";
}

function stageLabel(stage: ThreadStage) {
  return stage === "pre-sale"
    ? "Pre-sale"
    : stage === "payment-pending"
      ? "Payment pending"
      : stage === "paid"
        ? "Paid"
        : "Shipped";
}

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function RoleBadge({ user }: { user: CommerceUser }) {
  return <span className={clsx("role-badge", `role-${user.role}`)}>{roleLabel(user.role)}</span>;
}

function StageBadge({ stage }: { stage: ThreadStage }) {
  return <span className={clsx("stage-badge", `stage-${stage}`)}>{stageLabel(stage)}</span>;
}

function makeSystemMessage(body: string): CommerceMessage {
  return {
    id: `system-${Date.now()}`,
    author: "system",
    name: "Tencent RTC Chat SDK",
    time: nowLabel(),
    body,
  };
}

function addThreadMessage(
  threads: SellerThread[],
  threadId: string,
  message: CommerceMessage,
  stage?: ThreadStage,
) {
  return threads.map((thread) =>
    thread.id === threadId
      ? {
          ...thread,
          stage: stage || thread.stage,
          unreadCount: thread.unreadCount + 1,
          messages: [...thread.messages, message],
        }
      : thread,
  );
}

export function EcommerceOrderChatApp() {
  const [workspace, setWorkspace] = useState<EcommerceWorkspace>(ecommerceOrderChatDemo);
  const [viewerId] = useState(defaultBuyerUserId);
  const [surface, setSurface] = useState<SurfaceState>({
    threadId: ecommerceOrderChatDemo.threads[0].id,
  });
  const [selectedProductId, setSelectedProductId] = useState(ecommerceOrderChatDemo.products[0].id);
  const [composer, setComposer] = useState(
    "I like this lamp. Can you confirm the charcoal shade and whether Stripe checkout is available?",
  );
  const [automationPrompt, setAutomationPrompt] = useState(
    "Draft an order reply that confirms inventory and keeps shipping updates in the order thread after payment.",
  );
  const [sdkState, setSdkState] = useState(
    chatMode === "tencent" ? "Tencent mode ready to connect" : "Mock mode: no credentials required",
  );
  const [checkoutNote, setCheckoutNote] = useState(
    "Mock checkout works locally. Stripe is the recommended real payment path for the published repo.",
  );
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>("stripe");
  const [isAssistantPending, startAssistantTransition] = useTransition();
  const [isCheckoutPending, startCheckoutTransition] = useTransition();

  const viewer = workspace.users.find((user) => user.id === viewerId) || workspace.users[0];
  const selectedProduct = workspace.products.find((product) => product.id === selectedProductId) || workspace.products[0];
  const selectedThread = workspace.threads.find((thread) => thread.id === surface.threadId) || workspace.threads[0];
  const linkedOrder = selectedThread.orderId
    ? workspace.orders.find((order) => order.id === selectedThread.orderId) || null
    : workspace.orders.find((order) => order.productId === selectedThread.productId) || null;

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
      body: JSON.stringify({ userId: sellerUserId }),
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
    setSdkState(`Connected as ${payload.userId}. Product chat and order threads can sync through Tencent RTC Chat SDK.`);
  }

  function verifyBuyer() {
    setWorkspace((current) => ({
      ...current,
      users: current.users.map((user) =>
        user.id === viewer.id
          ? {
              ...user,
              status: "verified",
              unreadCount: user.unreadCount + 1,
            }
          : user,
      ),
      threads: addThreadMessage(
        current.threads,
        selectedThread.id,
        makeSystemMessage(`${viewer.name} completed account verification. Buyer identity now persists across pre-sale and post-purchase threads.`),
      ),
    }));

    setCheckoutNote("Buyer account verified. Product questions, payment confirmation, and shipment updates can stay attached to the same account and order thread.");
  }

  function sendMessage() {
    const body = composer.trim();
    if (!body) return;

    const message: CommerceMessage = {
      id: `buyer-${Date.now()}`,
      author: "buyer",
      name: viewer.name,
      time: nowLabel(),
      body,
    };

    setWorkspace((current) => ({
      ...current,
      threads: addThreadMessage(current.threads, selectedThread.id, message),
    }));

    setComposer("");
  }

  function runAssistant() {
    const prompt = automationPrompt.trim();
    if (!prompt) return;

    startAssistantTransition(async () => {
      const response = await fetch("/api/commerce-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          store: workspace.storeName,
          seller: workspace.sellerName,
        }),
      });
      const payload = (await response.json()) as CommerceAssistantReply & { error?: string };

      if (!response.ok) {
        setCheckoutNote(payload.error || "Order assistant failed.");
        return;
      }

      setWorkspace((current) => ({
        ...current,
        threads: addThreadMessage(
          addThreadMessage(
            current.threads,
            selectedThread.id,
            {
              id: `seller-${Date.now()}`,
              author: "seller",
              name: current.sellerName,
              time: nowLabel(),
              body: payload.sellerReply,
            },
          ),
          selectedThread.id,
          makeSystemMessage(payload.summary),
        ),
        sellerChecklist: [payload.opsAction, ...current.sellerChecklist.filter((item) => item !== payload.opsAction)].slice(0, 4),
      }));

      setAutomationPrompt("");
    });
  }

  function startCheckout() {
    startCheckoutTransition(async () => {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          productTitle: selectedProduct.title,
          amount: selectedProduct.price,
          paymentProvider,
          buyerName: viewer.name,
        }),
      });
      const payload = (await response.json()) as CheckoutReply & { error?: string };

      if (!response.ok) {
        setCheckoutNote(payload.error || "Checkout failed.");
        return;
      }

      const threadStage = payload.stage;
      const orderThreadId = payload.paymentStatus === "paid" ? `thread-${payload.orderId}` : selectedThread.id;
      const paidThread: SellerThread = {
        id: `thread-${payload.orderId}`,
        title: `Order #${payload.orderId.slice(-4)} · ${selectedProduct.title}`,
        productId: selectedProduct.id,
        orderId: payload.orderId,
        stage: payload.stage,
        unreadCount: 1,
        messages: [
          makeSystemMessage(payload.confirmation),
          {
            id: `seller-order-${Date.now()}`,
            author: "seller",
            name: workspace.sellerName,
            time: nowLabel(),
            body:
              payload.paymentStatus === "paid"
                ? "Payment received. I will keep packing, tracking, and post-purchase support in this same order thread."
                : "Payment started. I will keep this thread open while checkout is still pending.",
          },
        ],
      };

      setWorkspace((current) => ({
        ...current,
        orders: [
          {
            id: payload.orderId,
            productId: selectedProduct.id,
            buyerId: viewer.id,
            sellerId: selectedProduct.sellerId,
            stage: payload.stage,
            paymentProvider: payload.paymentProvider,
            paymentStatus: payload.paymentStatus,
            amount: payload.amount,
            note: payload.confirmation,
          },
          ...current.orders.filter((order) => order.id !== payload.orderId),
        ],
        threads:
          payload.paymentStatus === "paid"
            ? [paidThread, ...current.threads]
            : addThreadMessage(current.threads, selectedThread.id, makeSystemMessage(payload.confirmation), threadStage),
      }));

      setSurface({ threadId: orderThreadId });
      setCheckoutNote(payload.confirmation);
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
          <h1>Ecommerce works better when product chat survives payment.</h1>
          <p>
            Build a full-stack ecommerce app with buyer sign-up, product catalog, product chat,
            Stripe-ready checkout, and persistent order threads on top of Tencent RTC Chat SDK.
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
            <Store size={34} />
          </div>
          <h2>{workspace.storeName}</h2>
          <p>{workspace.coverTagline}</p>
          <span>{workspace.nextShipment}</span>
        </div>
      </section>

      <section className="stats-grid">
        <div>
          <strong>{currency(workspace.gmv)}</strong>
          <span>demo GMV</span>
        </div>
        <div>
          <strong>{workspace.products.length}</strong>
          <span>catalog products</span>
        </div>
        <div>
          <strong>{workspace.orders.length}</strong>
          <span>active orders</span>
        </div>
        <div>
          <strong>{workspace.threads.length}</strong>
          <span>active chat threads</span>
        </div>
      </section>

      <section className="workspace">
        <aside className="sidebar-panel">
          <div className="panel-title">
            <ShoppingBag size={18} />
            Storefront
          </div>

          <div className="viewer-card">
            <div>
              <span className="tiny-label">Signed in as</span>
              <h3>{viewer.name}</h3>
              <p>@{viewer.handle}</p>
            </div>
            <RoleBadge user={viewer} />
            <span className={clsx("account-badge", `status-${viewer.status}`)}>{viewer.status}</span>
          </div>

          <div className="list-block">
            <span className="tiny-label">Products</span>
            {workspace.products.map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  setSelectedProductId(product.id);
                  const matchingThread = workspace.threads.find((thread) => thread.productId === product.id);
                  if (matchingThread) {
                    setSurface({ threadId: matchingThread.id });
                  }
                }}
                className={clsx("nav-row", product.id === selectedProduct.id && "selected")}
              >
                <div>
                  <strong>{product.title}</strong>
                  <small>{product.category} · {currency(product.price)}</small>
                </div>
                <div className="nav-meta">
                  <span>{product.unreadCount}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="list-block">
            <span className="tiny-label">Chat threads</span>
            {workspace.threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setSurface({ threadId: thread.id })}
                className={clsx("nav-row", thread.id === selectedThread.id && "selected")}
              >
                <div>
                  <strong>{thread.title}</strong>
                  <small>{stageLabel(thread.stage)}</small>
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
              <span>{workspace.category}</span>
              <h2>{selectedThread.title}</h2>
              <p>{selectedProduct.summary}</p>
            </div>
            <div className="thread-pills">
              <StageBadge stage={selectedThread.stage} />
              <span className="thread-owner">Tencent RTC Chat SDK thread</span>
            </div>
          </header>

          <div className="summary-grid">
            <article>
              <span>Product</span>
              <p>
                {selectedProduct.title} · {currency(selectedProduct.price)} · {selectedProduct.inventory} in stock
              </p>
            </article>
            <article>
              <span>Checkout path</span>
              <p>{checkoutNote}</p>
            </article>
          </div>

          <div className="messages">
            <div className="panel-title">
              <MessageCircleReply size={18} />
              Persistent messages
            </div>
            {selectedThread.messages.map((message) => (
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
              value={composer}
              onChange={(event) => setComposer(event.target.value)}
              placeholder="Ask the seller about inventory, finish, shipping, or order details..."
            />
            <div>
              <button onClick={sendMessage}>
                <SendHorizontal size={18} />
                Send to seller
              </button>
              <button onClick={verifyBuyer} className="secondary-action compact-action">
                <Package size={18} />
                Verify buyer
              </button>
            </div>
          </div>
        </section>

        <aside className="operations-panel">
          <div className="panel-title">
            <Receipt size={18} />
            Order Ops
          </div>

          <div className="ops-card">
            <span>Checkout</span>
            <div className="checkout-box">
              <strong>{selectedProduct.title}</strong>
              <p>{currency(selectedProduct.price)}</p>
              <div className="payment-switches">
                <button
                  onClick={() => setPaymentProvider("stripe")}
                  className={clsx("secondary-action compact-action", paymentProvider === "stripe" && "selected-chip")}
                >
                  <CreditCard size={16} />
                  Stripe
                </button>
                <button
                  onClick={() => setPaymentProvider("mock")}
                  className={clsx("secondary-action compact-action", paymentProvider === "mock" && "selected-chip")}
                >
                  <Receipt size={16} />
                  Mock
                </button>
              </div>
              <button onClick={startCheckout} className="primary-action full-width" disabled={isCheckoutPending}>
                <CreditCard size={18} />
                {isCheckoutPending ? "Processing..." : "Start checkout"}
              </button>
            </div>
          </div>

          <div className="ops-card">
            <span>Order assistant</span>
            <textarea
              value={automationPrompt}
              onChange={(event) => setAutomationPrompt(event.target.value)}
              placeholder="Draft an order reply or post-purchase ops action..."
            />
            <button onClick={runAssistant} className="primary-action full-width" disabled={isAssistantPending}>
              <Bot size={18} />
              {isAssistantPending ? "Running assistant..." : "Run order assistant"}
            </button>
          </div>

          <div className="ops-card">
            <span>Order snapshot</span>
            {linkedOrder ? (
              <div className="order-card">
                <strong>{linkedOrder.id}</strong>
                <p>{currency(linkedOrder.amount)} · {linkedOrder.paymentProvider} · {linkedOrder.paymentStatus}</p>
                <StageBadge stage={linkedOrder.stage} />
                <p>{linkedOrder.note}</p>
              </div>
            ) : (
              <p>No linked order yet. The current thread is still pre-sale.</p>
            )}
          </div>

          <div className="ops-card">
            <span>Seller checklist</span>
            <div className="tags">
              {workspace.sellerChecklist.map((item) => (
                <small key={item}>{item}</small>
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
