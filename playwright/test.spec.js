const { test, expect } = require("@playwright/test");

test("first playwright test", async ({ page }) => {
  await page.goto("https://dictionary.telemetry.mozilla.org");
  await expect(page).toHaveTitle(/Glean Dictionary/);
});
