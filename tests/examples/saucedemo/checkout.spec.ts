import { test, expect } from "@playwright/test";
import LoginPage from "../../../src/examples/saucedemo/pages/loginPage";

test("user can checkout", async ({ page }) => {
    const login = new LoginPage(page);

    await page.goto("https://www.saucedemo.com/");

    await page.locator("#user-name").fill("standard_user");
    await page.locator("#password").fill("secret_sauce");
    await page.locator("#login-button").click();

    // Wait for inventory page
    await expect(page).toHaveURL(/inventory/);

    await page.locator(".inventory_item").first().click();

    await page.locator("[data-test='add-to-cart-sauce-labs-backpack']").click();

    await page.locator("[data-test='add-to-cart-sauce-labs-bike-light']").click();

    await page.locator("[data-test='add-to-cart-sauce-labs-bolt-t-shirt']").click();

    await page.locator("[data-test='add-to-cart-sauce-labs-fleece-jacket']").click();
});