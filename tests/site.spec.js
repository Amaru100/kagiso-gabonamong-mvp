import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

test("header hides after five seconds and can be restored by scroll, keyboard and menu", async ({page})=>{
  await page.setViewportSize({width:390,height:700});
  await page.emulateMedia({reducedMotion:"reduce"});
  const start = new Date("2026-01-01T00:00:00Z");
  await page.clock.install({time:start});
  await page.goto("/writings");
  const header = page.locator(".m-header");
  const main = page.locator("#main-content");
  await expect(main.getByRole("heading",{level:1})).toHaveText("Writings",{timeout:15000});
  await page.clock.pauseAt(new Date(start.getTime() + 60_000));
  await page.evaluate(()=>window.dispatchEvent(new Event("scroll")));
  const top = await main.evaluate((node)=>node.getBoundingClientRect().top);
  await expect(header).toHaveAttribute("data-visible","true");
  await page.clock.runFor(4999);
  await expect(header).toHaveAttribute("data-visible","true");
  await page.clock.runFor(1);
  await expect(header).toHaveAttribute("data-visible","false");
  expect(await main.evaluate((node)=>node.getBoundingClientRect().top)).toBe(top);
  await page.evaluate(()=>window.scrollTo(0,300));
  await page.clock.runFor(24);
  await expect(header).toHaveAttribute("data-visible","true");
  await page.clock.runFor(5000);
  await expect(header).toHaveAttribute("data-visible","false");
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.clock.runFor(24);
  await expect(header).toHaveAttribute("data-visible","true");
  await page.clock.runFor(5000);
  await page.keyboard.press("Tab");
  await expect(header).toHaveAttribute("data-visible","true");
  await page.getByRole("button",{name:"Menu"}).click();
  await page.clock.runFor(6000);
  await expect(header).toHaveAttribute("data-visible","true");
  await page.locator("#site-menu").getByRole("link",{name:"Mission"}).click();
  await expect(page).toHaveURL(/mission$/);
  await page.goBack();
  await expect(page).toHaveURL(/writings$/);
  await page.goForward();
  await expect(page).toHaveURL(/mission$/);
  await page.getByRole("link",{name:"Mystic Mind home"}).click();
  await expect(page.getByRole("heading",{level:1})).toHaveText("Performance Coach. Writer. Speaker.");
});

test("download links deliver both approved ebook PDFs and brand links", async ({page})=>{
  await page.goto("/resources");
  await expect(page.locator("main article h3")).toHaveText([
    "The Time Series and Imagination",
    "The 5 Principles: Be in Your Desired State",
  ]);
  const links=page.getByRole("link",{name:"Download PDF",exact:true});
  await expect(links).toHaveCount(2);
  await expect(links.locator("svg")).toHaveCount(0);
  for(const link of await links.all()){
    const downloading=page.waitForEvent("download");
    await link.click();
    const download=await downloading;
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
    expect(await download.failure()).toBeNull();
  }
  await expect(page.getByRole("link",{name:"X",exact:true})).toHaveAttribute("href","https://x.com/Shawny_Shuddha");
  await expect(page.getByRole("link",{name:"Instagram",exact:true})).toHaveAttribute("href","https://www.instagram.com/kagiso_gabonamong/");
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href","/brand/favicon.svg");
});

