import { test, expect } from "@playwright/test";
import LoginPage from "../../../src/examples/saucedemo/pages/loginPage";

test("inventory page should show 6 products", async ({ page }) => {
  const login = new LoginPage(page);

  await page.goto("https://www.saucedemo.com/");

  await page.locator("#user-name").fill("standard_user");
  await page.locator("#password").fill("secret_sauce");
  await page.locator("#login-button").click();

  // Wait for inventory page
  await expect(page).toHaveURL(/inventory/);

  const items = await page.locator(".inventory_item").count();

  // Intentional failure (SauceDemo has 6 items)
  expect(items).toBe(5);
});