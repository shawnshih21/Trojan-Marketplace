import { test, expect } from "@playwright/test";
const verify = async (page) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Send code", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Verification digit 1", exact: true })
    .fill("2");
  for (let n = 1; n < 6; n++)
    await page
      .getByRole("textbox", {
        name: `Verification digit ${n + 1}`,
        exact: true,
      })
      .fill("248613"[n]);
  await page.getByRole("button", { name: "Continue to marketplace" }).click();
  await expect(
    page.getByRole("heading", { name: "Trojan Marketplace", exact: true }),
  ).toBeVisible();
};
test("verification is the first screen, rejects an invalid code, persists sign-in, and signs out", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Welcome, Trojan" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue to marketplace" }).click();
  await expect(page.getByRole("alert")).toContainText("Send code");
  await page.getByRole("button", { name: "Send code", exact: true }).click();
  await page.getByRole("button", { name: "Continue to marketplace" }).click();
  await expect(page.getByRole("alert")).toContainText("6 digits");
  await verify(page);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Trojan Marketplace", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Profile", exact: true }).click();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome, Trojan" }),
  ).toBeVisible();
});
test("browse categories, filters, map, gallery and saved items work", async ({
  page,
}) => {
  await verify(page);
  await page.getByRole("button", { name: "Chairs", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await page.getByRole("slider", { name: "Maximum price" }).fill("35");
  await page.getByRole("button", { name: "Show results" }).click();
  await expect(page.locator(".product-card").first()).toContainText(
    "Study chair",
  );
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await expect(page.locator(".map-price")).toHaveCount(3);
  await page.getByRole("button", { name: "$25", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Item Details" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next photo", exact: true }).click();
  await expect(page.locator(".photo-count")).toContainText("2/2");
  await page.getByRole("button", { name: "Save listing", exact: true }).click();
  await page.getByRole("button", { name: "Go back", exact: true }).click();
  await page.getByRole("button", { name: "Activity", exact: true }).click();
  await page.getByRole("button", { name: "View all", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Saved Items" }),
  ).toBeVisible();
  await expect(page.locator(".saved-row")).toHaveCount(3);
});
test("listings can be edited, previewed, published, marked sold and deleted", async ({
  page,
}) => {
  await verify(page);
  await page.getByRole("button", { name: "Profile", exact: true }).click();
  await page
    .locator(".compact-card")
    .filter({ hasText: "Oak 3-tier bookshelf" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Edit Listing" }),
  ).toBeVisible();
  await page
    .getByLabel("Listing title", { exact: true })
    .fill("Updated bookshelf");
  await page
    .getByRole("button", { name: "Preview listing", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Listing Preview" }),
  ).toBeVisible();
  await expect(
    page
      .locator(".detail-name")
      .getByRole("heading", { name: "Updated bookshelf", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Back to editing", exact: true })
    .click();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "Profile", exact: true }).click();
  await expect(page.locator(".compact-card")).toContainText(
    "Updated bookshelf",
  );
  await page.getByRole("button", { name: "Activity", exact: true }).click();
  await page.getByRole("button", { name: "Manage", exact: true }).click();
  await page.getByRole("button", { name: "Mark sold", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Mark available", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Delete Updated bookshelf", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Delete listing", exact: true })
    .click();
  await expect(page.locator(".managed-listing")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Create a listing", exact: true })
    .click();
  await page
    .getByLabel("Listing title", { exact: true })
    .fill("New student chair");
  await page.getByLabel("Price", { exact: true }).fill("20");
  for (const n of ["width", "depth", "height"])
    await page.getByRole("textbox", { name: n, exact: true }).fill("24");
  await page
    .getByLabel("Description", { exact: true })
    .fill("A comfortable chair for studying.");
  await page
    .getByLabel("Approximate pickup area", { exact: true })
    .fill("USC Village");
  await page
    .getByLabel("Upload furniture photos")
    .setInputFiles("public/images/chair.jpg");
  await expect(page.locator(".edit-photo")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Publish listing", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Item Details", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".detail-name")).toContainText("New student chair");
});
test("inbox search, local messages, attachment and demo reply work", async ({
  page,
}) => {
  await verify(page);
  await page.getByRole("button", { name: "Inbox", exact: true }).click();
  await expect(page.getByText("2 unread", { exact: true })).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search messages", exact: true })
    .fill("Alex");
  await expect(page.locator(".conversation")).toHaveCount(1);
  await page.locator(".conversation").click();
  await expect(page.locator(".chat-person")).toBeVisible();
  await page
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("See you Friday!");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(
    page.getByText("See you Friday!", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Chat actions", exact: true }).click();
  await page.getByRole("button", { name: "Simulate a seller reply" }).click();
  await expect(page.getByText(/Thanks for checking in!/)).toBeVisible();
  await page
    .locator("input[type=file]")
    .setInputFiles("public/images/chair.jpg");
  await expect(page.locator(".attachment-preview img")).toBeVisible();
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByAltText("Shared in chat")).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Inbox", exact: true }).click();
  await page
    .locator(".conversation")
    .filter({ hasText: "Alex Martinez" })
    .click();
  await expect(
    page.getByText("See you Friday!", { exact: true }),
  ).toBeVisible();
});
test("pickup reschedule hides private location, seller simulation restores it, calendar exports and cancel works", async ({
  page,
}) => {
  await verify(page);
  await page.getByRole("button", { name: "Activity", exact: true }).click();
  await page
    .getByRole("button", { name: "View pickup details", exact: true })
    .click();
  await expect(page.locator(".exact-meeting")).toContainText("Hoover St");
  await page.getByRole("button", { name: "Reschedule", exact: true }).click();
  await page.getByLabel("Pickup date", { exact: true }).fill("2026-10-24");
  await page
    .getByLabel("Proposed public meeting point")
    .fill("USC Village fountain");
  await page.getByRole("button", { name: "Propose new pickup" }).click();
  await expect(page.locator(".exact-meeting")).toContainText(
    "hidden until confirmation",
  );
  await page
    .getByRole("button", {
      name: "Demo: simulate seller confirmation",
      exact: true,
    })
    .click();
  await expect(page.locator(".exact-meeting")).toContainText(
    "USC Village fountain",
  );
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Add to calendar", exact: true })
    .click();
  expect((await download).suggestedFilename()).toBe("trojan-pickup.ics");
  await page.getByRole("button", { name: "Reminder on", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Remind me", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Cancel pickup", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Cancel pickup", exact: true })
    .click();
  await expect(
    page.getByText("Pickup canceled", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Request a new pickup", exact: true })
    .click();
  await expect(
    page.getByText("Pickup requested", { exact: true }),
  ).toBeVisible();
});
test("complete a purchase, leave a review, edit profile and reset demo", async ({
  page,
}) => {
  await verify(page);
  await page.getByRole("button", { name: "Activity", exact: true }).click();
  await page
    .getByRole("button", { name: "View pickup details", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Mark as picked up", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm pickup completed", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Your review", exact: true })
    .fill("Easy pickup, lovely desk!");
  await page
    .getByRole("button", { name: "Submit review", exact: true })
    .click();
  await page
    .getByRole("button", { name: "View your review", exact: true })
    .click();
  await expect(
    page.getByText("Easy pickup, lovely desk!", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page.getByRole("button", { name: "Go back", exact: true }).click();
  await page.getByRole("button", { name: "Profile", exact: true }).click();
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  await page.getByLabel("Name", { exact: true }).fill("Maya Trojan");
  await page.getByRole("button", { name: "Save profile", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Maya Trojan", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page
    .getByRole("button", { name: "Reset demo data", exact: true })
    .click();
  await page.getByRole("button", { name: "Reset demo", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome, Trojan", exact: true }),
  ).toBeVisible();
});
test("desktop retains the supplied mobile format without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto("/");
  expect(
    await page
      .locator(".phone")
      .evaluate((e) => Math.round(e.getBoundingClientRect().width)),
  ).toBe(390);
  await verify(page);
  await page.setViewportSize({ width: 320, height: 750 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await expect(page.locator(".bottom-nav")).toBeVisible();
});

test("selling pickup uses buyer confirmation and notifications open their targets", async ({
  page,
}) => {
  await verify(page);
  await page.getByRole("button", { name: "Inbox", exact: true }).click();
  await page.locator(".conversation").filter({ hasText: "Priya Shah" }).click();
  await page.getByRole("button", { name: "Chat actions", exact: true }).click();
  await page
    .getByRole("button", { name: "Schedule or view pickup", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Demo: simulate buyer confirmation",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Demo: simulate buyer confirmation",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Pickup confirmed", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Go back", exact: true }).click();
  await page.getByRole("button", { name: "Go back", exact: true }).click();
  await page.getByRole("button", { name: "Activity", exact: true }).click();
  await page.getByRole("button", { name: "Selling", exact: true }).click();
  await expect(page.locator(".purchase-card")).toContainText(
    "Oak 3-tier bookshelf",
  );
  await page
    .getByRole("button", { name: "Notifications", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Alex confirmed your Friday pickup.",
      exact: false,
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Pickup Details", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".pickup-item-card")).toContainText(
    "IKEA MICKE desk",
  );
});

test("new conversation and seller verification/reviews are reachable", async ({
  page,
}) => {
  await verify(page);
  await page.getByRole("button", { name: "Inbox", exact: true }).click();
  await page
    .getByRole("button", { name: "New conversation", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .locator(".compact-card")
    .filter({ hasText: "Full bed frame" })
    .click();
  await expect(page.locator(".chat-item")).toContainText("Full bed frame");
  await page
    .getByRole("button", { name: "Conversation information", exact: true })
    .click();
  await page.getByRole("button", { name: /View Priya’s verification/ }).click();
  await expect(
    page.getByRole("heading", { name: "Priya Shah", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /See all/ }).click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "Seller reviews", exact: true }),
  ).toBeVisible();
});