test("testimonial portraits stay square and quotes stay below them at all sizes", async ({page})=>{
  await page.goto("/testimonials");
  const portraits = page.locator(".m-testimonials figcaption img");
  await expect(portraits).toHaveCount(3);
  for (const [width, size] of [[1440,144],[768,120],[390,96],[320,80]]) {
    await page.setViewportSize({width,height:900});
    expect(await portraits.evaluateAll((images)=>images.map((image)=>{
      const box = image.getBoundingClientRect();
      const quote = image.closest("figure").querySelector("blockquote");
      return [box.width,box.height,quote.getBoundingClientRect().top >= box.bottom];
    }))).toEqual(Array.from({length:3},()=>[size,size,true]));
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test.beforeEach(async ({ context }) => {
  await context.route(/https:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
  await context.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) => route.abort());
});

test("public routes, reference layout, contact safeguards and navigation", async ({ page }) => {
  test.setTimeout(240000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await mkdir("artifacts/mystic-mind", { recursive: true });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Performance Coach. Writer. Speaker.");
  await expect(page.getByText("Designed by Muzila Group")).toBeVisible();
  await expect(page.getByText(/Design preview/)).toHaveCount(0);
  await expect(page.getByText("Atomic Habits")).toHaveCount(0);
  await expect(page.getByText("Newsletter subscriptions are currently unavailable.")).toHaveCount(0);
  expect(await page.locator(".ambient").evaluate((element) => getComputedStyle(element, "::before").animationName)).toBe("none");

  const routes = ["/", "/writings", "/writings/game", "/books", "/recommended-books", "/resources", "/premium-store", "/events", "/about", "/mission", "/testimonials", "/privacy", "/work-with-me", "/contact"];
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByText("Writing not found.")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if ([390, 768, 1440].includes(width)) {
        const name = route === "/" ? "home" : route.slice(1).replaceAll("/", "-");
        expect(await page.locator('main img[src^="/"]').evaluateAll(async (images) => {
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
    await reference.goto(pathToFileURL(resolve("design-reference/mystic-mind-fixed-covers-and-about.html")).href);
    await reference.screenshot({ path: "artifacts/mystic-mind/" + width + "-approved-reference.png", fullPage: true });
  }
  await reference.close();
  await page.goto("/events");
  await page.getByRole("link", { name: "Enquire about this event" }).first().click();
  await expect(page.getByLabel("Subject", { exact: true })).toHaveValue(/Event enquiry:/);
  await expect(page.getByRole("button", { name: "Submit enquiry" })).toBeEnabled();
  await page.goto("/work-with-me");
  await expect(page.getByRole("radio")).toHaveCount(5);
  await page.getByRole("radio", { name: "Webinars" }).check();
  await page.getByRole("radio", { name: "Workshops" }).check();
  await expect(page.getByRole("radio", { name: "Webinars" })).not.toBeChecked();
  await expect(page.getByRole("button", { name: "Submit enquiry" })).toBeEnabled();
  await page.getByLabel("Your name").fill("Test user");
  await page.getByLabel("Email").fill("test@example.org");
  await page.getByLabel("Subject").fill("Test enquiry");
  await page.getByLabel("Message").fill("This checks the unavailable-service state.");
  await page.getByRole("button", { name: "Submit enquiry" }).click();
  await expect(page.getByRole("alert")).toContainText("unavailable");
  await expect(page.getByText("Your enquiry was received.")).toHaveCount(0);
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
  await page.getByRole("navigation", { name: "Content sections" }).getByRole("button", { name: "Recommended books", exact: true }).click();
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
  await page.getByRole("navigation", { name: "Content sections" }).getByRole("button", { name: "Recommended books", exact: true }).click();
  await page.getByRole("button", { name: /Owner selected book/ }).click();
  await expect(
    page.getByLabel("Why recommend it / book description"),
  ).toHaveValue("A personal reason for recommending this book.");
  const preview = await page.context().newPage();
  await preview.goto("/recommended-books");
  await expect(
    preview.getByRole("heading", { name: "Owner selected book" }),
  ).toBeVisible();
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
  await page.getByRole("button", { name: "Manage writings" }).click();
  const original = (await (await page.request.get("/api/content")).json()).content.articles[0];
  await page.getByRole("button", {name:new RegExp(original.title.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"))}).click();
  await expect(page.getByRole("textbox",{name:"Article text"}).locator("p").first()).toBeVisible();
  await expect(page.getByRole("button",{name:"Publish changes"})).toHaveCount(0);
  await page.getByRole("button", { name: "Add writing" }).click();
  await page.getByLabel("Title", { exact: true }).fill("A new owner writing");
  await page.getByText("URL ID (advanced)").click();
  await expect(page.getByLabel("URL ID", {exact:true})).toHaveValue("a-new-owner-writing");
  await page.getByLabel("URL ID", {exact:true}).fill("owner-test-writing");
  const editor = page.getByRole("textbox", {name:"Article text"});
  await editor.pressSequentially("First real paragraph.");
  await editor.press("Enter");
  await page.getByRole("button",{name:"Bold",exact:true}).click();
  await editor.pressSequentially("Second real paragraph.");
  await page.getByRole("button", {name:"Preview",exact:true}).click();
  await expect(page.getByLabel("Article preview").locator("strong")).toHaveText("Second real paragraph.");
  await page.getByRole("button", {name:"Preview",exact:true}).click();
  await page.getByRole("button",{name:"Save draft",exact:true}).click();
  await expect(page.getByText("Draft saved in this browser. Changes are unpublished.")).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Manage writings" }).click();
  await page.getByRole("button",{name:/A new owner writing/}).click();
  await expect(editor.locator("strong")).toHaveText("Second real paragraph.");
  await page
    .getByRole("button", { name: "Choose cover book", exact: true })
    .click();
  await page.getByRole("button", { name: "Publish changes" }).click();
  await expect(page.getByRole("status")).toContainText("Published.");
  const response = await page.request.get("/api/content");
  expect((await response.json()).content.articles.find(item=>item.id===original.id)).toEqual(original);
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
  await page.getByRole("button", { name: "Manage writings" }).click();
  await page.getByRole("button", { name: /A new owner writing/ }).click();
  await expect(editor.locator("p")).toHaveText(["First real paragraph.","Second real paragraph."]);
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
  await page.setViewportSize({ width: 768, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "artifacts/admin-tablet.png", fullPage:true });
  await page.getByRole("button", { name: "Site and author" }).click();
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
