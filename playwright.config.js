const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:4174",
    viewport: { width: 1280, height: 720 },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "python -m http.server 4174",
    url: "http://127.0.0.1:4174",
    reuseExistingServer: !process.env.CI,
    timeout: 10_000,
  },
});
