export class UsersPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  // ===== НАВИГАЦИЯ =====

  async goto() {
    await this.page.getByRole('menuitem', { name: /^users$/i }).click();
    await this.page.getByText(/^email$/i).first().waitFor();
  }

  // ===== СПИСОК =====

  rowByEmail(email) {
    return this.page.getByRole('row', { name: new RegExp(email, 'i') });
  }

  async expectUserInList({ email, firstName, lastName }, expect) {
    const row = this.rowByEmail(email);
    await expect(row).toBeVisible();

    if (firstName) {
      await expect(
        row.getByText(new RegExp(`^${firstName}$`, 'i')),
      ).toBeVisible();
    }

    if (lastName) {
      await expect(
        row.getByText(new RegExp(`^${lastName}$`, 'i')),
      ).toBeVisible();
    }
  }

  // ===== КНОПКИ НА СПИСКЕ =====

  get createButton() {
    return this.page.getByRole('link', { name: /^create$/i });
  }

  get selectAllCheckbox() {
    return this.page.locator('thead input[type="checkbox"]');
  }

  get bulkDeleteButton() {
    return this.page.getByRole('button', { name: /^delete$/i });
  }

  // ===== ФОРМА СОЗДАНИЯ/РЕДАКТИРОВАНИЯ =====

  get emailInput() {
    return this.page.getByLabel(/email/i);
  }

  get firstNameInput() {
    return this.page.getByLabel(/first name/i);
  }

  get lastNameInput() {
    return this.page.getByLabel(/last name/i);
  }

  get saveButton() {
    return this.page.getByRole('button', { name: /^save$/i });
  }

  get deleteButton() {
    return this.page.getByRole('button', { name: /^delete$/i });
  }

  async openCreateForm() {
    await this.createButton.click();
    await this.emailInput.waitFor();
  }

  async openUserForEdit(email) {
    const row = this.rowByEmail(email);
    await row.click();
    await this.emailInput.waitFor();
  }

  async fillUserForm({ email, firstName, lastName }) {
    if (email !== undefined) {
      await this.emailInput.fill(email);
    }
    if (firstName !== undefined) {
      await this.firstNameInput.fill(firstName);
    }
    if (lastName !== undefined) {
      await this.lastNameInput.fill(lastName);
    }
  }

  async submitForm() {
    await this.saveButton.click();
  }

  // Упрощённый сценарий: создать пользователя и вернуться к списку
  async createUser(user) {
    await this.openCreateForm();
    await this.fillUserForm(user);
    await this.submitForm();
    await this.goto();
  }

  // ===== УДАЛЕНИЕ ОДНОГО ПОЛЬЗОВАТЕЛЯ =====

  async deleteUserViaEdit(email) {
    await this.openUserForEdit(email);
    await this.deleteButton.click();
    await this.page.getByText(/deleted/i).waitFor();
  }

  // ===== МАССОВЫЕ ОПЕРАЦИИ =====

  async selectUser(email) {
    await this.rowByEmail(email).getByRole('checkbox').check();
  }

  async selectAllUsers() {
    await this.selectAllCheckbox.check();
  }

  async deleteSelectedUsers() {
    await this.bulkDeleteButton.click();
    await this.page.getByText(/deleted/i).waitFor();
  }
}
