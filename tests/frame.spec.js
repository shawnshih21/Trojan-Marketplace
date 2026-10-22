import { test, expect } from "@playwright/test";

async function verify(page) {
  await page.getByRole("button", { name: "Send code", exact: true }).click();
  for (const [index, digit] of [..."248613"].entries()) {
    await page
      .getByRole("textbox", {
        name: `Verification digit ${index + 1}`,
        exact: true,
      })
      .fill(digit);
  }
  await page.getByRole("button", { name: "Continue to marketplace" }).click();
}

for (const viewport of [
  { width: 1280, height: 1100 },
  { width: 440, height: 956 },
  { width: 390, height: 844 },
  { width: 320, height: 600 },
  { width: 1280, height: 800 },
]) {
  test(`all nine screens share one frame at ${viewport.width}×${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const expectedWidth = Math.min(440, viewport.width);
    const expectedHeight = Math.min(
      956,
      viewport.height - (viewport.width >= 600 ? 48 : 0),
    );
    const initial = await page.locator(".phone").boundingBox();
    const seen = new Set();
    const checkFrame = async (screen) => {
      await expect(page.locator(".phone")).toHaveAttribute(
        "data-screen",
        screen,
      );
      const frame = await page.locator(".phone").boundingBox();
      expect(frame).toEqual(initial);
      expect(frame.width).toBe(expectedWidth);
      expect(frame.height).toBe(expectedHeight);
      const status = await page.locator(".status-bar").boundingBox();
      const home = await page.locator(".home-indicator").boundingBox();
      expect(status.y).toBe(frame.y);
      expect(home.y + home.height).toBe(frame.y + frame.height);
      expect(
        await page.evaluate(() => ({
          height: document.documentElement.scrollHeight,
          width: document.documentElement.scrollWidth,
          scroll: window.scrollY,
        })),
      ).toEqual({ height: viewport.height, width: viewport.width, scroll: 0 });
      if (await page.locator(".bottom-nav").count()) {
        const nav = await page.locator(".bottom-nav").boundingBox();
        expect(nav.y + nav.height).toBe(home.y);
      }
      seen.add(screen);
    };

    await checkFrame("verify");
    await verify(page);
    await checkFrame("browse");
    await page
      .locator(".product-card")
      .filter({ hasText: "IKEA MICKE desk" })
      .locator(".product-copy")
      .click();
    await checkFrame("detail");
    const scroll = page.locator(".phone-scroll");
    expect(
      await scroll.evaluate((e) => e.scrollHeight > e.clientHeight),
    ).toBeTruthy();
    await page
      .getByRole("button", { name: "View reservation", exact: true })
      .scrollIntoViewIfNeeded();
    expect(await scroll.evaluate((e) => e.scrollTop)).toBeGreaterThan(0);
    await checkFrame("detail");
    await page.getByRole("button", { name: "Go back", exact: true }).click();
    await page.getByRole("button", { name: "Profile", exact: true }).click();
    await checkFrame("profile");
    await page
      .locator(".compact-card")
      .filter({ hasText: "Oak 3-tier bookshelf" })
      .click();
    await checkFrame("edit");
    await page
      .getByRole("button", { name: "Save changes", exact: true })
      .scrollIntoViewIfNeeded();
    expect(await scroll.evaluate((e) => e.scrollTop)).toBeGreaterThan(0);
    await checkFrame("edit");
    await page.getByRole("button", { name: "Go back", exact: true }).click();
    await page.getByRole("button", { name: "Inbox", exact: true }).click();
    await checkFrame("inbox");
    await page
      .locator(".conversation")
      .filter({ hasText: "Alex Martinez" })
      .click();
    await checkFrame("chat");
    await page.getByRole("button", { name: "Go back", exact: true }).click();
    await page.getByRole("button", { name: "Activity", exact: true }).click();
    await checkFrame("activity");
    await page
      .getByRole("button", { name: "View pickup details", exact: true })
      .click();
    await checkFrame("pickup");
    await page
      .getByRole("button", { name: "Cancel pickup", exact: true })
      .scrollIntoViewIfNeeded();
    await checkFrame("pickup");
    await page.getByRole("button", { name: "Reschedule", exact: true }).click();
    const sheet = await page.getByRole("dialog").boundingBox();
    expect(sheet.x).toBe(initial.x);
    expect(sheet.width).toBe(initial.width);
    expect(sheet.y).toBeGreaterThanOrEqual(initial.y + 44);
    expect(sheet.y + sheet.height).toBeLessThanOrEqual(
      initial.y + initial.height,
    );
    await page
      .getByRole("button", { name: "Propose new pickup", exact: true })
      .scrollIntoViewIfNeeded();
    await checkFrame("pickup");
    expect(seen.size).toBe(9);
  });
}

test("chat scrolls messages while keeping its header and composer in the phone frame", async ({
  page,
}) => {
  await page.goto("/");
  await verify(page);
  await page.getByRole("button", { name: "Inbox", exact: true }).click();
  await page
    .locator(".conversation")
    .filter({ hasText: "Alex Martinez" })
    .click();
  const header = await page.locator(".chat-top").boundingBox();
  const composer = await page.locator(".chat-input").boundingBox();
  await page
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("A longer message about coordinating the pickup. ".repeat(70));
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  const thread = page.locator(".message-thread");
  expect(
    await thread.evaluate((e) => e.scrollHeight > e.clientHeight),
  ).toBeTruthy();
  await thread.evaluate((e) => e.scrollTo(0, 0));
  expect(await page.locator(".chat-top").boundingBox()).toEqual(header);
  expect(await page.locator(".chat-input").boundingBox()).toEqual(composer);
  const frame = await page.locator(".phone").boundingBox();
  expect(composer.y + composer.height).toBeLessThanOrEqual(
    frame.y + frame.height - 17,
  );
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});
