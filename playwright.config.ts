import { defineConfig } from "@playwright/test";
import { env } from "./src/config/env";

export default defineConfig({
  testDir: "./tests",

  projects: [
    {
      name: "smoke",
      testMatch: /tests\/smoke\/.*\.spec\.ts/,
    },
    {
      name: "regression",
      testMatch: /tests\/regression\/.*\.spec\.ts/,
    },
    {
      name: "examples",
      testMatch: /tests\/examples\/.*\.spec\.ts/,
    },
  ],

  timeout: 30_000, // max time per test
  expect: {
    timeout: 5_000, // max time per assertion
  },

  fullyParallel: true,

  workers: Number(process.env.PW_WORKERS ?? 2),
  retries: Number(process.env.PW_RETRIES ?? 1),
  globalTeardown: require.resolve("./src/core/globalTeardown"),
  use: {
    baseURL: env.BASE_URL,
    headless: env.HEADLESS,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],
});