import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage.js'
import { MainPage } from './pages/MainPage.js'
import { TaskStatusesPage } from './pages/TaskStatusesPage.js'
import { generateRandomString } from './utils/generateCredentials.js';

const testUser = {
  username: `user_${generateRandomString(5)}`,
  password: generateRandomString(5),
}

test.describe('Статус CRUD', () => {
  /** @type {TaskStatusesPage} */
  let statuses;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page)
    const mainPage = new MainPage(page)
    statuses = new TaskStatusesPage(page)

    await loginPage.goto()
    await loginPage.login(testUser.username, testUser.password)
    await expect(mainPage.userAvatar).toBeVisible()

    await statuses.goto()
  })

  test('Создание статуса', async () => {
    const status = {
      name: `New status ${Date.now()}`,
      slug: `new_status_${Date.now()}`,
    }

    await statuses.createStatus(status)

    await statuses.expectStatusInList(status, expect)
  })

  test('Отображение списка статусов', async ({ page }) => {
    await expect(page.getByText(/^Name$/i)).toBeVisible()
    await expect(page.getByText(/^Slug$/i)).toBeVisible()

    const draftRow = statuses.rowBySlug('draft')
    await expect(draftRow).toBeVisible()
    await expect(draftRow).toContainText('Draft')
    await expect(draftRow).toContainText('draft')
  })

  test('редакирование статуса', async () => {
    const original = {
      name: `Original ${Date.now()}`,
      slug: `original_${Date.now()}`,
    }

    await statuses.createStatus(original)
    await statuses.expectStatusInList(original, expect)

    const updated = {
      name: `Updated ${Date.now()}`,
      slug: `updated_${Date.now()}`,
    }

    await statuses.openStatusForEdit(original.slug)
    await expect(statuses.nameInput).toBeVisible()
    await expect(statuses.slugInput).toBeVisible()

    await statuses.fillStatusForm(updated)
    await statuses.submitForm()
    await statuses.goto()

    await statuses.expectStatusInList(updated, expect)
  })

  test('Удаление одного статуса', async () => {
    const target = {
      name: `To delete ${Date.now()}`,
      slug: `to_delete_${Date.now()}`,
    }

    await statuses.createStatus(target)
    await statuses.expectStatusInList(target, expect)

    await statuses.deleteStatusViaEdit(target.slug)
    await statuses.goto()
    await expect(statuses.rowBySlug(target.slug)).toHaveCount(0)
  })

  test('Массовое удаление', async () => {
    const s1 = {
      name: `Bulk one ${Date.now()}`,
      slug: `bulk_one_${Date.now()}`,
    }
    const s2 = {
      name: `Bulk two ${Date.now()}`,
      slug: `bulk_two_${Date.now()}`,
    }

    await statuses.createStatus(s1)
    await statuses.expectStatusInList(s1, expect)

    await statuses.createStatus(s2)
    await statuses.expectStatusInList(s2, expect)

    await statuses.selectAllStatuses()
    await statuses.deleteSelectedStatuses()
    await expect(statuses.rowBySlug(s1.slug)).toHaveCount(0)
    await expect(statuses.rowBySlug(s2.slug)).toHaveCount(0)
  })
})
