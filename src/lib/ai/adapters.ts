import { createHash, randomUUID, timingSafeEqual } from "node:crypto";

import { db } from "@/lib/db";
import {
  canCapturePiiUnderPolicy,
  DEFAULT_CONSENT_POLICY_VERSION,
} from "@/lib/privacy/pii-policy";
import type {
  AILocale,
  KnowledgeExcerpt,
  PersistedConversationMessage,
  PublicProduct,
  StockItem,
  ToolDataAdapter,
} from "@/lib/ai/types";
import {
  AIDataUnavailableError,
  AIDataValidationError,
} from "@/lib/ai/types";

type ConversationContext = {
  currentPage?: string | null;
  productId?: string | null;
  selectedVariantId?: string | null;
  selectedColor?: string | null;
  selectedSize?: string | null;
  cart?: Array<{
    productId: string;
    variantId?: string | null;
    quantity: number;
  }>;
  entryPoint?: string | null;
  sessionId?: string | null;
  measurementConsent?: boolean;
};

function localeValue(locale: AILocale): "RU" | "KZ" {
  return locale === "kz" ? "KZ" : "RU";
}

function localized(
  locale: AILocale,
  ru: string,
  kz: string,
): string {
  return locale === "kz" ? kz : ru;
}

function iso(value: Date | null | undefined): string | null {
  return value instanceof Date ? value.toISOString() : null;
}

function normalizeEmail(value: string | null | undefined): string | null {
  const normalized = value?.trim().toLocaleLowerCase("en-US") ?? "";
  return normalized || null;
}

function normalizePhone(value: string | null | undefined): string | null {
  if (!value) return null;
  const prefix = value.trim().startsWith("+") ? "+" : "";
  const digits = value.replace(/\D/g, "");
  return digits ? `${prefix}${digits}` : null;
}

function stableHash(parts: Array<string | null | undefined>): string {
  return createHash("sha256")
    .update(parts.map((part) => part?.trim().toLocaleLowerCase("en-US") ?? "").join("\u001f"))
    .digest("hex");
}

