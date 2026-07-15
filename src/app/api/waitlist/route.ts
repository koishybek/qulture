import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { errorResponse, isSameOrigin, jsonError, requestIp } from "@/lib/http";
import { consumeRateLimit } from "@/lib/rate-limit";
import {
  canCapturePiiUnderPolicy,
  DEFAULT_CONSENT_POLICY_VERSION,
} from "@/lib/privacy/pii-policy";
import { parseWaitlistInput } from "@/lib/validation/waitlist";
import {
  InvalidWaitlistContextError,
  verifyWaitlistCatalogContext,
} from "@/lib/waitlist/context";

export const runtime = "nodejs";

const browserWaitlistSchema = z.object({
  city: z.string(),
  interest: z.string().trim().max(40).optional(),
  intent: z.enum(["launch", "restock"]).default("launch"),
  productId: z.string().trim().min(1).max(80).optional(),
  variantId: z.string().trim().min(1).max(80).optional(),
  color: z.string().trim().min(1).max(80).optional(),
  size: z.string().trim().min(1).max(40).optional(),
  name: z.string(),
  contact: z.string(),
  serviceConsent: z.boolean(),
  restockConsent: z.boolean().default(false),
  marketingConsent: z.boolean().default(false),
  policyVersion: z.string().trim().min(1).max(80),
  locale: z.enum(["ru", "kz"]),
  source: z.string().trim().min(1).max(80).default("website"),
});

function contactFields(contact: string) {
  const value = contact.trim();
  return value.includes("@") ? { email: value } : { phone: value };
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("invalid_origin", 403);
  const rate = consumeRateLimit(`waitlist:${requestIp(request)}`, 8, 60_000);
  if (!rate.allowed) return jsonError("too_many_requests", 429);

  try {
    const settings = await db.siteSettings.findUnique({
      where: { id: "default" },
      select: { consentPolicyVersion: true },
    });
    const policyVersion = settings?.consentPolicyVersion ?? DEFAULT_CONSENT_POLICY_VERSION;
    if (!canCapturePiiUnderPolicy({ policyVersion })) {
      return jsonError("draft_policy_capture_disabled", 503);
    }

    const browserInput = browserWaitlistSchema.parse(await request.json());
    if (browserInput.policyVersion !== policyVersion) {
      return jsonError("policy_version_changed", 409);
    }
    const requestedSize = browserInput.size === "unknown" ? undefined : browserInput.size;
    const hasCatalogContext = Boolean(browserInput.productId || browserInput.variantId || browserInput.color);
    const verifiedContext = await verifyWaitlistCatalogContext({
      productId: browserInput.productId,
      variantId: browserInput.variantId,
      color: browserInput.color,
      size: hasCatalogContext ? requestedSize : undefined,
    });
    if (browserInput.intent === "restock" && !verifiedContext.productId) {
      return jsonError("invalid_waitlist_context", 400);
    }
    const parsed = parseWaitlistInput({
      productId: verifiedContext.productId,
      variantId: verifiedContext.variantId,
      color: verifiedContext.color,
      city: browserInput.city,
      name: browserInput.name,
      ...contactFields(browserInput.contact),
      size: verifiedContext.size ?? (verifiedContext.productId ? undefined : requestedSize),
      contactPurpose: browserInput.intent === "restock" ? "RESTOCK" : "LAUNCH",
      serviceConsent: browserInput.serviceConsent,
      restockConsent: browserInput.intent === "restock" && browserInput.restockConsent,
      marketingConsent: browserInput.marketingConsent,
      policyVersion,
      language: browserInput.locale === "ru" ? "RU" : "KZ",
      source: `${browserInput.source}:${browserInput.interest ?? "general"}`.slice(0, 120),
    });

    const lead = await db.$transaction(async (transaction) => {
      const saved = await transaction.waitlistLead.upsert({
        where: { dedupKey: parsed.dedupKey },
        update: {
          city: parsed.city,
          name: parsed.name,
          serviceConsent: parsed.serviceConsent,
          restockConsent: parsed.restockConsent,
          marketingConsent: parsed.marketingConsent,
          policyVersion: parsed.policyVersion,
          submissionCount: { increment: 1 },
          lastSubmittedAt: new Date(),
        },
        create: parsed,
        select: { id: true, submissionCount: true },
      });
      await transaction.analyticsEvent.create({
        data: {
          name: "WAITLIST_SUBMIT",
          consentCategory: "NECESSARY",
          language: parsed.language,
          payload: { source: parsed.source, hasEmail: Boolean(parsed.email), hasPhone: Boolean(parsed.phone) },
        },
      });
      return saved;
    });

    return NextResponse.json({ ok: true, leadId: lead.id, duplicate: lead.submissionCount > 1 });
  } catch (error) {
    if (error instanceof InvalidWaitlistContextError) {
      return jsonError("invalid_waitlist_context", 400);
    }
    return errorResponse(error, "waitlist_failed");
  }
}
