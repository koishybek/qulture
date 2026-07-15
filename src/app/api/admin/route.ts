import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@generated/prisma/client";
import { hasAdminSession } from "@/lib/admin/auth";
import { loadAdminDashboard } from "@/lib/admin/data";
import { canPersistDemoModeSetting } from "@/lib/commerce/demo-gate";
import { db } from "@/lib/db";
import { errorResponse, isSameOrigin, jsonError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const slug = z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const optionalText = z.string().trim().max(10_000).optional().nullable();
const optionalLongText = z.string().trim().max(50_000).optional().nullable();
const jsonValue = z.unknown().transform((value, context) => {
  try {
    return (typeof value === "string" ? JSON.parse(value) : value) as Prisma.InputJsonValue;
  } catch {
    context.addIssue({ code: "custom", message: "Invalid JSON" });
    return z.NEVER;
  }
});

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("settings.save"),
    siteMode: z.enum(["PRE_LAUNCH", "COMMERCE"]),
    demoMode: z.boolean(),
    catalogVisible: z.boolean(),
    controlledPreview: z.boolean(),
    defaultLocale: z.enum(["EN", "RU", "KZ"]),
    aiTeaserEnabled: z.boolean(),
    aiTeaserDelayMs: z.number().int().min(0).max(60_000),
    aiTeaserFrequency: z.string().trim().min(1).max(80),
    consentPolicyVersion: z.string().trim().min(1).max(80),
    sectionVisibility: jsonValue,
    homeContent: jsonValue,
    brandAssets: jsonValue,
    paletteTokens: jsonValue,
    typographySettings: jsonValue,
    legalLinks: jsonValue,
    aiQuickActions: jsonValue,
  }),
  z.object({
    action: z.literal("product.save"),
    id: z.string().optional(),
    slug,
    nameRu: z.string().trim().min(2).max(180),
    nameKz: z.string().trim().min(2).max(180),
    nameEn: optionalText,
    descriptionRu: z.string().trim().min(2).max(10_000),
    descriptionKz: z.string().trim().min(2).max(10_000),
    descriptionEn: optionalText,
    category: z.string().trim().min(2).max(80),
    status: z.enum(["DRAFT", "PREVIEW", "COMING_SOON", "ACTIVE", "ARCHIVED"]),
    priceMinor: z.number().int().nonnegative().nullable(),
    comparePriceMinor: z.number().int().nonnegative().nullable(),
    isPreorder: z.boolean(),
    preorderEta: z.string().datetime().nullable(),
    isDemo: z.boolean(),
    media: jsonValue,
    technologyTags: jsonValue,
    careRu: optionalText,
    careKz: optionalText,
    careEn: optionalText,
  }),
  z.object({
    action: z.literal("variant.save"),
    id: z.string().optional(),
    productId: z.string().min(1),
    colorCode: z.string().trim().min(1).max(80),
    colorNameRu: z.string().trim().min(1).max(120),
    colorNameKz: z.string().trim().min(1).max(120),
    colorNameEn: optionalText,
    sizeLabel: z.string().trim().min(1).max(40),
    sku: z.string().trim().min(2).max(100),
    stock: z.number().int().nonnegative(),
    reservedStock: z.number().int().nonnegative(),
    incomingEta: z.string().datetime().nullable(),
    leadTimeDays: z.number().int().nonnegative().nullable(),
    active: z.boolean(),
    isDemo: z.boolean(),
    priceMinor: z.number().int().nonnegative().nullable(),
    media: jsonValue,
  }),
  z.object({
    action: z.literal("collection.save"), id: z.string().optional(), slug,
    nameRu: z.string().trim().min(2).max(180), nameKz: z.string().trim().min(2).max(180), nameEn: optionalText,
    descriptionRu: optionalText, descriptionKz: optionalText, descriptionEn: optionalText,
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]), isDemo: z.boolean(), sortOrder: z.number().int(),
  }),
  z.object({
    action: z.literal("bundle.save"), id: z.string().optional(), slug,
    nameRu: z.string().trim().min(2).max(180), nameKz: z.string().trim().min(2).max(180), nameEn: optionalText,
    descriptionRu: optionalText, descriptionKz: optionalText, descriptionEn: optionalText,
    status: z.enum(["DRAFT", "PREVIEW", "COMING_SOON", "ACTIVE", "ARCHIVED"]),
    discountType: z.enum(["PERCENTAGE", "FIXED"]), discountValue: z.number().int().nonnegative(),
    isDemo: z.boolean(), topProductId: z.string().optional(), bottomProductId: z.string().optional(), media: jsonValue,
  }),
  z.object({
    action: z.literal("sizeProfile.save"), id: z.string().optional(), slug,
    name: z.string().trim().min(2).max(180), fitType: z.string().trim().min(1).max(80),
    sizeChart: jsonValue, garmentMeasurements: jsonValue, garmentMeasurementsApproved: z.boolean(), isDemo: z.boolean(),
  }),
  z.object({
    action: z.literal("sizeRule.create"), sizeProfileId: z.string().min(1),
    rules: jsonValue, notes: optionalText, status: z.enum(["DRAFT", "APPROVED", "ARCHIVED"]), isDemo: z.boolean(),
  }),
  z.object({
    action: z.literal("knowledge.save"), id: z.string().optional(),
    language: z.enum(["RU", "KZ", "EN"]), scope: z.string().trim().min(1).max(120),
    title: z.string().trim().min(2).max(240), content: z.string().trim().min(2).max(30_000),
    sourceOwner: z.string().trim().min(2).max(180), sourceId: z.string().trim().min(2).max(180),
    status: z.enum(["DRAFT", "APPROVED", "PUBLISHED", "ARCHIVED"]),
    reviewDate: z.string().datetime().nullable(), version: z.number().int().positive(), isDemo: z.boolean(),
  }),
  z.object({
    action: z.literal("journal.save"), id: z.string().optional(), slug,
    titleRu: z.string().trim().min(2).max(240), titleKz: z.string().trim().min(2).max(240), titleEn: optionalText,
    excerptRu: z.string().trim().min(2).max(1000), excerptKz: z.string().trim().min(2).max(1000), excerptEn: optionalText,
    contentRu: z.string().trim().min(2).max(50_000), contentKz: z.string().trim().min(2).max(50_000), contentEn: optionalLongText,
    coverImage: optionalText, author: optionalText,
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]), isDemo: z.boolean(),
  }),
  z.object({
    action: z.literal("translation.save"), namespace: z.string().trim().min(1).max(100),
    key: z.string().trim().min(1).max(180), locale: z.enum(["RU", "KZ", "EN"]),
    value: z.string().trim().min(1).max(20_000), status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  }),
  z.object({
    action: z.literal("contentPage.save"), slug, locale: z.enum(["RU", "KZ", "EN"]),
    title: z.string().trim().min(2).max(240), excerpt: optionalText, content: z.string().trim().min(2).max(50_000),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]), requiresApproval: z.boolean(),
    seoTitle: z.string().trim().max(240).optional().nullable(),
    seoDescription: z.string().trim().max(1000).optional().nullable(),
  }),
  z.object({ action: z.literal("handoff.status"), id: z.string().min(1), status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]) }),
]);

