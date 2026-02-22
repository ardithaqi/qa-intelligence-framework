import { test } from "../../../src/core/baseTest";
import { step } from "../../../src/core/steps";
import LoginPage from "../../../src/examples/saucedemo/pages/loginPage";

test("smoke @smoke user can login", async ({ page, logStep }) => {
  const login = new LoginPage(page);

  await step("Open login page", async () => {
  await logStep("Open login page");
  await login.open();
  })

  await step("Login", async () => {
  await logStep("Login with standard_user");
  await login.login("standard_user", "secret_sauce");

  })
  await step("Assert logged in", async () => {
  await logStep("Assert inventory page");
  await login.assertLoggedIn();
  })
  
});