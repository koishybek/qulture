import { expect, test } from "@playwright/test";

import {
  cleanupE2EOrders,
  dismissConsentIfPresent,
  preparePublicSession,
} from "./helpers";

test.afterAll(cleanupE2EOrders);

test("isolated English demo supports independent sizes through signed order status", {
  tag: "@desktop",
}, async ({ page }) => {
  await preparePublicSession(page, true);
  await page.goto("/en/build-a-set?demo=1");
  await dismissConsentIfPresent(page);

  const builder = page.getByTestId("demo-build-set");
  await expect(builder).toBeVisible();
  await expect(builder).toContainText(
    "DEMO BUILD-A-SET — INDEPENDENT SIZES — MOCK PAYMENT",
  );
  await expect(builder.getByTestId("add-set-to-cart")).toContainText("Add set");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/i,
  );

  const topLarge = page.getByTestId("top-size").filter({ hasText: /^L/ });
  const pantsMedium = page
    .getByTestId("pants-size")
    .filter({ hasText: /^M/ });
  await expect(topLarge).toHaveCount(1);
  await expect(pantsMedium).toHaveCount(1);
  await topLarge.click();
  await pantsMedium.click();
  await expect(topLarge).toHaveAttribute("aria-pressed", "true");
  await expect(pantsMedium).toHaveAttribute("aria-pressed", "true");

  await page.getByTestId("add-set-to-cart").click();
  const drawer = page.getByRole("dialog", { name: /Bag \(2\)/ });
  await expect(drawer).toBeVisible();
  await expect(drawer).toContainText("TOP");
  await expect(drawer).toContainText("PANTS");
  const topLineSize = drawer
    .locator(".cart-line")
    .filter({ hasText: "TOP" })
    .locator("select");
  await topLineSize.selectOption({ label: "M" });
  await expect(topLineSize.locator("option:checked")).toHaveText("M");
  await topLineSize.selectOption({ label: "L" });
  await expect(topLineSize.locator("option:checked")).toHaveText("L");
  await drawer
    .getByRole("link", { name: "Open bag", exact: true })
    .click();

  await expect(page).toHaveURL(/\/en\/cart$/);
  await expect(
    page
      .locator("#main-content")
      .getByText("DEMO COMMERCE — NOT FOR PUBLICATION", { exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId("checkout-link")).toContainText("Go to checkout");
  await page.getByTestId("checkout-link").click();
  await expect(page).toHaveURL(/\/en\/checkout$/);

  await expect(page.locator(".checkout-summary__line")).toHaveCount(2);
  await expect(page.locator(".checkout-summary__line")).toContainText([
    "TOP · L",
    "PANTS · M",
  ]);
  await page.getByLabel("Name", { exact: true }).fill("QULTURE E2E");
  await page
    .getByLabel("Email", { exact: true })
    .fill(`order-${Date.now()}@example.test`);
  await page
    .getByLabel("Phone", { exact: true })
    .fill("+77001234567");
  await page.getByLabel("Address", { exact: true }).fill("Astana, Demo street 1");
  await page
    .getByRole("checkbox", {
      name: "I accept the draft Terms of Sale and the data-processing notice",
      exact: true,
    })
    .check();
  await page
    .getByRole("checkbox", {
      name: "I consent to service notifications about my order",
      exact: true,
    })
    .check();

  const orderResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/orders") &&
      response.request().method() === "POST",
  );
  await page.getByTestId("create-test-order").click();
  const orderResponse = await orderResponsePromise;
  expect(orderResponse.status()).toBe(201);

  await expect(page).toHaveURL(
    /\/en\/order-status\?order=Q-D[^#]+#token=qot_/,
  );
  await expect(
    page.getByRole("heading", { level: 1, name: /ORDER STATUS/ }),
  ).toBeVisible();
  await expect(page.getByText("CONFIRMED", { exact: true })).toBeVisible();
  await expect(page.getByText("PAID", { exact: true })).toBeVisible();
  await expect(page.locator(".order-result")).toContainText("· L × 1");
  await expect(page.locator(".order-result")).toContainText("· M × 1");
});
