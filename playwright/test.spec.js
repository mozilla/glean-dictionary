const { test, expect } = require("@playwright/test");

test("first playwright test", async ({ page }) => {
  await page.goto("http://localhost:5555");
  await expect(page).toHaveTitle(/Glean Dictionary/);
});

test("metrics ping page", async ({ page }) => {
  await page.goto("http://localhost:5555/apps/fenix/pings/metrics");
  await expect(page).toHaveTitle("metrics | Firefox for Android");

  // we expect a selector starting with our looker URL, directing to an explore
  // containing the word "metrics" corresponding to the ping
  await expect(
    page.locator('a[href^="https://mozilla.cloud.looker"]')
  ).toContainText("metrics");
});

test("activation id metric page", async ({ page }) => {
  await page.goto(
    "http://localhost:5555/apps/fenix/metrics/activation_activation_id"
  );
  await expect(page).toHaveTitle(
    "activation.activation_id | Firefox for Android"
  );

  // we expect a selector starting with our looker URL, directing to an explore
  // containing the word "metrics" corresponding to the metric
  await expect(
    page.locator('a[href^="https://mozilla.cloud.looker"]').last()
  ).toContainText("activation_id");
});

test("org.mozilla.fenix app id page", async ({ page }) => {
  await page.goto("http://localhost:5555/apps/fenix/app_ids/org_mozilla_fenix");
  await expect(page).toHaveTitle("org.mozilla.fenix | Firefox for Android");
});

test("activation table page", async ({ page }) => {
  await page.goto(
    "http://localhost:5555/apps/fenix/app_ids/org_mozilla_fenix/tables/activation"
  );
  await expect(page).toHaveTitle(
    "org_mozilla_fenix.activation | org.mozilla.fenix | Firefox for Android"
  );
});
