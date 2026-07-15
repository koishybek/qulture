import { z } from "zod";

export const cookieConsentSchema = z.object({
  necessary: z.literal(true).default(true),
  analytics: z.boolean().default(false),
  marketing: z.boolean().default(false),
  policyVersion: z.string().trim().min(1).max(80),
});

export type CookieConsent = z.output<typeof cookieConsentSchema>;
export type ConsentCategory = "necessary" | "analytics" | "marketing";

export const waitlistConsentSchema = z.object({
  serviceConsent: z.literal(true),
  restockConsent: z.boolean().default(false),
  marketingConsent: z.boolean().default(false),
});

export type WaitlistConsent = z.output<typeof waitlistConsentSchema>;

export type ConsentChoice =
  | { type: "accept_all"; policyVersion: string }
  | { type: "reject_optional"; policyVersion: string }
  | {
      type: "custom";
      policyVersion: string;
      analytics: boolean;
      marketing: boolean;
    };

export function resolveConsentChoice(choice: ConsentChoice): CookieConsent {
  if (choice.type === "accept_all") {
    return cookieConsentSchema.parse({
      necessary: true,
      analytics: true,
      marketing: true,
      policyVersion: choice.policyVersion,
    });
  }

  if (choice.type === "reject_optional") {
    return cookieConsentSchema.parse({
      necessary: true,
      analytics: false,
      marketing: false,
      policyVersion: choice.policyVersion,
    });
  }

  return cookieConsentSchema.parse({
    necessary: true,
    analytics: choice.analytics,
    marketing: choice.marketing,
    policyVersion: choice.policyVersion,
  });
}

export function hasConsent(
  consent: Pick<CookieConsent, ConsentCategory>,
  category: ConsentCategory,
): boolean {
  return consent[category] === true;
}

export function canSendWaitlistMessage(
  consent: WaitlistConsent,
  purpose: "service" | "restock" | "marketing",
): boolean {
  if (purpose === "service") {
    return consent.serviceConsent;
  }
  if (purpose === "restock") {
    return consent.restockConsent;
  }
  return consent.marketingConsent;
}
