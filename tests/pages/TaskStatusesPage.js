import { expect } from '@playwright/test'

export class TaskStatusesPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page
  }

  // ===== НАВИГАЦИЯ =====

  async goto() {
    await this.page
      .getByRole('menuitem', { name: /^task statuses$/i })
      .click()

    await this.page.getByText(/^name$/i).first().waitFor()
  }

  // ===== СПИСОК =====

  rowBySlug(slug) {
    return this.page.getByRole('row', { name: new RegExp(slug, 'i') })
  }

  async expectStatusInList({ name, slug }) {
    const row = this.rowBySlug(slug)
    await expect(row).toBeVisible()

    if (name) {
      await expect(row).toContainText(name)
    }
    if (slug) {
      await expect(row).toContainText(slug)
    }
  }

  // ===== КНОПКИ НА СПИСКЕ =====

  get createButton() {
    return this.page.getByRole('link', { name: /^create$/i })
  }

  get selectAllCheckbox() {
    return this.page.locator('thead input[type="checkbox"]')
  }

  get bulkDeleteButton() {
    return this.page.getByRole('button', { name: /^delete$/i })
  }

  // ===== ФОРМА СОЗДАНИЯ/РЕДАКТИРОВАНИЯ =====

  get nameInput() {
    return this.page.getByLabel(/name/i)
  }

  get slugInput() {
    return this.page.getByLabel(/slug/i)
  }

  get saveButton() {
    return this.page.getByRole('button', { name: /^save$/i })
  }

  get deleteButton() {
    return this.page.getByRole('button', { name: /^delete$/i })
  }

  async openCreateForm() {
    await this.createButton.click()
    await this.nameInput.waitFor()
  }

  async openStatusForEdit(slug) {
    const row = this.rowBySlug(slug)
    await row.click()
    await this.nameInput.waitFor()
  }

  async fillStatusForm({ name, slug }) {
    if (name !== undefined) {
      await this.nameInput.fill(name)
    }
    if (slug !== undefined) {
      await this.slugInput.fill(slug)
    }
  }

  async submitForm() {
    await this.saveButton.click()
  }

  // ===== УДАЛЕНИЕ ОДНОГО СТАТУСА =====

  async deleteStatusViaEdit(slug) {
    await this.openStatusForEdit(slug)
    await this.deleteButton.click()
    await this.page.getByText(/deleted/i).waitFor()
  }

  // ===== МАССОВЫЕ ОПЕРАЦИИ =====

  async selectStatus(slug) {
    await this.rowBySlug(slug).getByRole('checkbox').check()
  }

  async selectAllStatuses() {
    await this.selectAllCheckbox.check()
  }

  async deleteSelectedStatuses() {
    await this.bulkDeleteButton.click()
    await this.page.getByText(/deleted/i).waitFor()
  }
}
