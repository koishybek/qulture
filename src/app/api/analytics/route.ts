import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { errorResponse, jsonError } from "@/lib/http";

export const runtime = "nodejs";

const eventNames = [
  "PAGE_VIEW", "VIEW_ITEM", "SELECT_SIZE", "ADD_TO_CART", "BEGIN_CHECKOUT", "PURCHASE",
  "AI_OPEN", "AI_RECOMMENDATION", "AI_HANDOFF", "AI_TEASER_SHOWN", "AI_TEASER_CLOSED",
  "AI_QUICK_ACTION_CLICKED", "PRODUCT_CARD_MEDIA_SWAPPED", "SCROLL_DEPTH",
  "PAYMENT_METHOD_SELECTED", "RETURN_REQUESTED",
] as const;

const eventSchema = z.object({
  name: z.enum(eventNames),
  category: z.enum(["NECESSARY", "ANALYTICS", "MARKETING"]).default("ANALYTICS"),
  sessionId: z.string().trim().max(120).optional(),
  locale: z.enum(["en", "ru", "kz"]).optional(),
  correlationId: z.string().trim().max(120).optional(),
  payload: z.record(z.string(), z.union([z.string().max(240), z.number(), z.boolean(), z.null()])).optional(),
});

export async function POST(request: Request) {
  try {
    const input = eventSchema.parse(await request.json());
    const subjectId = (await cookies()).get("qulture_subject")?.value;

    if (input.category !== "NECESSARY") {
      if (!subjectId) return jsonError("consent_required", 403);
      const consent = await db.consentRecord.findFirst({ where: { subjectId }, orderBy: { createdAt: "desc" } });
      const allowed = input.category === "ANALYTICS" ? consent?.analytics : consent?.marketing;
      if (!allowed) return jsonError("consent_required", 403);
    }

    await db.analyticsEvent.create({
      data: {
        name: input.name,
        consentCategory: input.category,
        sessionId: input.sessionId,
        anonymousId: subjectId,
        language:
          input.locale === "en"
            ? "EN"
            : input.locale === "kz"
              ? "KZ"
              : input.locale === "ru"
                ? "RU"
                : undefined,
        correlationId: input.correlationId,
        payload: input.payload,
      },
    });
    return NextResponse.json({ ok: true }, { status: 202 });
  } catch (error) {
    return errorResponse(error, "analytics_failed");
  }
}
