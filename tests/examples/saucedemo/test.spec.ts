import { test, expect } from "@playwright/test";

test("forced regression", async () => {
    expect(1).toBe(2);
});