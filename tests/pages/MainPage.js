export class MainPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page
  }

  get userAvatar() {
    return this.page.getByText(/jane doe/i)
  }

  get logoutItem() {
    return this.page.getByRole('menuitem', { name: /logout/i })
  }

  async openUserMenu() {
    await this.userAvatar.click()
  }

  async logout() {
    await this.openUserMenu()
    await this.logoutItem.click()
  }
}
