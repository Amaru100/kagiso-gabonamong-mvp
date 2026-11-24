import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

test.beforeEach(async ({ context }) => {
  await context.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) => route.abort());
});

test("public routes, reference layout, contact safeguards and navigation", async ({ page }) => {
  test.setTimeout(240000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await mkdir("artifacts/mystic-mind", { recursive: true });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Read widely.");
  await expect(page.getByText("Designed by Muzila Group")).toBeVisible();
  await expect(page.getByText(/Design preview/)).toHaveCount(0);
  await expect(page.getByText("Atomic Habits")).toHaveCount(0);
  await expect(page.getByText("Newsletter subscriptions are currently unavailable.")).toBeVisible();
  expect(await page.locator(".ambient").evaluate((element) => getComputedStyle(element, "::before").animationName)).toBe("none");

  const routes = ["/", "/writings", "/writings/discipline-dividend-dreams", "/books", "/recommended-books", "/resources", "/premium-store", "/events", "/about", "/work-with-me", "/contact"];
  for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByText("Writing not found.")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if ([390, 768, 1440].includes(width)) {
        const name = route === "/" ? "home" : route.slice(1).replaceAll("/", "-");
        expect(await page.locator("main img").evaluateAll(async (images) => {
          await Promise.all(images.map(async (image) => {
            image.loading = "eager";
            await image.decode().catch(() => {});
          }));
          return images.every((image) => image.naturalWidth > 0);
        })).toBe(true);
        await page.screenshot({ path: "artifacts/mystic-mind/" + width + "-" + name + ".png", fullPage: true });
      }
    }
  }
  const reference = await page.context().newPage();
  for (const width of [390, 768, 1440]) {
    await reference.setViewportSize({ width, height: 900 });
    await reference.emulateMedia({ reducedMotion: "reduce" });
    await reference.goto(pathToFileURL(resolve("design-reference/kagiso-approved.html")).href);
    await reference.screenshot({ path: "artifacts/mystic-mind/" + width + "-approved-reference.png", fullPage: true });
  }
  await reference.close();
  await page.goto("/events");
  await page.getByRole("link", { name: "Enquire about this event" }).first().click();
  await expect(page.getByLabel("Subject", { exact: true })).toHaveValue(/Event enquiry:/);
  await expect(page.getByRole("button", { name: "Continue in email" })).toBeDisabled();
  await page.goto("/work-with-me");
  await expect(page.getByRole("radio")).toHaveCount(5);
  await page.getByRole("radio", { name: "Webinars" }).check();
  await page.getByRole("radio", { name: "Workshops" }).check();
  await expect(page.getByRole("radio", { name: "Webinars" })).not.toBeChecked();
  await expect(page.getByRole("button", { name: "Continue in email" })).toBeDisabled();
  await page.goto("/checkout");
  await expect(page.getByRole("heading", { name: "Page not found." })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.getByRole("button", { name: "Menu" });
  await menu.click();
  await page.locator("#site-menu").getByRole("link", { name: "Writings", exact: true }).focus();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await page.locator("#site-menu").getByRole("link", { name: "Writings", exact: true }).click();
  await expect(page).toHaveURL(/writings$/);
  expect(errors).toEqual([]);
});

test("owner manages recommended books and future publications", async ({
  page,
}) => {
  await page.goto("/admin");
  await page.getByLabel("Owner password").fill("test-only-owner-password-42");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.getByRole("button", { name: /^Books/ }).click();
  await page.getByRole("button", { name: "Add book", exact: true }).click();
  await page.getByLabel("Title", { exact: true }).fill("Owner selected book");
  await page.getByLabel("Author", { exact: true }).fill("A Book Author");
  await page.getByLabel("Book cover URL").fill("/books/deep-work.jpg");
  await page
    .getByLabel("Why recommend it / book description")
    .fill("A personal reason for recommending this book.");
  await page.getByLabel("Featured on homepage").check();
  await page.getByRole("button", { name: "Move up" }).click();
  await page.getByLabel("Visible on website").check();
  await page.getByRole("button", { name: "Publish changes" }).click();
  await expect(page.getByRole("status")).toContainText("Published.");
  await page.reload();
  await page.getByRole("button", { name: /^Books/ }).click();
  await page.getByRole("button", { name: /Owner selected book/ }).click();
  await expect(
    page.getByLabel("Why recommend it / book description"),
  ).toHaveValue("A personal reason for recommending this book.");
  const preview = await page.context().newPage();
  await preview.goto("/recommended-books");
  await expect(
    preview.getByRole("heading", { name: "Owner selected book" }),
  ).toBeVisible();
  await preview.goto("/");
  await expect(preview.getByRole("heading", { name: "Owner selected book" })).toBeVisible();
  await page.getByLabel("Book type").selectOption("own");
  await page.getByRole("button", { name: "Publish changes" }).click();
  await expect(page.getByRole("status")).toContainText("Published.");
  await preview.goto("/books");
  await expect(preview.getByRole("heading", { name: "Owner selected book" })).toBeVisible();
  await page.screenshot({ path: "artifacts/books-admin.png", fullPage: true });
  await page.getByLabel("Visible on website").uncheck();
  await page.getByRole("button", { name: "Publish changes" }).click();
  await expect(page.getByRole("status")).toContainText("Published.");
  await preview.reload();
  await expect(
    preview.getByRole("heading", { name: "Owner selected book" }),
  ).toHaveCount(0);
  await preview.close();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await page.getByRole("button", { name: "Publish changes" }).click();
  await expect(page.getByRole("status")).toContainText("Published.");
});

test("owner can create, publish, edit, hide, reorder and delete persistent content", async ({
  page,
}) => {
  await page.goto("/admin");
  await page.getByLabel("Owner password").fill("test-only-owner-password-42");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Manage the website" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add writing" }).click();
  await page.getByLabel("Title", { exact: true }).fill("A new owner writing");
  await page.getByLabel("URL ID").fill("owner-test-writing");
  await page
    .getByLabel("Full writing", { exact: false })
    .fill("First real paragraph.\n\nSecond real paragraph.");
  await page
    .getByRole("button", { name: "Choose cover book", exact: true })
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
