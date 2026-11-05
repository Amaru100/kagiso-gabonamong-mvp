import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

test("public pages, original covers, mobile navigation, and removed purchase flows", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await mkdir("artifacts", { recursive: true });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Think clearly. Build with purpose.",
  );
  await page.screenshot({ path: "artifacts/desktop.png", fullPage: true });
  await page.screenshot({ path: "artifacts/desktop-viewport.png" });
  await expect(
    page.getByRole("heading", { name: "About the author." }),
  ).toBeVisible();
  await expect(page.getByText("Portrait coming soon")).toBeVisible();
  expect(
    await page.locator('a[href*="checkout"], a[href="/cart"]').count(),
  ).toBe(0);
  await page.goto("/writings");
  await expect(page.getByRole("link", { name: "Read More" })).toHaveCount(6);
  await page.getByRole("link", { name: "Read More" }).first().click();
  await expect(page.getByText("The full writing is on its way.")).toBeVisible();
  for (const route of [
    "/about",
    "/resources",
    "/premium-store",
    "/events",
    "/work-with-me",
    "/contact",
  ]) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(
      await page
        .locator("img")
        .evaluateAll(
          (images) =>
            images.filter((image) => image.complete && !image.naturalWidth)
              .length,
        ),
    ).toBe(0);
  }
  await page.goto("/events");
  await page
    .getByRole("link", { name: "Enquire about this event" })
    .first()
    .click();
  await expect(page.getByLabel("Subject", { exact: true })).toHaveValue(
    /Event enquiry:/,
  );
  await page.goto("/checkout");
  await expect(
    page.getByRole("heading", { name: "Page not found." }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    "/",
    "/writings",
    "/resources",
    "/events",
    "/contact",
    "/admin",
  ]) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (route === "/")
      await page.screenshot({ path: "artifacts/mobile.png", fullPage: true });
  }
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page
    .locator("#mobile-navigation")
    .getByRole("link", { name: "Writings", exact: true })
    .click();
  await expect(page).toHaveURL(/\/writings$/);
  expect(errors).toEqual([]);
});

test("owner can create, publish, edit, hide, reorder and delete persistent content", async ({
  page,
}) => {
  await page.goto("/admin");
  await page.getByLabel("Owner password").fill("test-only-owner-password-42");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your words. Your space." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add writing" }).click();
  await page.getByLabel("Title", { exact: true }).fill("A new owner writing");
  await page.getByLabel("URL ID").fill("owner-test-writing");
  await page
    .getByLabel("Full writing", { exact: false })
    .fill("First real paragraph.\n\nSecond real paragraph.");
  await page
    .getByRole("button", { name: "Choose cover 4", exact: true })
    .click();
  await page.getByRole("button", { name: "Publish changes" }).click();
  await expect(page.getByRole("status")).toContainText("Published.");
  const response = await page.request.get("/api/content");
  expect(
    (await response.json()).content.articles.some(
      (item) => item.id === "owner-test-writing",
    ),
  ).toBe(false);
  await page.getByLabel("Visible on website").check();
  await page.getByRole("button", { name: "Move up" }).click();
  await page.getByRole("button", { name: "Publish changes" }).click();
  await expect(page.getByRole("status")).toContainText("Published.");
  await page.reload();
  await page.getByRole("button", { name: /A new owner writing/ }).click();
  await expect(page.getByLabel("Full writing", { exact: false })).toHaveValue(
    "First real paragraph.\n\nSecond real paragraph.",
  );
  await page
    .getByLabel("Title", { exact: true })
    .fill("An edited owner writing");
  await page.getByRole("button", { name: "Publish changes" }).click();
  await expect(page.getByRole("status")).toContainText("Published.");
  const publicPage = await page.context().newPage();
  await publicPage.goto("/writings/owner-test-writing");
  await expect(publicPage.getByRole("heading", { level: 1 })).toHaveText(
    "An edited owner writing",
  );
  await expect(publicPage.getByText("Second real paragraph.")).toBeVisible();
  await publicPage.close();
  await page.screenshot({
    path: "artifacts/admin-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "artifacts/admin-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Site & author" }).click();
  await page
    .getByLabel("Author biography")
    .fill("An author story managed without a developer.");
  await page.getByRole("button", { name: "Publish changes" }).click();
  await expect(page.getByRole("status")).toContainText("Published.");
  await page.getByRole("button", { name: /Writings/ }).click();
  await page.getByRole("button", { name: /An edited owner writing/ }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await page.getByRole("button", { name: "Publish changes" }).click();
  await expect(page.getByRole("status")).toContainText("Published.");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByLabel("Owner password")).toBeVisible();
  expect((await page.request.get("/api/admin")).status()).toBe(401);
});
