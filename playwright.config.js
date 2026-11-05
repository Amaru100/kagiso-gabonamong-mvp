import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.js",
  workers: 1,
  timeout: 90000,
  use: {
    baseURL: "http://127.0.0.1:5174",
    viewport: { width: 1440, height: 900 },
    trace: "retain-on-failure",
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
  },
  webServer: {
    command: "node tests/start-server.mjs",
    url: "http://127.0.0.1:5174",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
