const config = {
  webServer: {
    command: "npm run start",
    port: 5000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  testDir: "playwright",
};

module.exports = config;
