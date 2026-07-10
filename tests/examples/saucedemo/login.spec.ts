import { test, expect } from "qa-intelligence/playwright";
import { step } from "qa-intelligence/playwright/steps";
import LoginPage from "../../../src/examples/saucedemo/pages/loginPage";

test("user can login", async ({ page }) => {
  const login = new LoginPage(page);

  await step("Open login page", async () => {
    await login.open();
  });

  await step("Login", async () => {
    await login.login("standard_user", "secret_sauce");
  });

  await step("Assert logged in", async () => {
    await login.assertLoggedIn();
  });
});
