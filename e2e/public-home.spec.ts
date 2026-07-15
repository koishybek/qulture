import { expect, test } from "@playwright/test";

import {
  dismissConsentIfPresent,
  cleanupE2EWaitlist,
  nextErrorOverlay,
  preparePublicSession,
} from "./helpers";

test.afterAll(cleanupE2EWaitlist);

test.describe("public pre-launch experience", () => {
  test("desktop home renders the editorial pre-launch surface", {
    tag: "@desktop",
  }, async ({ page }) => {
    await preparePublicSession(page);

    await page.goto("/ru");
    await dismissConsentIfPresent(page);

    await expect(page).toHaveURL(/\/ru\/?$/);
    await expect(page).toHaveTitle(/QULTURE/);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /DESIGNED FOR\s+CHANGING CLIMATES\./,
      }),
    ).toBeVisible();
    await expect(
      page
        .locator(".home-hero__actions")
        .getByRole("link", { name: "Смотреть систему", exact: true }),
    ).toBeVisible();
    await expect(page.locator("main")).not.toContainText("₸");
    await expect(page.locator("main")).not.toContainText("DEMO COMMERCE");
    await expect(nextErrorOverlay(page)).toHaveCount(0);

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });

  test("mobile home opens its primary navigation", {
    tag: "@mobile",
  }, async ({ page }) => {
    await preparePublicSession(page);

    await page.goto("/ru");
    await dismissConsentIfPresent(page);

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /DESIGNED FOR\s+CHANGING CLIMATES\./,
      }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Открыть меню", exact: true })
      .click();
    const menu = page.getByRole("dialog", {
      name: "Открыть меню",
      exact: true,
    });
    await expect(menu).toBeVisible();
    await expect(
      menu.getByRole("link", { name: "Технологии", exact: true }),
    ).toBeVisible();
    await expect(nextErrorOverlay(page)).toHaveCount(0);

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });

  test("locale switch preserves the page family and changes to Kazakh", {
    tag: "@desktop",
  }, async ({ page }) => {
    await preparePublicSession(page);
    await page.goto("/ru?source=e2e#city-layer-system");
    await dismissConsentIfPresent(page);

    const localeLink = page.getByRole("link", { name: "Қазақша", exact: true });
    await expect(localeLink).toHaveAttribute(
      "href",
      "/kz?source=e2e#city-layer-system",
    );
    await expect(
      page.locator("footer").getByRole("link", { name: "RU / KZ", exact: true }),
    ).toHaveAttribute("href", "/kz?source=e2e#city-layer-system");
    await localeLink.click();

    await expect(page).toHaveURL(/\/kz\?source=e2e#city-layer-system$/);
    await expect(
      page.getByText(
        "Желге, қабаттарға және қозғалысқа арналған қалалық киім.",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Русский", exact: true }),
    ).toBeVisible();
  });

  test("AI quick action renders the safe offline fallback", {
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
    await page.goto("/ru");
    await dismissConsentIfPresent(page);

    await page
      .getByRole("button", {
        name: "AI-консультант QULTURE",
        exact: true,
      })
      .click();
    const dialog = page.getByRole("dialog", {
      name: "AI-консультант QULTURE",
      exact: true,
    });
    await expect(dialog).toBeVisible();
    await dialog
      .getByRole("button", {
        name: "Помочь выбрать размер",
        exact: true,
      })
      .click();

    await expect(dialog.locator('[data-role="user"]')).toContainText(
      "Помочь выбрать размер",
    );
    await expect(dialog.locator('[data-role="assistant"]')).toContainText(
      "Консультант временно недоступен",
    );
  });

  test("valid waitlist submission is acknowledged", {
    tag: "@desktop",
  }, async ({ page }) => {
    await preparePublicSession(page);
    await page.goto("/ru/waitlist");
    await dismissConsentIfPresent(page);

    await page.getByLabel("Город", { exact: true }).selectOption("astana");
    await page
      .getByLabel("Что вас интересует", { exact: true })
      .selectOption("set");
    await page.getByLabel("Размер", { exact: true }).selectOption("M");
    await page.getByLabel("Имя", { exact: true }).fill("QULTURE E2E");
    await page
      .getByLabel("Email или телефон", { exact: true })
      .fill(`e2e-${Date.now()}@example.test`);
    await page
      .getByRole("checkbox", {
        name: "Согласен получить сервисное уведомление о готовности",
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
        name: /Сообщить о готовности/,
      })
      .click();
    const response = await responsePromise;

    expect(response.ok()).toBe(true);
    await expect(
      page.getByRole("status").filter({
        hasText: "Готово. Мы сохранили ваш интерес и выбранные согласия.",
      }),
    ).toBeVisible();
  });
});
