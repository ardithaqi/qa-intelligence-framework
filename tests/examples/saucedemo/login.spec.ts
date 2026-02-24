import { test } from "../../../src/core/baseTest";
import { step } from "../../../src/core/steps";
import LoginPage from "../../../src/examples/saucedemo/pages/loginPage";
import { expect } from "../../../src/core/baseTest";

test("user can login", async ({ page }) => {
  expect(1).toBe(2);
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