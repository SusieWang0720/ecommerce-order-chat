export type CommerceRole = "buyer" | "seller" | "ops";

export type AccountStatus = "signed-up" | "verified";

export type ThreadStage = "pre-sale" | "payment-pending" | "paid" | "shipped";

export type PaymentProvider = "mock" | "stripe";

export type PaymentStatus = "pending" | "paid";

export type CommerceMessageAuthor = "buyer" | "seller" | "ops" | "system";

export type CommerceMessage = {
  id: string;
  author: CommerceMessageAuthor;
  name: string;
  time: string;
  body: string;
};

export type CommerceUser = {
  id: string;
  name: string;
  handle: string;
  role: CommerceRole;
  status: AccountStatus;
  bio: string;
  unreadCount: number;
};

export type Product = {
  id: string;
  title: string;
  category: string;
  price: number;
  inventory: number;
  sellerId: string;
  summary: string;
  unreadCount: number;
};

export type CartLine = {
  id: string;
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  stage: ThreadStage;
  paymentProvider: PaymentProvider;
  paymentStatus: PaymentStatus;
  amount: number;
  note: string;
};

export type SellerThread = {
  id: string;
  title: string;
  productId: string;
  orderId?: string;
  stage: ThreadStage;
  unreadCount: number;
  messages: CommerceMessage[];
};

export type EcommerceWorkspace = {
  storeId: string;
  storeName: string;
  category: string;
  sellerName: string;
  coverTagline: string;
  heroPitch: string;
  nextShipment: string;
  gmv: number;
  users: CommerceUser[];
  products: Product[];
  cart: CartLine[];
  threads: SellerThread[];
  orders: Order[];
  sellerChecklist: string[];
};

export type CommerceAssistantReply = {
  summary: string;
  sellerReply: string;
  opsAction: string;
};

export type CheckoutReply = {
  orderId: string;
  stage: ThreadStage;
  paymentProvider: PaymentProvider;
  paymentStatus: PaymentStatus;
  amount: number;
  confirmation: string;
};
