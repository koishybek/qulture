import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { cookieConsentSchema } from "@/lib/validation/consent";
import { errorResponse } from "@/lib/http";

export const runtime = "nodejs";

const SUBJECT_COOKIE = "qulture_subject";
const requestSchema = cookieConsentSchema.extend({
  locale: z.enum(["en", "ru", "kz"]).optional(),
});

export async function POST(request: Request) {
  try {
    const input = requestSchema.parse(await request.json());
    const cookieStore = await cookies();
    const subjectId = cookieStore.get(SUBJECT_COOKIE)?.value ?? randomUUID();

    await db.$transaction([
      db.consentRecord.create({
        data: {
          subjectId,
          necessary: true,
          analytics: input.analytics,
          marketing: input.marketing,
          policyVersion: input.policyVersion,
          source: "consent-panel",
        },
      }),
      db.analyticsEvent.create({
        data: {
          name: "COOKIE_CONSENT_UPDATED",
          consentCategory: "NECESSARY",
          anonymousId: subjectId,
          language: input.locale === "en" ? "EN" : input.locale === "kz" ? "KZ" : "RU",
          payload: { analytics: input.analytics, marketing: input.marketing, policyVersion: input.policyVersion },
        },
      }),
    ]);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SUBJECT_COOKIE, subjectId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  } catch (error) {
    return errorResponse(error, "consent_failed");
  }
}
