import type { Page } from "@playwright/test";
import { db } from "../src/lib/db";

const STORED_CONSENT = {
  necessary: true,
  analytics: false,
  marketing: false,
  policyVersion: "2026-07-draft",
  updatedAt: "2026-07-15T00:00:00.000Z",
};

type ConsentLocale = "en" | "ru" | "kz";

const consentRejectLabel: Record<ConsentLocale, string> = {
  en: "Reject optional cookies",
  ru: "Отклонить необязательные",
  kz: "Қосымша cookie файлдарынан бас тарту",
};

/**
 * Keeps smoke tests focused on the requested flow. Consent behavior has unit/API
 * coverage; these tests start from a valid necessary-only choice.
 */
export async function preparePublicSession(page: Page, clearCart = false) {
  await page.addInitScript(
    ({ consent, shouldClearCart }) => {
      window.localStorage.setItem("qulture-consent-v1", JSON.stringify(consent));
      window.sessionStorage.setItem("qulture-ai-teaser-dismissed", "1");
      window.sessionStorage.setItem("qulture-ai-teaser-dismissed-v2", "1");
      if (shouldClearCart) window.localStorage.removeItem("qulture-cart-v1");
    },
    { consent: STORED_CONSENT, shouldClearCart: clearCart },
  );
}

/** React mounts the consent manager asynchronously. This is a defensive
 * fallback for engines that do not expose origin localStorage to init scripts
 * until after the first navigation. */
export async function dismissConsentIfPresent(page: Page, locale: ConsentLocale = "en") {
  const decline = page.getByRole("button", {
    name: consentRejectLabel[locale],
    exact: true,
  });

  try {
    await decline.waitFor({ state: "visible", timeout: 1_500 });
  } catch {
    return;
  }
  await decline.click();
}

export function nextErrorOverlay(page: Page) {
  // `nextjs-portal` and the dev-tools badge exist during healthy `next dev`
  // sessions. Only the framework error dialog is a failure signal.
  return page.locator("[data-nextjs-dialog-overlay]");
}

export async function cleanupE2EWaitlist() {
  await db.waitlistLead.deleteMany({ where: { name: "QULTURE E2E", source: { startsWith: "waitlist-page:" } } });
}

export async function cleanupE2EOrders() {
  const orders = await db.order.findMany({ where: { isTest: true, customerName: "QULTURE E2E" }, select: { id: true } });
  const ids = orders.map((order) => order.id);
  if (!ids.length) return;
  await db.idempotencyRecord.deleteMany({ where: { scope: "demo-order", resourceId: { in: ids } } });
  await db.order.deleteMany({ where: { id: { in: ids } } });
}
