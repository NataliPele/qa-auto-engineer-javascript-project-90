import { test, expect } from '@playwright/test'
import { TasksPage } from './pages/TasksPage.js'

test.describe('Tasks / Kanban board', () => {
  /** @type {TasksPage} */
  let tasksPage

  test.beforeEach(async ({ page }) => {
    tasksPage = new TasksPage(page)
    await tasksPage.goto()
  })

  test('невозможно создать задачу без заполнения обязательных полей', async () => {
    await tasksPage.openCreateForm()

    // Заполняем только необязательное поле Content 
    await tasksPage.fillContent('description')

    await tasksPage.saveForm()

    // Проверяем сообщения валидации
    await tasksPage.expectRequiredFieldErrors(expect)
  })

  test('создание задачи: задача появляется в нужной колонке', async () => {
    const status = 'To Publish'

    const { title } = await tasksPage.createTask({ status })

    const card = tasksPage.cardInColumn(status, title)
    await expect(card).toBeVisible()
  })

  test('создание задачи: корректные ссылки Edit и Show в карточке', async () => {
    const status = 'To Publish'

    const { title } = await tasksPage.createTask({ status })

    const card = tasksPage.cardInColumn(status, title)
    await expect(card).toBeVisible()

    const editLink = card.getByRole('link', { name: 'EDIT' })
    const showLink = card.getByRole('link', { name: 'SHOW' })

    await expect(editLink).toHaveAttribute('href', /#\/tasks\/\d+$/)
    await expect(showLink).toHaveAttribute('href', /#\/tasks\/\d+\/show$/)
  })

  test('фильтр по Assignee отображает только задачи выбранного исполнителя', async () => {
    const assignee = 'alice@hotmail.com'
    const status = 'To Publish'

    const { title } = await tasksPage.createTask({
      assignee,
      status,
      labels: ['critical'],
    })

    await tasksPage.chooseAssignee(assignee)

    let card = tasksPage.cardInColumn(status, title)
    await expect(card).toBeVisible()

    await tasksPage.chooseAssignee('michael@example.com')
    card = tasksPage.cardInColumn(status, title)
    await expect(card).toHaveCount(0)
  })

  test('фильтр по Status показывает задачу только в выбранной колонке', async () => {
    const status = 'To Publish'

    const { title } = await tasksPage.createTask({
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

  test('фильтр по Label показывает только задачи с нужной меткой', async () => {
    const status = 'To Publish'

    const { title } = await tasksPage.createTask({
      status,
      labels: ['bug'],
    })

    await tasksPage.chooseLabel('bug')

    let card = tasksPage.cardInColumn(status, title)
    await expect(card).toBeVisible()

    await tasksPage.chooseLabel('task')
    card = tasksPage.cardInColumn(status, title)
    await expect(card).toHaveCount(0)
  })

  test('смена статуса переносит задачу из Draft в To Publish', async () => {
    const initialStatus = 'Draft'
    const newStatus = 'To Publish'

    const { title } = await tasksPage.createTask({
      status: initialStatus,
      labels: ['task'],
    })

    // 1. Фильтруем по Draft — задача должна быть видна
    await tasksPage.chooseStatus(initialStatus)
    let card = tasksPage.cardInColumn(initialStatus, title)
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
    card = tasksPage.cardInColumn(initialStatus, title)
    await expect(card).toHaveCount(0)

    // 5. В фильтре To Publish задача есть
    await tasksPage.chooseStatus(newStatus)
    card = tasksPage.cardInColumn(newStatus, title)
    await expect(card).toBeVisible()
  })

  test('удаление с Undo и повторное удаление окончательно убирает задачу с доски', async () => {
    const status = 'To Publish'

    const { title } = await tasksPage.createTask({
      status,
      labels: ['task'],
    })

    await tasksPage.chooseStatus(status)
    let card = tasksPage.cardInColumn(status, title)
    await expect(card).toBeVisible()

    await tasksPage.openTaskEditFromBoard(status, title)
    await tasksPage.expectOnTaskEditPage()

    // 3. Первое удаление + Undo
    await tasksPage.deleteTask()
    await tasksPage.undoDelete()
    await tasksPage.waitForBoardLoaded()

    await tasksPage.chooseStatus(status)
    card = tasksPage.cardInColumn(status, title)
    await expect(card).toBeVisible()

    // 4. Второе удаление без Undo
    await tasksPage.openTaskEditFromBoard(status, title)
    await tasksPage.expectOnTaskEditPage()
    await tasksPage.deleteTask()

    await tasksPage.waitForBoardLoaded()

    await tasksPage.chooseStatus(status)
    card = tasksPage.cardInColumn(status, title)
    await expect(card).toHaveCount(0)
  })
})
