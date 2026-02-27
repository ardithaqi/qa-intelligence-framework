import { test } from "../../../src/core/testHooks";
import { expect } from "@playwright/test";

test("forced regression", async ({ page }) => {
    await page.goto("https://www.saucedemo.com");
});

test("flaky regression", async ({ page }) => {
    await page.goto("https://www.saucedemo.com");
    await page.locator("#user-name").fill("standard_user");
    await page.locator("#password").fill("secret_sauce");
    await page.locator("#login-button").click();
    await expect(page).toHaveURL(/inventory/);
});

test("forced regression", async ({ page }) => {
    let firstRun = true;

    test("flaky example", async () => {
        if (firstRun) {
            firstRun = false;
            expect(1).toBe(2);
        }
        expect(1).toBe(1);
    });
});