export class LabelsPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page
  }

  // ===== НАВИГАЦИЯ =====

  async goto() {
    await this.page
      .getByRole('menuitem', { name: /^labels$/i })
      .click()

    await this.page.getByText(/^name$/i).first().waitFor()
  }

  // ===== СПИСОК =====

  rowByName(name) {
    return this.page.getByRole('row', { name: new RegExp(name, 'i') })
  }

  async expectLabelInList({ name }, expect) {
    const row = this.rowByName(name)
    await expect(row).toBeVisible()
    await expect(row).toContainText(name)
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

  async openLabelForEdit(name) {
    const row = this.rowByName(name)
    await row.click();
    await this.nameInput.waitFor()
  }

  async fillLabelForm({ name }) {
    if (name !== undefined) {
      await this.nameInput.fill(name)
    }
  }

  async submitForm() {
    await this.saveButton.click()
  }

  async createLabel(label) {
    await this.openCreateForm()
    await this.fillLabelForm(label)
    await this.submitForm()
    await this.goto()
  }

  // ===== УДАЛЕНИЕ ОДНОЙ МЕТКИ =====

  async deleteLabelViaEdit(name) {
    await this.openLabelForEdit(name)
    await this.deleteButton.click()
    await this.page.getByText(/deleted/i).waitFor()
  }

  // ===== МАССОВЫЕ ОПЕРАЦИИ =====

  async selectLabel(name) {
    await this.rowByName(name).getByRole('checkbox').check()
  }

  async selectAllLabels() {
    await this.selectAllCheckbox.check()
  }

  async deleteSelectedLabels() {
    await this.bulkDeleteButton.click()
    await this.page.getByText(/deleted/i).waitFor()
  }
}
