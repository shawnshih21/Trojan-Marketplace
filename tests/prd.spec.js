import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
async function verify(page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Send code", exact: true }).click();
  for (let n = 0; n < 6; n++)
    await page
      .getByRole("textbox", {
        name: `Verification digit ${n + 1}`,
        exact: true,
      })
      .fill("248613"[n]);
  await page.getByRole("button", { name: "Continue to marketplace" }).click();
}
async function deskPickup(page) {
  await page.getByRole("button", { name: "Activity", exact: true }).click();
  await page
    .getByRole("button", { name: "View pickup details", exact: true })
    .click();
}
async function openStudy(page) {
  await page.getByRole("button", { name: "Profile", exact: true }).click();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page
    .getByRole("button", { name: "Prototype task testing", exact: true })
    .click();
}
test("deadline and defect disclosures are validated, saved, previewed and shown consistently", async ({
  page,
}) => {
  await verify(page);
  await page.getByRole("button", { name: "Profile", exact: true }).click();
  await page
    .locator(".compact-card")
    .filter({ hasText: "Oak 3-tier bookshelf" })
    .click();
  await page
    .getByLabel("Defects & wear", { exact: true })
    .selectOption("disclosed");
  await page
    .getByLabel("Describe defects", { exact: true })
    .fill("Visible chip on the top-right corner.");
  await page.getByLabel("Sell-by deadline", { exact: true }).fill("2026-10-25");
  await page
    .getByRole("button", { name: "Preview listing", exact: true })
    .click();
  await expect(
    page.getByText("Visible chip on the top-right corner.", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".deadline-card")).toContainText(
    "October 25, 2026",
  );
  await page
    .getByRole("button", { name: "Back to editing", exact: true })
    .click();
  await page.getByLabel("Sell-by deadline", { exact: true }).fill("2026-10-23");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("on or before");
  await expect(
    page.getByRole("heading", { name: "Edit Listing", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Sell-by deadline", { exact: true }).fill("2026-10-25");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.locator(".deadline-card")).toContainText(
    "October 25, 2026",
  );
  await page.reload();
  await page.getByRole("button", { name: "Profile", exact: true }).click();
  await page
    .locator(".compact-card")
    .filter({ hasText: "Oak 3-tier bookshelf" })
    .click();
  await expect(
    page.getByLabel("Describe defects", { exact: true }),
  ).toHaveValue("Visible chip on the top-right corner.");
});
test("area filters apply to cards and geographic pins, zoom/reset works, and public maps omit exact meeting points", async ({
  page,
}) => {
  await verify(page);
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await page
    .getByLabel("Pickup area", { exact: true })
    .selectOption("USC Village");
  await page.getByRole("button", { name: "Show results", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await expect(page.locator(".product-card")).toContainText("Reserved");
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await expect(page.locator(".map-price")).toHaveCount(1);
  await expect(page.locator(".campus-map")).toContainText("Vermont Ave");
  await expect(page.locator(".campus-map")).toContainText("W Adams Blvd");
  await expect(page.locator(".campus-map")).not.toContainText(
    "outdoor seating",
  );
  const svg = page.locator(".campus-map>svg");
  const initial = await svg.getAttribute("viewBox");
  await page.getByRole("button", { name: "Zoom in map", exact: true }).click();
  await expect(svg).not.toHaveAttribute("viewBox", initial);
  await page
    .getByRole("button", { name: "Reset map view", exact: true })
    .click();
  await expect(svg).toHaveAttribute("viewBox", initial);
  const pin = page.getByRole("button", { name: "$45", exact: true });
  const before = await pin.boundingBox();
  await pin.hover();
  expect(await pin.boundingBox()).toEqual(before);
  await pin.click();
  await expect(page.locator(".main-item .pill-row")).toContainText("Reserved");
  await expect(page.locator(".campus-map")).not.toContainText(
    "outdoor seating",
  );
});
test("pickup proposal records all terms, cannot complete early, and cancellation restores availability", async ({
  page,
}) => {
  await verify(page);
  await page.getByRole("button", { name: "Chairs", exact: true }).click();
  await page.locator(".product-copy").click();
  await page
    .getByRole("button", { name: "Request to reserve", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("Propose a pickup");
  await page
    .getByLabel("Proposed public meeting point")
    .fill("Public seating beside W 27th Street entrance");
  await page
    .getByRole("button", { name: "Send pickup proposal", exact: true })
    .click();
  await expect(page.locator(".exact-meeting")).toContainText("W 27th Street");
  await expect(
    page.getByRole("button", { name: "Mark as picked up", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", {
      name: "Demo: simulate seller confirmation",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", { name: "Mark as picked up", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Cancel pickup", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Cancel pickup", exact: true })
    .click();
  await page.getByRole("button", { name: "Go back", exact: true }).click();
  await expect(page.locator(".main-item .pill-row")).toContainText("Available");
});
test("handoff requires two responses, issues remain unresolved, resolution requires both", async ({
  page,
}) => {
  await verify(page);
  await deskPickup(page);
  await page
    .getByRole("button", { name: "Mark as picked up", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm my handoff", exact: true })
    .click();
  await expect(page.locator(".confirmation-box")).toContainText(
    "Awaiting handoff confirmation",
  );
  await page
    .getByRole("button", { name: "Report a transaction issue", exact: true })
    .click();
  await page
    .getByLabel("Issue type", { exact: true })
    .selectOption("Condition or defects");
  await page.getByLabel("Severity", { exact: true }).selectOption("High");
  await page
    .getByLabel("What happened?", { exact: true })
    .fill("A damaged leg needs repair before we complete the handoff.");
  await page
    .getByRole("button", { name: "Record transaction issue", exact: true })
    .click();
  await expect(page.locator(".transaction-issue.open")).toContainText(
    "Unresolved",
  );
  await expect(
    page.getByRole("button", { name: "Mark as picked up", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Review resolution", exact: false })
    .click();
  await page
    .getByLabel("Agreed resolution", { exact: true })
    .fill("Seller repaired the leg and buyer reviewed it.");
  await page
    .getByRole("button", { name: "Acknowledge resolution", exact: true })
    .click();
  await expect(page.locator(".transaction-issue.open")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Review resolution", exact: false })
    .click();
  await page
    .getByRole("button", {
      name: "Demo: seller acknowledges resolution",
      exact: true,
    })
    .click();
  await expect(page.locator(".transaction-issue.resolved")).toHaveCount(1);
  await expect(page.locator(".confirmation-box")).toContainText(
    "Pickup confirmed",
  );
  await page
    .getByRole("button", { name: "Mark as picked up", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm my handoff", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Demo: confirm seller handoff", exact: true })
    .click();
  await expect(page.locator(".confirmation-box")).toContainText("Completed");
  await page.getByRole("button", { name: "Go back", exact: true }).click();
  await expect(page.locator(".purchase-card")).toHaveCount(0);
  await expect(
    page.locator(".compact-card").filter({ hasText: "IKEA MICKE desk" }),
  ).toContainText("Completed");
});
test("opt-in task logging persists across the workflow and exports buyer/seller research fields", async ({
  page,
}) => {
  await verify(page);
  await openStudy(page);
  await expect(
    page.getByRole("button", { name: "Start task", exact: true }),
  ).toBeDisabled();
  await page.getByRole("checkbox").check();
  await page.getByLabel("Participant code", { exact: true }).fill("BUYER-01");
  await page.getByLabel("Task", { exact: true }).selectOption("find");
  await page.getByRole("button", { name: "Start task", exact: true }).click();
  await expect(page.locator(".study-running")).toContainText("BUYER-01");
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await page.getByRole("button", { name: "Browse", exact: true }).click();
  await page.reload();
  await openStudy(page);
  await expect(page.locator(".study-running")).toContainText("BUYER-01");
  await page.getByLabel("Assistance requests", { exact: true }).fill("0");
  await page.getByLabel("Confidence (1–5)", { exact: true }).selectOption("4");
  await page
    .getByLabel("Missing information", { exact: true })
    .fill("Would like to know elevator access.");
  await page
    .getByRole("button", { name: "Finish and save result", exact: true })
    .click();
  await expect(page.locator(".study-summary")).toContainText(
    "1/1 attempts completed unassisted (100%)",
  );
  await expect(page.locator(".study-panel")).toContainText(
    "1 attempts · 1 participants",
  );
  const event = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export task results (CSV)", exact: true })
    .click();
  const download = await event;
  expect(download.suggestedFilename()).toBe(
    "trojan-prototype-task-results.csv",
  );
  const csv = await fs.readFile(await download.path(), "utf8");
  expect(csv).toContain("BUYER-01");
  expect(csv).toContain("durationSeconds");
  expect(csv).toContain("elevator access");
  expect(csv).toContain('"buyer"');
});
