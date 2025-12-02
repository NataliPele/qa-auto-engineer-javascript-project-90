import { test, expect } from '@playwright/test'
import { TasksPage } from './pages/TasksPage.js'

async function createTask(page, {
  assignee = 'michael@example.com',
  status = 'To Publish',
  labels = ['task', 'feature'],
} = {}) {
  const tasksPage = new TasksPage(page)

  const uniqueSuffix = `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`
  const title = `Autotest ${uniqueSuffix}`

  await tasksPage.openCreateForm()
  await expect(page).toHaveURL(/#\/tasks\/create$/)

  // Заполняем форму
  await tasksPage.selectAssigneeInForm(assignee)
  await tasksPage.fillTitle(title)
  await tasksPage.fillContent(`Autotest content ${uniqueSuffix}`)
  await tasksPage.selectStatusInForm(status)
  await tasksPage.selectLabels(labels)

  await tasksPage.saveForm()

  await tasksPage.expectOnTaskEditPage()

  await page.getByRole('menuitem', { name: 'Tasks' }).click()
  await tasksPage.waitForBoardLoaded()

  return { title, status, assignee, labels }
}

test.describe('Tasks / Kanban board', () => {
  test.beforeEach(async ({ page }) => {
    const tasksPage = new TasksPage(page)
    await tasksPage.goto()
  })

  test('создание задачи: задача появляется в нужной колонке', async ({ page }) => {
    const tasksPage = new TasksPage(page)
    const status = 'To Publish'

    const { title } = await createTask(page, { status })

    const card = tasksPage.cardInColumn(status, title)
    await expect(card).toBeVisible()
  })

  test('создание задачи: корректные ссылки Edit и Show в карточке', async ({ page }) => {
    const tasksPage = new TasksPage(page)
    const status = 'To Publish'

    const { title } = await createTask(page, { status })

    const card = tasksPage.cardInColumn(status, title)
    await expect(card).toBeVisible()

    const editLink = card.getByRole('link', { name: 'EDIT' })
    const showLink = card.getByRole('link', { name: 'SHOW' })

    await expect(editLink).toHaveAttribute('href', /#\/tasks\/\d+$/)
    await expect(showLink).toHaveAttribute('href', /#\/tasks\/\d+\/show$/)
  })

  test('фильтр по Assignee отображает только задачи выбранного исполнителя', async ({ page }) => {
    const tasksPage = new TasksPage(page)
    const assignee = 'alice@hotmail.com'
    const status = 'To Publish'

    const { title } = await createTask(page, {
      assignee,
      status,
      labels: ['critical'],
    })

    await tasksPage.chooseAssignee(assignee)

    let card = tasksPage.cardInColumn(status, title);
    await expect(card).toBeVisible();

    await tasksPage.chooseAssignee('michael@example.com')
    card = tasksPage.cardInColumn(status, title)
    await expect(card).toHaveCount(0)
  })

  test('фильтр по Status показывает задачу только в выбранной колонке', async ({ page }) => {
    const tasksPage = new TasksPage(page)
    const status = 'To Publish'

    const { title } = await createTask(page, {
      status,
      labels: ['task'],
    })

    await tasksPage.chooseStatus(status)
    let card = tasksPage.cardInColumn(status, title)
    await expect(card).toBeVisible()

    await tasksPage.chooseStatus('Draft')
    card = tasksPage.cardInColumn('Draft', title)
    await expect(card).toHaveCount(0)
  })

  test('фильтр по Label показывает только задачи с нужной меткой', async ({ page }) => {
    const tasksPage = new TasksPage(page)
    const status = 'To Publish'

    const { title } = await createTask(page, {
      status,
      labels: ['bug'],
    })

    // Фильтруем по Label = bug
    await tasksPage.chooseLabel('bug')

    let card = tasksPage.cardInColumn(status, title)
    await expect(card).toBeVisible()

    await tasksPage.chooseLabel('task')
    card = tasksPage.cardInColumn(status, title)
    await expect(card).toHaveCount(0)
  })

  test('смена статуса переносит задачу из Draft в To Publish', async ({ page }) => {
    const tasksPage = new TasksPage(page)
    const initialStatus = 'Draft'
    const newStatus = 'To Publish'

    const { title } = await createTask(page, {
      status: initialStatus,
      labels: ['task'],
    })

    const titleRegex = new RegExp(title)

    // 1. Фильтруем по Draft — задача должна быть видна
    await tasksPage.chooseStatus(initialStatus)
    let card = page.getByRole('button', { name: titleRegex })
    await expect(card).toBeVisible()

    // 2. Открываем редактирование этой задачи из списка Draft
    await tasksPage.openTaskEditFromBoard(initialStatus, title)
    await tasksPage.expectOnTaskEditPage()

    // 3. Меняем статус на To Publish и сохраняем
    await tasksPage.selectStatusInForm(newStatus)
    await tasksPage.saveForm()
    await tasksPage.waitForBoardLoaded()

    // 4. В фильтре Draft этой задачи больше нет
    await tasksPage.chooseStatus(initialStatus)
    card = page.getByRole('button', { name: titleRegex })
    await expect(card).toHaveCount(0)

    // 5. В фильтре To Publish задача есть
    await tasksPage.chooseStatus(newStatus)
    card = page.getByRole('button', { name: titleRegex })
    await expect(card).toBeVisible()
  })
  
  test('удаление с Undo и повторное удаление окончательно убирает задачу с доски', async ({ page }) => {
    const tasksPage = new TasksPage(page)
    const status = 'To Publish'
  
    const { title } = await createTask(page, {
      status,
      labels: ['task'],
    })
  
    const titleRegex = new RegExp(title)

    await tasksPage.chooseStatus(status)
    let card = page.getByRole('button', { name: titleRegex })
    await expect(card).toBeVisible()

    await tasksPage.openTaskEditFromBoard(status, title)
    await tasksPage.expectOnTaskEditPage()
  
    // 3. Первое удаление + Undo
    await page.getByRole('button', { name: 'Delete' }).click()
  
    const undoButton = page.getByRole('button', { name: 'Undo' })
    await expect(undoButton).toBeVisible()
    await undoButton.click()
  
    await tasksPage.waitForBoardLoaded()
 
    await tasksPage.chooseStatus(status)
    card = page.getByRole('button', { name: titleRegex })
    await expect(card).toBeVisible()
  
    // 4. Второе удаление без Undo
    await tasksPage.openTaskEditFromBoard(status, title)
    await tasksPage.expectOnTaskEditPage()
    await page.getByRole('button', { name: 'Delete' }).click()
  
    await tasksPage.waitForBoardLoaded()

    await tasksPage.chooseStatus(status)
    card = page.getByRole('button', { name: titleRegex })
    await expect(card).toHaveCount(0)
  })

})
