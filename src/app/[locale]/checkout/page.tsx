import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckoutPage } from "@/components/commerce/checkout-page";
import { isDemoOrderApiEnabled } from "@/lib/commerce/demo-gate";
import { getProductionCommerceReadiness } from "@/lib/commerce/providers";
import { db } from "@/lib/db";
import { isLocale } from "@/lib/i18n";
import {
  canCapturePiiUnderPolicy,
  DEFAULT_CONSENT_POLICY_VERSION,
} from "@/lib/privacy/pii-policy";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const settings = await db.siteSettings.findUnique({
    where: { id: "default" },
    select: { consentPolicyVersion: true },
  });
  const policyVersion =
    settings?.consentPolicyVersion ?? DEFAULT_CONSENT_POLICY_VERSION;
  return (
    <CheckoutPage
      demoCaptureEnabled={
        isDemoOrderApiEnabled() && canCapturePiiUnderPolicy({ policyVersion })
      }
      locale={locale}
      providerReadiness={getProductionCommerceReadiness()}
    />
  );
}
