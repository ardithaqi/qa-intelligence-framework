import { test, expect } from "qa-intelligence/playwright";

/**
 * Intermittent demo for Flaky Watchlist (Scenario E).
 * Fails ~60% of runs — re-run CI 4–6 times on the same PR.
 * Remove before merging to main.
 */
test("intermittent demo for watchlist", async () => {
  expect(Math.random()).toBeLessThan(0.4);
});
