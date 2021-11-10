const config = {
  webServer: {
    // run sirv in single-page application mode so non-root URLs (e.g. /apps/fenix/pings/metrics) work
    command: "npm run start -- --single",
    port: 5000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  testDir: "playwright",
};

module.exports = config;
