export const TOOL_STATUSES = [
  "success",
  "validation_error",
  "unauthorized",
  "unavailable",
  "timeout",
] as const;

export type ToolStatus = (typeof TOOL_STATUSES)[number];

export const AI_TOOL_NAMES = [
  "get_product",
  "get_stock",
  "recommend_size",
  "compare_products",
  "build_bundle",
  "add_to_cart",
  "search_knowledge",
  "create_waitlist",
  "create_handoff",
  "get_order_status",
] as const;

export type AIToolName = (typeof AI_TOOL_NAMES)[number];
export type AILocale = "ru" | "kz";

export type ToolError = {
  code: string;
  message: string;
  issues?: Array<{ path: string; message: string }>;
};

export type ToolResult<T = unknown> = {
  status: ToolStatus;
  tool: AIToolName | "unknown";
  correlationId: string;
  data: T | null;
  error: ToolError | null;
};

export type ToolRuntimeContext = {
  correlationId: string;
  locale: AILocale;
  conversationId?: string;
  sessionId?: string;
  requestIdempotencyKey?: string;
  measurementConsent?: boolean;
  contactConsent?: boolean;
  policyVersion?: string;
};

export type PublicProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price: { amountMinor: number; currency: string } | null;
  comparePrice: { amountMinor: number; currency: string } | null;
  isPreorder: boolean;
  preorderEta: string | null;
  variants: Array<{
    id: string;
    colorCode: string;
    colorName: string;
    size: string;
    available: boolean;
    price: { amountMinor: number; currency: string } | null;
  }>;
};

export type StockItem = {
  variantId: string;
  productId: string;
  colorCode: string;
  colorName: string;
  size: string;
  available: boolean;
  availableQuantity: number;
  incomingEta: string | null;
  leadTimeDays: number | null;
};

export type KnowledgeExcerpt = {
  id: string;
  title: string;
  content: string;
  scope: string;
  version: number;
  publishedAt: string | null;
};

export type PersistedConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ToolDataAdapter = {
  getPublishedProduct(input: {
    productId: string | null;
    slug: string | null;
    locale: AILocale;
  }): Promise<PublicProduct | null>;
  getPublishedStock(input: {
    productId: string;
    variantId: string | null;
    color: string | null;
    size: string | null;
    locale: AILocale;
  }): Promise<StockItem[]>;
  getApprovedSizeRules(productId: string): Promise<unknown | null>;
  searchPublishedKnowledge(input: {
    query: string;
    locale: AILocale;
    productId: string | null;
    scope: string | null;
    limit: number;
  }): Promise<KnowledgeExcerpt[]>;
  createWaitlistLead(input: Record<string, unknown>): Promise<Record<string, unknown>>;
  createHandoffTicket(input: Record<string, unknown>): Promise<Record<string, unknown>>;
  getAuthorizedOrderStatus(input: {
    orderNumber: string;
    email: string | null;
    phone: string | null;
  }): Promise<
    | { authorized: false; found: boolean }
    | {
        authorized: true;
        order: {
          number: string;
          status: string;
          paymentStatus: string;
          fiscalStatus: string;
          currency: string;
          totalMinor: number;
          createdAt: string;
          updatedAt: string;
        };
      }
  >;
};

export class AIDataUnavailableError extends Error {
  constructor(message = "AI data source is unavailable") {
    super(message);
    this.name = "AIDataUnavailableError";
  }
}

export class AIDataValidationError extends Error {
  constructor(message = "AI data validation failed") {
    super(message);
    this.name = "AIDataValidationError";
  }
}

export class AIToolTimeoutError extends Error {
  constructor(message = "AI tool timed out") {
    super(message);
    this.name = "AIToolTimeoutError";
  }
}
