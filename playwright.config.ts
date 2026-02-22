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

  fullyParallel: true,
  workers: env.PW_WORKERS,
  retries: env.PW_RETRIES,

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