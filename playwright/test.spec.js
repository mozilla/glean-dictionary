const { test, expect } = require("@playwright/test");

test("first playwright test", async ({ page }) => {
  await page.goto("http://localhost:5000");
  await expect(page).toHaveTitle(/Glean Dictionary/);
});

test("metrics ping page", async ({ page }) => {
  await page.goto("http://localhost:5000/apps/fenix/pings/metrics");
  await expect(page).toHaveTitle("metrics | fenix");

  // we expect a selector starting with our looker URL, directing to an explore
  // containing the word "metrics" corresponding to the ping
  await expect(
    page.locator('a[href^="https://mozilla.cloud.looker"]')
  ).toContainText("metrics");
});