async function audit(action: string, entityType: string, entityId: string | null, before: unknown, after: unknown) {
  await db.auditLog.create({
    data: {
      action,
      entityType,
      entityId,
      before: before == null ? undefined : before as Prisma.InputJsonValue,
      after: after == null ? undefined : after as Prisma.InputJsonValue,
    },
  });
}

export async function GET() {
  if (!await hasAdminSession()) return jsonError("unauthorized", 401);
  return NextResponse.json(await loadAdminDashboard());
}

export async function POST(request: Request) {
  if (!await hasAdminSession()) return jsonError("unauthorized", 401);
  if (!isSameOrigin(request)) return jsonError("invalid_origin", 403);

  try {
    const input = actionSchema.parse(await request.json());

    if (input.action === "settings.save") {
      const before = await db.siteSettings.findUnique({ where: { id: "default" } });
      const { action: actionName, ...inputData } = input;
      void actionName;
      const data = {
        ...inputData,
        demoMode: canPersistDemoModeSetting() ? inputData.demoMode : false,
      };
      const after = await db.siteSettings.upsert({ where: { id: "default" }, update: data, create: { id: "default", ...data } });
      await audit(input.action, "SiteSettings", "default", before, after);
      return NextResponse.json({ ok: true, id: after.id });
    }

    if (input.action === "product.save") {
      const { action: actionName, id, preorderEta, ...rest } = input;
      void actionName;
      const data = { ...rest, preorderEta: preorderEta ? new Date(preorderEta) : null };
      const before = id ? await db.product.findUnique({ where: { id } }) : null;
      const after = id ? await db.product.update({ where: { id }, data }) : await db.product.create({ data });
      await audit(input.action, "Product", after.id, before, after);
      return NextResponse.json({ ok: true, id: after.id });
    }

    if (input.action === "variant.save") {
      const { action: actionName, id, incomingEta, ...rest } = input;
      void actionName;
      const data = { ...rest, incomingEta: incomingEta ? new Date(incomingEta) : null };
      const before = id ? await db.variant.findUnique({ where: { id } }) : null;
      const after = id ? await db.variant.update({ where: { id }, data }) : await db.variant.create({ data });
      await audit(input.action, "Variant", after.id, before, after);
      return NextResponse.json({ ok: true, id: after.id });
    }

    if (input.action === "collection.save") {
      const { action: actionName, id, ...data } = input;
      void actionName;
      const before = id ? await db.collection.findUnique({ where: { id } }) : null;
      const after = id ? await db.collection.update({ where: { id }, data }) : await db.collection.create({ data });
      await audit(input.action, "Collection", after.id, before, after);
      return NextResponse.json({ ok: true, id: after.id });
    }

    if (input.action === "bundle.save") {
      const { action: actionName, id, topProductId, bottomProductId, ...data } = input;
      void actionName;
      const before = id ? await db.bundle.findUnique({ where: { id }, include: { components: true } }) : null;
      const after = await db.$transaction(async (transaction) => {
        const bundle = id ? await transaction.bundle.update({ where: { id }, data }) : await transaction.bundle.create({ data });
        await transaction.bundleComponent.deleteMany({ where: { bundleId: bundle.id } });
        const components = [
          topProductId ? { bundleId: bundle.id, productId: topProductId, role: "TOP", sortOrder: 0 } : null,
          bottomProductId ? { bundleId: bundle.id, productId: bottomProductId, role: "BOTTOM", sortOrder: 1 } : null,
        ].filter((item): item is NonNullable<typeof item> => Boolean(item));
        if (components.length) await transaction.bundleComponent.createMany({ data: components });
        return bundle;
      });
      await audit(input.action, "Bundle", after.id, before, after);
      return NextResponse.json({ ok: true, id: after.id });
    }

    if (input.action === "sizeProfile.save") {
      const { action: actionName, id, ...data } = input;
      void actionName;
      const before = id ? await db.sizeProfile.findUnique({ where: { id } }) : null;
      const after = id ? await db.sizeProfile.update({ where: { id }, data }) : await db.sizeProfile.create({ data });
      await audit(input.action, "SizeProfile", after.id, before, after);
      return NextResponse.json({ ok: true, id: after.id });
    }

    if (input.action === "sizeRule.create") {
      const { action: actionName, sizeProfileId, ...data } = input;
      void actionName;
      const latest = await db.sizeRuleVersion.aggregate({ where: { sizeProfileId }, _max: { version: true } });
      const after = await db.sizeRuleVersion.create({ data: { ...data, sizeProfileId, version: (latest._max.version ?? 0) + 1, ...(data.status === "APPROVED" ? { approvedAt: new Date(), approvedBy: "password-admin" } : {}) } });
      await audit(input.action, "SizeRuleVersion", after.id, null, after);
      return NextResponse.json({ ok: true, id: after.id });
    }

    if (input.action === "knowledge.save") {
      const { action: actionName, id, reviewDate, ...rest } = input;
      void actionName;
      const data = { ...rest, reviewDate: reviewDate ? new Date(reviewDate) : null, publishedAt: rest.status === "PUBLISHED" ? new Date() : null };
      const before = id ? await db.knowledgeItem.findUnique({ where: { id } }) : null;
      const after = id ? await db.knowledgeItem.update({ where: { id }, data }) : await db.knowledgeItem.create({ data });
      await audit(input.action, "KnowledgeItem", after.id, before, after);
      return NextResponse.json({ ok: true, id: after.id });
    }

    if (input.action === "journal.save") {
      const { action: actionName, id, ...rest } = input;
      void actionName;
      const data = { ...rest, publishedAt: rest.status === "PUBLISHED" ? new Date() : null };
      const before = id ? await db.journalArticle.findUnique({ where: { id } }) : null;
      const after = id ? await db.journalArticle.update({ where: { id }, data }) : await db.journalArticle.create({ data });
      await audit(input.action, "JournalArticle", after.id, before, after);
      return NextResponse.json({ ok: true, id: after.id });
    }

    if (input.action === "translation.save") {
      const { action: actionName, ...rest } = input;
      void actionName;
      const where = { namespace_key_locale: { namespace: rest.namespace, key: rest.key, locale: rest.locale } };
      const before = await db.translation.findUnique({ where });
      const after = await db.translation.upsert({ where, update: { value: rest.value, status: rest.status, version: { increment: 1 }, publishedAt: rest.status === "PUBLISHED" ? new Date() : null }, create: { ...rest, publishedAt: rest.status === "PUBLISHED" ? new Date() : null } });
      await audit(input.action, "Translation", after.id, before, after);
      return NextResponse.json({ ok: true, id: after.id });
    }

    if (input.action === "contentPage.save") {
      const { action: actionName, ...rest } = input;
      void actionName;
      const where = { slug_locale: { slug: rest.slug, locale: rest.locale } };
      const before = await db.contentPage.findUnique({ where });
      const after = await db.contentPage.upsert({ where, update: { ...rest, version: { increment: 1 }, publishedAt: rest.status === "PUBLISHED" ? new Date() : null }, create: { ...rest, publishedAt: rest.status === "PUBLISHED" ? new Date() : null } });
      await audit(input.action, "ContentPage", after.id, before, after);
      return NextResponse.json({ ok: true, id: after.id });
    }

    const before = await db.handoffTicket.findUnique({ where: { id: input.id } });
    const after = await db.handoffTicket.update({ where: { id: input.id }, data: { status: input.status, resolvedAt: ["RESOLVED", "CLOSED"].includes(input.status) ? new Date() : null } });
    await audit(input.action, "HandoffTicket", after.id, before, after);
    return NextResponse.json({ ok: true, id: after.id });
  } catch (error) {
    return errorResponse(error, "admin_write_failed");
  }
}
