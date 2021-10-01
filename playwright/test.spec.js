const { test, expect } = require("@playwright/test");

test("first playwright test", async ({ page }) => {
  await page.goto("http://localhost:5000");
  await expect(page).toHaveTitle(/Glean Dictionary/);
});