function constantTimeEqual(left: string | null, right: string | null): boolean {
  if (!left || !right) return false;
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

function unknownRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function publicPrice(
  amountMinor: number | null,
  currency: string,
): { amountMinor: number; currency: string } | null {
  return typeof amountMinor === "number" ? { amountMinor, currency } : null;
}

async function publishedProductExists(productId: string): Promise<boolean> {
  const product = await db.product.findFirst({
    where: { id: productId, status: "ACTIVE", isDemo: false },
    select: { id: true },
  });
  return product !== null;
}

export const defaultAIDataAdapter: ToolDataAdapter = {
  async getPublishedProduct({ productId, slug, locale }): Promise<PublicProduct | null> {
    try {
      const product = await db.product.findFirst({
        where: {
          status: "ACTIVE",
          isDemo: false,
          ...(productId ? { id: productId } : {}),
          ...(slug ? { slug } : {}),
        },
        include: {
          variants: {
            where: { active: true, isDemo: false },
            orderBy: [{ colorCode: "asc" }, { sizeLabel: "asc" }],
          },
        },
      });

      if (!product) return null;

      return {
        id: product.id,
        slug: product.slug,
        name: localized(locale, product.nameRu, product.nameKz),
        description: localized(locale, product.descriptionRu, product.descriptionKz),
        category: product.category,
        price: publicPrice(product.priceMinor, product.currency),
        comparePrice: publicPrice(product.comparePriceMinor, product.currency),
        isPreorder: product.isPreorder,
        preorderEta: iso(product.preorderEta),
        variants: product.variants.map((variant) => {
          const availableQuantity = Math.max(0, variant.stock - variant.reservedStock);
          return {
            id: variant.id,
            colorCode: variant.colorCode,
            colorName: localized(locale, variant.colorNameRu, variant.colorNameKz),
            size: variant.sizeLabel,
            available: availableQuantity > 0,
            price: publicPrice(
              variant.priceMinor ?? product.priceMinor,
              product.currency,
            ),
          };
        }),
      };
    } catch {
      throw new AIDataUnavailableError();
    }
  },

  async getPublishedStock({
    productId,
    variantId,
    color,
    size,
    locale,
  }): Promise<StockItem[]> {
    try {
      if (!(await publishedProductExists(productId))) return [];

      const variants = await db.variant.findMany({
        where: {
          productId,
          active: true,
          isDemo: false,
          ...(variantId ? { id: variantId } : {}),
          ...(color
            ? {
                OR: [
                  { colorCode: color },
                  { colorNameRu: color },
                  { colorNameKz: color },
                ],
              }
            : {}),
          ...(size ? { sizeLabel: size } : {}),
        },
        orderBy: [{ colorCode: "asc" }, { sizeLabel: "asc" }],
      });

      return variants.map((variant) => {
        const availableQuantity = Math.max(0, variant.stock - variant.reservedStock);
        return {
          variantId: variant.id,
          productId: variant.productId,
          colorCode: variant.colorCode,
          colorName: localized(locale, variant.colorNameRu, variant.colorNameKz),
          size: variant.sizeLabel,
          available: availableQuantity > 0,
          availableQuantity,
          incomingEta: iso(variant.incomingEta),
          leadTimeDays: variant.leadTimeDays,
        };
      });
    } catch (error) {
      if (error instanceof AIDataUnavailableError) throw error;
      throw new AIDataUnavailableError();
    }
  },

  async getApprovedSizeRules(productId): Promise<unknown | null> {
    try {
      const product = await db.product.findFirst({
        where: { id: productId, status: "ACTIVE", isDemo: false },
        select: { fitProfileId: true },
      });
      if (!product?.fitProfileId) return null;

      const profile = await db.sizeProfile.findFirst({
        where: {
          id: product.fitProfileId,
          garmentMeasurementsApproved: true,
          isDemo: false,
        },
        select: { id: true, garmentMeasurementsApproved: true },
      });
      if (!profile) return null;

      const version = await db.sizeRuleVersion.findFirst({
        where: {
          sizeProfileId: profile.id,
          status: "APPROVED",
          isDemo: false,
        },
        orderBy: { version: "desc" },
        select: { version: true, rules: true },
      });
      if (!version) return null;

      const rules = unknownRecord(version.rules);
      if (!rules || !Array.isArray(rules.sizes)) return null;

      return {
        ...rules,
        version: String(version.version),
        status: "APPROVED",
        garmentMeasurementsApproved: true,
      };
    } catch {
      throw new AIDataUnavailableError();
    }
  },

  async searchPublishedKnowledge({
    query,
    locale,
    productId,
    scope,
    limit,
  }): Promise<KnowledgeExcerpt[]> {
    try {
      const items = await db.knowledgeItem.findMany({
        where: {
          language: localeValue(locale),
          status: { in: ["PUBLISHED", "APPROVED"] },
          isDemo: false,
          ...(scope ? { scope } : {}),
        },
        orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
        take: 80,
      });

      const terms = query
        .toLocaleLowerCase(locale === "kz" ? "kk-KZ" : "ru-RU")
        .split(/\s+/)
        .filter((term) => term.length > 1);

      return items
        .map((item) => {
          const haystack = `${item.title} ${item.content}`.toLocaleLowerCase(
            locale === "kz" ? "kk-KZ" : "ru-RU",
          );
          const termScore = terms.reduce(
            (score, term) => score + (haystack.includes(term) ? 1 : 0),
            0,
          );
          const productScore = productId && item.sourceId === productId ? 3 : 0;
          return { item, score: termScore + productScore };
        })
        .filter(({ score }) => score > 0 || terms.length === 0)
        .sort((left, right) => right.score - left.score)
        .slice(0, limit)
        .map(({ item }) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          scope: item.scope,
          version: item.version,
          publishedAt: iso(item.publishedAt),
        }));
    } catch {
      throw new AIDataUnavailableError();
    }
  },

  async createWaitlistLead(input): Promise<Record<string, unknown>> {
    try {
      const settings = await db.siteSettings.findUnique({
        where: { id: "default" },
        select: { consentPolicyVersion: true },
      });
      const policyVersion = settings?.consentPolicyVersion ?? DEFAULT_CONSENT_POLICY_VERSION;
      if (!canCapturePiiUnderPolicy({ policyVersion })) {
        throw new AIDataValidationError(
          "Waitlist capture is unavailable until the draft privacy policy is approved.",
        );
      }

      const productId = typeof input.productId === "string" ? input.productId : null;
      const variantId = typeof input.variantId === "string" ? input.variantId : null;
      if (productId && !(await publishedProductExists(productId))) {
        throw new AIDataValidationError("Unknown published product.");
      }
      if (variantId) {
        const variant = await db.variant.findFirst({
          where: {
            id: variantId,
            active: true,
            isDemo: false,
            ...(productId ? { productId } : {}),
            product: { status: "ACTIVE", isDemo: false },
          },
          select: { id: true, productId: true },
        });
        if (!variant) throw new AIDataValidationError("Unknown published variant.");
      }

      const email = normalizeEmail(typeof input.email === "string" ? input.email : null);
      const phone = normalizePhone(typeof input.phone === "string" ? input.phone : null);
      const purpose = String(input.contactPurpose ?? "product_question");
      const dedupKey = stableHash([
        productId,
        variantId,
        email,
        phone,
        purpose,
      ]);

      const existing = await db.waitlistLead.findUnique({
        where: { dedupKey },
        select: { id: true },
      });
      const lead = await db.waitlistLead.upsert({
        where: { dedupKey },
        create: {
          productId,
          variantId,
          color: typeof input.color === "string" ? input.color : null,
          size: typeof input.size === "string" ? input.size : null,
          city: typeof input.city === "string" ? input.city : null,
          name: String(input.name),
          email,
          phone,
          contactPurpose: purpose,
          serviceConsent: input.serviceConsent === true,
          restockConsent: input.restockConsent === true,
          marketingConsent: input.marketingConsent === true,
          policyVersion,
          language: input.locale === "kz" ? "KZ" : "RU",
          source: String(input.source),
          dedupKey,
        },
        // A repeated mutation with the same deduplication identity is a true
        // no-op. This makes retries safe and never upgrades consent implicitly.
        update: {},
        select: { id: true, submissionCount: true, createdAt: true },
      });

      return {
        waitlistId: lead.id,
        accepted: true,
        duplicate: existing !== null,
        createdAt: lead.createdAt.toISOString(),
      };
    } catch (error) {
      if (error instanceof AIDataValidationError) throw error;
      throw new AIDataUnavailableError();
    }
  },

  async createHandoffTicket(input): Promise<Record<string, unknown>> {
    try {
      const settings = await db.siteSettings.findUnique({
        where: { id: "default" },
        select: { consentPolicyVersion: true },
      });
      const policyVersion = settings?.consentPolicyVersion ?? DEFAULT_CONSENT_POLICY_VERSION;
      const requestedPolicyVersion = typeof input.policyVersion === "string"
        ? input.policyVersion.trim()
        : null;
      if (requestedPolicyVersion && requestedPolicyVersion !== policyVersion) {
        throw new AIDataValidationError("The consent policy version changed.");
      }

      const hasContact = [input.contactName, input.contactEmail, input.contactPhone]
        .some((value) => typeof value === "string" && value.trim().length > 0);
      const contactConsent = input.contactConsent === true;
      if (hasContact && !contactConsent) {
        throw new AIDataValidationError("Contact consent is required before storing contact details.");
      }
      if (hasContact && !canCapturePiiUnderPolicy({ policyVersion })) {
        throw new AIDataValidationError(
          "Contact capture is unavailable until the draft privacy policy is approved.",
        );
      }

      const idempotencyKey = String(input.idempotencyKey ?? "").trim();
      if (!idempotencyKey) {
        throw new AIDataValidationError("Idempotency key is required.");
      }

      const requestedConversationId =
        typeof input.conversationId === "string" ? input.conversationId : null;
      const requestedProductId = typeof input.productId === "string" ? input.productId : null;
      const requestedVariantId =
        typeof input.selectedVariantId === "string" ? input.selectedVariantId : null;

      const [conversation, product, variant] = await Promise.all([
        requestedConversationId
          ? db.conversation.findUnique({
              where: { id: requestedConversationId },
              select: { id: true },
            })
          : null,
        requestedProductId
          ? db.product.findFirst({
              where: { id: requestedProductId, status: "ACTIVE", isDemo: false },
              select: { id: true },
            })
          : null,
        requestedVariantId
          ? db.variant.findFirst({
              where: {
                id: requestedVariantId,
                active: true,
                isDemo: false,
                product: { status: "ACTIVE", isDemo: false },
              },
              select: { id: true },
            })
          : null,
      ]);

      const ticket = await db.handoffTicket.upsert({
        where: { idempotencyKey },
        create: {
          idempotencyKey,
          conversationId: conversation?.id ?? null,
          reason: String(input.reason),
          userQuestion: sanitizeMessageForPersistence(
            String(input.userQuestion),
            input.measurementConsent === true,
          ),
          productId: product?.id ?? null,
          selectedVariantId: variant?.id ?? null,
          aiConfidence:
            typeof input.aiConfidence === "string" ? input.aiConfidence : null,
          summary:
            typeof input.summary === "string"
              ? sanitizeMessageForPersistence(
                  input.summary,
                  input.measurementConsent === true,
                )
              : null,
          contactName:
            typeof input.contactName === "string" ? input.contactName : null,
          contactEmail: normalizeEmail(
            typeof input.contactEmail === "string" ? input.contactEmail : null,
          ),
          contactPhone: normalizePhone(
            typeof input.contactPhone === "string" ? input.contactPhone : null,
          ),
          contactConsent,
          policyVersion,
        },
        update: {},
        select: { id: true, status: true, createdAt: true },
      });

      return {
        handoffId: ticket.id,
        accepted: true,
        status: ticket.status,
        createdAt: ticket.createdAt.toISOString(),
      };
    } catch (error) {
      if (error instanceof AIDataValidationError) throw error;
      throw new AIDataUnavailableError();
    }
  },

  async getAuthorizedOrderStatus({ orderNumber, email, phone }) {
    try {
      const order = await db.order.findUnique({
        where: { number: orderNumber },
        select: {
          number: true,
          status: true,
          paymentStatus: true,
          fiscalStatus: true,
          currency: true,
          totalMinor: true,
          customerEmail: true,
          customerPhone: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!order) return { authorized: false as const, found: false };

      const emailMatches = constantTimeEqual(
        normalizeEmail(email),
        normalizeEmail(order.customerEmail),
      );
      const phoneMatches = constantTimeEqual(
        normalizePhone(phone),
        normalizePhone(order.customerPhone),
      );
      if (!emailMatches && !phoneMatches) {
        return { authorized: false as const, found: true };
      }

      return {
        authorized: true as const,
        order: {
          number: order.number,
          status: order.status,
          paymentStatus: order.paymentStatus,
          fiscalStatus: order.fiscalStatus,
          currency: order.currency,
          totalMinor: order.totalMinor,
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString(),
        },
      };
    } catch {
      throw new AIDataUnavailableError();
    }
  },
};

export async function resolveConversationId(input: {
  requestedId?: string | null;
  sessionId?: string | null;
}): Promise<string> {
  try {
    if (input.requestedId) {
      const matchingConversation = await db.conversation.findFirst({
        where: {
          id: input.requestedId,
          ...(input.sessionId ? { sessionId: input.sessionId } : {}),
        },
        select: { id: true },
      });
      if (matchingConversation) return matchingConversation.id;
    }

    if (input.sessionId) {
      const activeConversation = await db.conversation.findFirst({
        where: { sessionId: input.sessionId, status: "ACTIVE" },
        orderBy: { updatedAt: "desc" },
        select: { id: true },
      });
      if (activeConversation) return activeConversation.id;
    }
  } catch {
    // Conversation persistence is best-effort; inference remains available.
  }
  return randomUUID();
}

export async function loadConversationHistory(
  conversationId: string,
  limit = 12,
): Promise<PersistedConversationMessage[]> {
  try {
    const messages = await db.message.findMany({
      where: {
        conversationId,
        role: { in: ["USER", "ASSISTANT"] },
      },
      orderBy: { createdAt: "desc" },
      take: Math.min(Math.max(limit, 1), 20),
      select: { role: true, content: true },
    });
    return messages.reverse().map((message) => ({
      role: message.role === "USER" ? "user" : "assistant",
      content: message.content,
    }));
  } catch {
    return [];
  }
}

export function sanitizeMessageForPersistence(
  content: string,
  measurementConsent: boolean,
): string {
  const safeContactText = content
    .slice(0, 2_000)
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu, "[email redacted]")
    .replace(/(?:\+?\d[\d ()-]{7,}\d)/gu, "[phone redacted]")
    .replace(/(?:address|\u0430\u0434\u0440\u0435\u0441|\u043c\u0435\u043a\u0435\u043d\u0436\u0430\u0439)\s*[:=]\s*[^\n]{3,200}/giu, "[address redacted]")
    .replace(/(?:name|\u0438\u043c\u044f|\u0430\u0442\u044b)\s*[:=]\s*[^\n,;]{2,80}/giu, "[name redacted]");
  if (measurementConsent) return safeContactText;

  const measurementLabel =
    /(рост|вес|груд(?:ь|и)?|тал(?:ия|ии)?|б[её]д(?:ра|ер|ро)?|бой|салмақ|кеуде|бел|жамбас|height|weight|chest|waist|hips?)/giu;
  const labeledRedaction = safeContactText.replace(
    new RegExp(`${measurementLabel.source}\\s*[:=—-]?\\s*\\d{2,3}(?:[.,]\\d+)?\\s*(?:см|cm|кг|kg)?`, "giu"),
    "$1: [скрыто без согласия]",
  );
  return labeledRedaction.replace(
    /\b\d{2,3}(?:[.,]\d+)?\s*(?:см|cm|кг|kg)\b/giu,
    "[скрыто без согласия]",
  );
}

