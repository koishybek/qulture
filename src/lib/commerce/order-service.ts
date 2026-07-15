import { randomBytes } from "node:crypto";

import type { Prisma } from "@generated/prisma/client";

import { db } from "@/lib/db";
import { fingerprintRequest, IdempotencyConflictError } from "@/lib/domain/idempotency";
import { localizedCommerceText } from "@/lib/commerce/locale";

import {
  DemoOrderValidationError,
  priceDemoOrder,
  type DemoBundleDefinition,
  type DemoPriceVariant,
} from "./demo-pricing";
import {
  createOwnershipToken,
  getOrderTokenSecret,
  hashOwnershipToken,
  tokenHashMatches,
  verifyOwnershipToken,
} from "./ownership-token";
import {
  demoOrderResponseSchema,
  type DemoOrderRequest,
  type DemoOrderResponse,
} from "./schemas";
import { developmentMockPaymentProvider } from "./providers";

const IDEMPOTENCY_SCOPE = "demo-order";

export class IdempotencyInProgressError extends Error {
  constructor() {
    super("The same order request is already being processed.");
    this.name = "IdempotencyInProgressError";
  }
}

export type CreateDemoOrderResult = {
  response: DemoOrderResponse;
  replayed: boolean;
};

export type DemoOrderStatusView = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  currency: string;
  createdAt: string;
  lines: Array<{ name: string; size: string; quantity: number }>;
};

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits ? `+${digits}` : "";
}

function createOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `Q-D${date}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

function readCompletedResponse(
  record: {
    fingerprint: string;
    status: string;
    response: unknown;
  },
  fingerprint: string,
): DemoOrderResponse | null {
  if (record.fingerprint !== fingerprint) {
    throw new IdempotencyConflictError();
  }
  if (record.status === "COMPLETED") {
    const parsed = demoOrderResponseSchema.safeParse(record.response);
    if (!parsed.success) throw new Error("Stored idempotency response is invalid");
    return parsed.data;
  }
  if (record.status === "IN_PROGRESS") {
    throw new IdempotencyInProgressError();
  }
  return null;
}

async function resolveServerPricing(input: DemoOrderRequest) {
  const requestedIds = [...new Set(input.lines.map((line) => line.variantId))];
  const [variants, bundles] = await Promise.all([
    db.variant.findMany({
      where: { id: { in: requestedIds }, isDemo: true, active: true },
      include: { product: true },
    }),
    db.bundle.findMany({
      where: { isDemo: true, status: "DRAFT" },
      include: { components: true },
    }),
  ]);

  const priceVariants: DemoPriceVariant[] = variants.flatMap((variant) => {
    if (!variant.product.isDemo || variant.product.status !== "DRAFT") return [];
    const unitPriceMinor = variant.priceMinor ?? variant.product.priceMinor;
    if (unitPriceMinor === null || variant.product.currency !== "KZT") return [];
    return [
      {
        id: variant.id,
        productId: variant.productId,
        productName: localizedCommerceText(
          input.locale,
          {
            en: variant.product.nameEn,
            ru: variant.product.nameRu,
            kz: variant.product.nameKz,
          },
          "QULTURE demo product",
        ),
        category: variant.product.category,
        sku: variant.sku,
        color: localizedCommerceText(
          input.locale,
          {
            en: variant.colorNameEn,
            ru: variant.colorNameRu,
            kz: variant.colorNameKz,
          },
          "Demo graphite",
        ),
        size: variant.sizeLabel,
        available: Math.max(0, variant.stock - variant.reservedStock),
        unitPriceMinor,
      },
    ];
  });
  const bundleDefinitions: DemoBundleDefinition[] = bundles.map((bundle) => ({
    id: bundle.id,
    discountType: bundle.discountType,
    discountValue: bundle.discountValue,
    components: bundle.components.map((component) => ({
      productId: component.productId,
      role: component.role,
    })),
  }));

  return priceDemoOrder(input.lines, priceVariants, bundleDefinitions);
}

export async function createDemoOrder(
  input: DemoOrderRequest,
  idempotencyKey: string,
): Promise<CreateDemoOrderResult> {
  const fingerprint = fingerprintRequest(input);
  const existing = await db.idempotencyRecord.findUnique({
    where: { scope_key: { scope: IDEMPOTENCY_SCOPE, key: idempotencyKey } },
  });
  if (existing) {
    const completed = readCompletedResponse(existing, fingerprint);
    if (completed) return { response: completed, replayed: true };
  }

  const [priced, settings] = await Promise.all([
    resolveServerPricing(input),
    db.siteSettings.findUnique({ where: { id: "default" } }),
  ]);
  const orderNumber = createOrderNumber();
  const payment = await developmentMockPaymentProvider.authorize({
    amountMinor: priced.totalMinor,
    currency: "KZT",
    orderReference: orderNumber,
    idempotencyKey,
    isTest: true,
  });
  if (payment.status !== "PAID") {
    throw new DemoOrderValidationError("Demo payment was not completed", "INVALID_PRICE");
  }
  const paymentStatus = "PAID" as const;
  const statusToken = createOwnershipToken(orderNumber, getOrderTokenSecret());
  const response: DemoOrderResponse = {
    orderNumber,
    statusToken,
    total: priced.totalMinor,
    currency: "KZT",
    status: "CONFIRMED",
    paymentStatus: "PAID",
  };
  const customerEmail = normalizeEmail(input.customer.email);
  const customerPhone = normalizePhone(input.customer.phone);

  return db.$transaction(async (transaction) => {
    const transactionRecord = await transaction.idempotencyRecord.findUnique({
      where: { scope_key: { scope: IDEMPOTENCY_SCOPE, key: idempotencyKey } },
    });
    if (transactionRecord) {
      const completed = readCompletedResponse(transactionRecord, fingerprint);
      if (completed) return { response: completed, replayed: true };
      await transaction.idempotencyRecord.delete({
        where: { id: transactionRecord.id },
      });
    }

    await transaction.idempotencyRecord.create({
      data: {
        scope: IDEMPOTENCY_SCOPE,
        key: idempotencyKey,
        fingerprint,
        status: "IN_PROGRESS",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });

    const order = await transaction.order.create({
      data: {
        number: orderNumber,
        statusTokenHash: hashOwnershipToken(statusToken),
        idempotencyKey,
        requestFingerprint: fingerprint,
        status: "CONFIRMED",
        paymentStatus,
        fiscalStatus: "NOT_REQUIRED",
        currency: "KZT",
        subtotalMinor: priced.subtotalMinor,
        discountMinor: priced.discountMinor,
        deliveryMinor: priced.deliveryMinor,
        totalMinor: priced.totalMinor,
        customerName: input.customer.name,
        customerEmail,
        customerPhone,
        city: input.delivery.city,
        address: input.delivery.address,
        deliveryMethod: input.delivery.method,
        customerComment: input.delivery.comment || null,
        paymentMethod: input.paymentMethod,
        paymentProvider: payment.provider,
        paymentReference: payment.reference,
        language: input.locale === "en" ? "EN" : input.locale === "kz" ? "KZ" : "RU",
        consentPolicyVersion:
          settings?.consentPolicyVersion ?? "2026-07-draft",
        termsAcceptedAt: new Date(),
        confirmedAt: new Date(),
        isTest: true,
        items: {
          create: priced.lines.map((line) => ({
            productId: line.productId,
            variantId: line.id,
            bundleId: line.bundleId,
            bundleGroupId: line.bundleGroupId,
            componentRole: line.componentRole,
            productName: line.productName,
            sku: line.sku,
            color: line.color,
            size: line.size,
            quantity: line.quantity,
            unitPriceMinor: line.unitPriceMinor,
            discountMinor: line.discountMinor,
            totalMinor: line.totalMinor,
          })),
        },
      },
    });

    await transaction.idempotencyRecord.update({
      where: { scope_key: { scope: IDEMPOTENCY_SCOPE, key: idempotencyKey } },
      data: {
        status: "COMPLETED",
        resourceId: order.id,
        response: response as Prisma.InputJsonValue,
      },
    });

    return { response, replayed: false };
  });
}

function contactMatches(
  proof: string,
  customerEmail: string | null,
  customerPhone: string | null,
): boolean {
  const trimmed = proof.trim();
  if (trimmed.includes("@")) {
    return Boolean(customerEmail && normalizeEmail(trimmed) === customerEmail);
  }
  return Boolean(customerPhone && normalizePhone(trimmed) === customerPhone);
}

export async function getDemoOrderStatus(
  orderNumber: string,
  proof: string,
): Promise<DemoOrderStatusView | null> {
  const order = await db.order.findFirst({
    where: { number: orderNumber, isTest: true },
    include: { items: { orderBy: { createdAt: "asc" } } },
  });
  if (!order) return null;

  let authorized = false;
  if (proof.startsWith("qot_") && order.statusTokenHash) {
    const payload = verifyOwnershipToken(proof, getOrderTokenSecret());
    authorized = Boolean(
      payload?.orderNumber === order.number &&
        tokenHashMatches(proof, order.statusTokenHash),
    );
  } else {
    authorized = contactMatches(proof, order.customerEmail, order.customerPhone);
  }
  if (!authorized) return null;

  return {
    orderNumber: order.number,
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: order.totalMinor,
    currency: order.currency,
    createdAt: order.createdAt.toISOString(),
    lines: order.items.map((item) => ({
      name: item.productName,
      size: item.size,
      quantity: item.quantity,
    })),
  };
}
