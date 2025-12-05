export class TasksPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page
  }

  // ---------- Навигация: логин + переход к Tasks ----------

  async goto() {
    await this.page.goto('http://localhost:5173/#/login')

    await this.page.getByRole('textbox', { name: 'Username' }).fill('test')
    await this.page.getByRole('textbox', { name: 'Password' }).fill('test')
    await this.page.getByRole('button', { name: 'Sign in' }).click()
    await this.page.getByRole('menuitem', { name: 'Tasks' }).click()

    await this.waitForBoardLoaded()
  }

  async waitForBoardLoaded() {
    await this.page.waitForURL(/#\/tasks$/)
    await this.page.getByText('Draft').first().waitFor()
    await this.page.getByText('To Publish').first().waitFor()
    await this.page.getByText('Published').first().waitFor()
  }

  // ---------- Страницы задач ----------

  async expectOnTaskCreatePage() {
    await this.page.waitForURL(/#\/tasks\/create$/)
    await this.page.getByRole('combobox', { name: 'Assignee' }).waitFor()
  }

  async expectOnTaskEditPage() {
    await this.page.waitForURL(/#\/tasks\/\d+$/)
    await this.page.getByRole('textbox', { name: 'Title' }).waitFor()
  }

  get invalidFormAlert() {
    return this.page.getByText(/the form is not valid\. please check for errors/i);
  }

  async expectRequiredFieldErrors(expect) {
    await this.expectOnTaskCreatePage();

    const requiredMessages = this.page.getByText(/^Required$/);
    await expect(requiredMessages).toHaveCount(3); // Assignee, Title, Status

    await expect(this.invalidFormAlert).toBeVisible();
  }

  // ---------- Открытие форм с доски ----------

  async openCreateForm() {
    await this.page.getByRole('link', { name: 'Create' }).click()
    await this.expectOnTaskCreatePage()
  }

  async openTaskEditFromBoard(_statusName, title) {
    const cardButton = this.page.getByRole('button', {
      name: new RegExp(title),
    })

    await cardButton.waitFor()

    const editLink = cardButton.getByRole('link', { name: 'EDIT' })
    await editLink.click()
    await this.expectOnTaskEditPage()
  }

  // ---------- Работа с формой создания/редактирования ----------

  async selectAssigneeInForm(email) {
    const combo = this.page.getByRole('combobox', { name: 'Assignee' })
    await combo.click()
    await this.page.getByRole('option', { name: email }).click()
  }

  async fillTitle(title) {
    await this.page.getByRole('textbox', { name: 'Title' }).fill(title)
  }

  async fillContent(content) {
    await this.page.getByRole('textbox', { name: 'Content' }).fill(content)
  }

  async selectStatusInForm(statusName) {
    const combo = this.page.getByRole('combobox', { name: 'Status' })
    await combo.click()
    await this.page.getByRole('option', { name: statusName }).click()
  }

  async selectLabels(labels = []) {
    if (!labels || labels.length === 0) return

    const combo = this.page.getByRole('combobox', { name: 'Label' })
    await combo.click()

    for (const label of labels) {
      await this.page.getByRole('option', { name: label }).click()
    }

    const backdrop = this.page.locator('.MuiBackdrop-root').first()
    if (await backdrop.isVisible()) {
      await backdrop.click()
    } else {
      await this.page.keyboard.press('Escape')
    }
  }

  async saveForm() {
    await this.page.getByRole('button', { name: 'Save' }).click()
  }

  async createTask({
    assignee = 'michael@example.com',
    status = 'To Publish',
    labels = ['task', 'feature'],
  } = {}) {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`
    const title = `Autotest ${uniqueSuffix}`
    const content = `Autotest content ${uniqueSuffix}`

    await this.openCreateForm()

    await this.selectAssigneeInForm(assignee)
    await this.fillTitle(title)
    await this.fillContent(content)
    await this.selectStatusInForm(status)
    await this.selectLabels(labels)

    await this.saveForm()
    await this.expectOnTaskEditPage()

    await this.page.getByRole('menuitem', { name: 'Tasks' }).click()
    await this.waitForBoardLoaded()

    return { title, status, assignee, labels }
  }

  // ---------- Карточки на доске ----------

  cardByTitle(title) {
    return this.page.getByRole('button', { name: new RegExp(title) })
  }

  cardInColumn(_statusName, title) {
    return this.cardByTitle(title)
  }

  // ---------- Фильтры над доской ----------

  async chooseAssignee(email) {
    const combo = this.page.getByRole('combobox', { name: 'Assignee' })
    await combo.click()
    await this.page.getByRole('option', { name: email }).click()
  }

  async chooseStatus(statusName) {
    const combo = this.page.getByRole('combobox', { name: 'Status' })
    await combo.click()
    await this.page.getByRole('option', { name: statusName }).click()
  }

  async chooseLabel(labelName) {
    const combo = this.page.getByRole('combobox', { name: 'Label' })
    await combo.click()
    await this.page.getByRole('option', { name: labelName }).click()
  }

  // ---------- Удаление ----------

  async deleteTask() {
    await this.page.getByRole('button', { name: 'Delete' }).click()
  }

  async undoDelete() {
    const undoButton = this.page.getByRole('button', { name: 'Undo' })
    await undoButton.waitFor()
    await undoButton.click()
  }
}
