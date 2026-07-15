import { expect, test } from "@playwright/test";

import {
  cleanupE2EWaitlist,
  dismissConsentIfPresent,
  nextErrorOverlay,
  preparePublicSession,
} from "./helpers";

test.afterAll(cleanupE2EWaitlist);

test.describe("public pre-launch experience", () => {
  test("English is the default home, including the consent surface", {
    tag: "@desktop",
  }, async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/en\/?$/);
    const consent = page.getByRole("dialog", {
      name: "Privacy preferences",
      exact: true,
    });
    await expect(consent).toBeVisible();
    await expect(consent).toContainText(
      "Essential cookies keep the site running. Analytics and marketing stay off until you choose otherwise.",
    );
    await consent
      .getByRole("button", { name: "Reject optional cookies", exact: true })
      .click();
    await expect(consent).toBeHidden();

    await expect(page).toHaveTitle(/QULTURE/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /DESIGNED FOR\s+CHANGING CLIMATES\./,
      }),
    ).toBeVisible();
    await expect(
      page
        .locator(".home-hero__actions")
        .getByRole("link", { name: "Explore the system", exact: true }),
    ).toBeVisible();

    const languages = page.locator(
      'header [role="group"][aria-label="Select language"]',
    );
    await expect(
      languages.getByRole("link", { name: "English", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect(
      languages.getByRole("link", { name: "Russian", exact: true }),
    ).toHaveAttribute("href", "/ru");
    await expect(
      languages.getByRole("link", { name: "Kazakh", exact: true }),
    ).toHaveAttribute("href", "/kz");
    await expect(page.locator("main")).not.toContainText("Смотреть систему");
    await expect(page.locator("main")).not.toContainText("DEMO COMMERCE");
    await expect(nextErrorOverlay(page)).toHaveCount(0);

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });

  test("mobile English home opens its primary navigation", {
    tag: "@mobile",
  }, async ({ page }) => {
    await preparePublicSession(page);
    await page.goto("/en");
    await dismissConsentIfPresent(page);

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /DESIGNED FOR\s+CHANGING CLIMATES\./,
      }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Open menu", exact: true })
      .click();
    const menu = page.getByRole("dialog", {
      name: "Navigation menu",
      exact: true,
    });
    await expect(menu).toBeVisible();
    await expect(
      menu.getByRole("link", { name: "Technology", exact: true }),
    ).toBeVisible();
    await expect(nextErrorOverlay(page)).toHaveCount(0);

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });

  test("locale switch preserves the page family from Russian to Kazakh", {
    tag: "@desktop",
  }, async ({ page }) => {
    await preparePublicSession(page);
    await page.goto("/ru?source=e2e#city-layer-system");
    await dismissConsentIfPresent(page, "ru");

    const languages = page.locator(
      'header [role="group"][aria-label="Выбрать язык"]',
    );
    await expect(
      languages.getByRole("link", { name: "Английский", exact: true }),
    ).toBeVisible();
    await expect(
      languages.getByRole("link", { name: "Русский", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    const localeLink = languages.getByRole("link", {
      name: "Казахский",
      exact: true,
    });
    await expect(localeLink).toHaveAttribute(
      "href",
      "/kz?source=e2e#city-layer-system",
    );
    await expect(
      page
        .locator('footer [role="group"][aria-label="Выбрать язык"]')
        .getByRole("link", { name: "Казахский", exact: true }),
    ).toHaveAttribute("href", "/kz?source=e2e#city-layer-system");
    await localeLink.click();

    await expect(page).toHaveURL(/\/kz\?source=e2e#city-layer-system$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "kk");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "ӨЗГЕРМЕЛІ КЛИМАТҚА АРНАЛҒАН.",
      }),
    ).toBeVisible();
    await expect(
      page
        .locator('header [role="group"][aria-label="Тілді таңдау"]')
        .getByRole("link", { name: "Орыс тілі", exact: true }),
    ).toBeVisible();
  });

  test("English AI quick action renders the safe offline fallback", {
    tag: "@desktop",
  }, async ({ page }) => {
    await preparePublicSession(page);
    await page.route("**/api/ai", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ message: "provider intentionally unavailable" }),
      });
    });
    await page.goto("/en");
    await dismissConsentIfPresent(page);

    await page
      .getByRole("button", {
        name: "QULTURE Assist",
        exact: true,
      })
      .click();
    const dialog = page.getByRole("dialog", {
      name: "QULTURE AI assistant",
      exact: true,
    });
    await expect(dialog).toBeVisible();
    await dialog
      .getByRole("button", {
        name: "Help me choose a size",
        exact: true,
      })
      .click();

    await expect(dialog.locator('[data-role="user"]')).toContainText(
      "Help me choose a size",
    );
    await expect(dialog.locator('[data-role="assistant"]')).toContainText(
      "The advisor is temporarily unavailable",
    );
  });

  test("valid English waitlist submission is acknowledged", {
    tag: "@desktop",
  }, async ({ page }) => {
    await preparePublicSession(page);
    await page.goto("/en/waitlist");
    await dismissConsentIfPresent(page);

    await page.getByLabel("City", { exact: true }).selectOption("astana");
    await page
      .getByLabel("What are you interested in?", { exact: true })
      .selectOption("set");
    await page.getByLabel("Size", { exact: true }).selectOption("M");
    await page.getByLabel("Name", { exact: true }).fill("QULTURE E2E");
    await page
      .getByLabel("Email or phone", { exact: true })
      .fill(`e2e-${Date.now()}@example.test`);
    await page
      .getByRole("checkbox", {
        name: "I agree to receive a service notification when the item is ready",
        exact: true,
      })
      .check();

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/waitlist") &&
        response.request().method() === "POST",
    );
    await page
      .getByRole("button", {
        name: "Notify me when ready",
        exact: true,
      })
      .click();
    const response = await responsePromise;

    expect(response.ok()).toBe(true);
    await expect(
      page.getByRole("status").filter({
        hasText: "Done. We saved your interest and consent choices.",
      }),
    ).toBeVisible();
  });
});