export async function persistConversationMessage(input: {
  conversationId: string;
  sessionId: string;
  locale: AILocale;
  role: "user" | "assistant";
  content: string;
  correlationId: string;
  context?: ConversationContext;
  measurementConsent: boolean;
}): Promise<boolean> {
  try {
    const safeContent = sanitizeMessageForPersistence(
      input.content,
      input.measurementConsent,
    );
    const now = new Date();
    const safeContext = input.context
      ? {
          currentPage: input.context.currentPage ?? null,
          productId: input.context.productId ?? null,
          selectedVariantId: input.context.selectedVariantId ?? null,
          selectedColor: input.context.selectedColor ?? null,
          selectedSize: input.context.selectedSize ?? null,
          cart: (input.context.cart ?? []).map((item) => ({
            productId: item.productId,
            variantId: item.variantId ?? null,
            quantity: item.quantity,
          })),
          entryPoint: input.context.entryPoint ?? null,
        }
      : undefined;

    await db.$transaction(async (transaction) => {
      await transaction.conversation.upsert({
        where: { id: input.conversationId },
        create: {
          id: input.conversationId,
          sessionId: input.sessionId,
          language: localeValue(input.locale),
          status: "ACTIVE",
          currentPage: input.context?.currentPage ?? null,
          entryPoint: input.context?.entryPoint ?? null,
          productId: input.context?.productId ?? null,
          context: safeContext,
          lastMessageAt: now,
        },
        update: {
          language: localeValue(input.locale),
          currentPage: input.context?.currentPage ?? undefined,
          entryPoint: input.context?.entryPoint ?? undefined,
          productId: input.context?.productId ?? undefined,
          context: safeContext,
          lastMessageAt: now,
        },
      });
      await transaction.message.create({
        data: {
          conversationId: input.conversationId,
          role: input.role === "user" ? "USER" : "ASSISTANT",
          content: safeContent,
          correlationId: input.correlationId,
        },
      });
    });
    return true;
  } catch {
    return false;
  }
}
