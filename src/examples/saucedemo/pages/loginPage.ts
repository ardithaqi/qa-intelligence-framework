import { BasePage } from "../../../core/basePage";
import { expect } from "@playwright/test";

export default class LoginPage extends BasePage {
  private username = this.page.locator('[data-test="username"]');
  private password = this.page.locator('[data-test="password"]');
  private loginBtn = this.page.locator('[data-test="login-button"]');

  async open() {
    await this.navigate("/");
  }

  async login(user: string, pass: string) {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.loginBtn.click();
  }

  async assertLoggedIn() {
    await expect(this.page).toHaveURL(/inventory/);
  }
}