import { test, expect } from "qa-intelligence/playwright";

/**
 * Deterministic flaky demo: fails on attempt 0, passes on retry (PW_RETRIES=1).
 * Remove or skip before merging if you only use this for local/CI validation.
 */
test("flaky demo — fails once then passes on retry", async ({}, testInfo) => {
  expect(testInfo.retry).toBeGreaterThan(0);
});
