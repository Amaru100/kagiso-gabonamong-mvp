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
    "Kagiso Gabonamong",
  );
  await page.screenshot({ path: "artifacts/desktop.png", fullPage: true });
  await page.screenshot({ path: "artifacts/desktop-viewport.png" });
  await expect(
    page.getByText("Independent thinking. Intentional living."),
  ).toHaveCount(0);
  await expect(
    page.getByText("A little perspective. A more deliberate life."),
  ).toHaveCount(0);
  await expect(page.getByText(/Muzila Designs/)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Recommended books", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Atomic Habits", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Books by Kagiso", exact: true }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () =>
        !!(
          document
            .getElementById("writings-heading")
            .compareDocumentPosition(document.getElementById("books-heading")) &
          Node.DOCUMENT_POSITION_FOLLOWING
        ),
    ),
  ).toBe(true);
  await expect(
    page.getByRole("heading", { name: "About the author", exact: true }),
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
    "/books",
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
  await page.goto("/work-with-me");
  await expect(page.locator(".service-list svg")).toHaveCount(0);
  await page.getByRole("button", { name: "Webinars", exact: true }).click();
  await expect(page.getByLabel("Subject", { exact: true })).toHaveValue(
    "Booking enquiry: Webinars",
  );
  await page.screenshot({ path: "artifacts/work-with-me.png", fullPage: true });
  await page.goto("/checkout");
  await expect(
    page.getByRole("heading", { name: "Page not found." }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    "/",
    "/writings",
    "/books",
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
  await preview.goto("/books");
  await expect(
    preview.getByRole("heading", { name: "Owner selected book" }),
  ).toBeVisible();
  await page.getByLabel("Book type").selectOption("own");
  await page.getByRole("button", { name: "Publish changes" }).click();
  await expect(page.getByRole("status")).toContainText("Published.");
  await preview.reload();
  await expect(
    preview.getByRole("heading", { name: "Books by Kagiso" }),
  ).toBeVisible();
  await page.screenshot({ path: "artifacts/books-admin.png", fullPage: true });
  await page.getByLabel("Visible on website").uncheck();
  await page.getByRole("button", { name: "Publish changes" }).click();
  await expect(page.getByRole("status")).toContainText("Published.");
  await preview.reload();
  await expect(
    preview.getByRole("heading", { name: "Books by Kagiso" }),
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
