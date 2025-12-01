import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage.js'
import { MainPage } from './pages/MainPage.js'
import { TaskStatusesPage } from './pages/TaskStatusesPage.js'

async function loginAndGoToTaskStatuses(page) {
  const loginPage = new LoginPage(page)
  const mainPage = new MainPage(page)
  const taskStatusesPage = new TaskStatusesPage(page)

  await loginPage.goto()
  await loginPage.login('test', 'test')
  await expect(mainPage.userAvatar).toBeVisible()

  await taskStatusesPage.goto()

  return taskStatusesPage
}

test.describe('Task statuses CRUD', () => {
  test('Create task status', async ({ page }) => {
    const statuses = await loginAndGoToTaskStatuses(page)

    const status = {
      name: `New status ${Date.now()}`,
      slug: `new_status_${Date.now()}`,
    }

    // Форма создания отображается корректно
    await statuses.openCreateForm()
    await expect(statuses.nameInput).toBeVisible()
    await expect(statuses.slugInput).toBeVisible()

    // Вводим данные и сохраняем
    await statuses.fillStatusForm(status)
    await statuses.submitForm()

    await statuses.goto()

    await statuses.expectStatusInList(status)
  })

  test('Task statuses list displays basic info', async ({ page }) => {
    const statuses = await loginAndGoToTaskStatuses(page)
  
    await expect(page.getByText(/^Name$/i)).toBeVisible()
    await expect(page.getByText(/^Slug$/i)).toBeVisible()

    const draftRow = statuses.rowBySlug('draft')
    await expect(draftRow).toBeVisible()
    await expect(draftRow).toContainText('Draft')
    await expect(draftRow).toContainText('draft')
  })
  

  test('Edit task status', async ({ page }) => {
    const statuses = await loginAndGoToTaskStatuses(page)

    const original = {
      name: `Original ${Date.now()}`,
      slug: `original_${Date.now()}`,
    }

    // создаём статус
    await statuses.openCreateForm()
    await statuses.fillStatusForm(original)
    await statuses.submitForm()
    await statuses.goto()
    await statuses.expectStatusInList(original)

    const updated = {
      name: `Updated ${Date.now()}`,
      slug: `updated_${Date.now()}`,
    }

    // форма редактирования отображается и позволяет изменить данные
    await statuses.openStatusForEdit(original.slug)
    await expect(statuses.nameInput).toBeVisible()
    await expect(statuses.slugInput).toBeVisible()

    await statuses.fillStatusForm(updated)
    await statuses.submitForm()
    await statuses.goto()

    await statuses.expectStatusInList(updated)
  })

  test('Delete one task status', async ({ page }) => {
    const statuses = await loginAndGoToTaskStatuses(page)

    const target = {
      name: `To delete ${Date.now()}`,
      slug: `to_delete_${Date.now()}`,
    }

    await statuses.openCreateForm()
    await statuses.fillStatusForm(target)
    await statuses.submitForm()
    await statuses.goto()
    await statuses.expectStatusInList(target)

    // Удаляем через форму редактирования
    await statuses.deleteStatusViaEdit(target.slug)
    await statuses.goto()
    await expect(statuses.rowBySlug(target.slug)).toHaveCount(0)
  })

  test('Bulk delete task statuses', async ({ page }) => {
    const statuses = await loginAndGoToTaskStatuses(page)

    const s1 = {
      name: `Bulk one ${Date.now()}`,
      slug: `bulk_one_${Date.now()}`,
    };
    const s2 = {
      name: `Bulk two ${Date.now()}`,
      slug: `bulk_two_${Date.now()}`,
    }

    // создаём первый статус
    await statuses.openCreateForm()
    await statuses.fillStatusForm(s1)
    await statuses.submitForm()
    await statuses.goto()
    await statuses.expectStatusInList(s1)

    // создаём второй статус
    await statuses.openCreateForm()
    await statuses.fillStatusForm(s2)
    await statuses.submitForm()
    await statuses.goto()
    await statuses.expectStatusInList(s2)

    // Выделяем все и удаляем
    await statuses.selectAllStatuses()
    await statuses.deleteSelectedStatuses()
    await expect(statuses.rowBySlug(s1.slug)).toHaveCount(0)
    await expect(statuses.rowBySlug(s2.slug)).toHaveCount(0)
  })
})
