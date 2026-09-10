import { test, expect } from "../../../src/core/baseTest";
import LoginPage from "../../../src/examples/saucedemo/pages/loginPage";

test("inventory page should show 6 products", async ({ page }) => {
  const login = new LoginPage(page);

  await page.goto("https://www.saucedemo.com/");

  await page.locator("#user-name").fill("standard_user");
  await page.locator("#password").fill("secret_sauce");
  await page.locator("#login-button").click();

  await expect(page).toHaveURL(/inventory/);

  const items = await page.locator(".inventory_item").count();
  expect(items).toBe(6);
});