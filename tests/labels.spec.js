import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage.js'
import { MainPage } from './pages/MainPage.js'
import { LabelsPage } from './pages/LabelsPage.js'

const testUser = {
  username: 'test',
  password: 'testPass!456',
}

async function loginAndGoToLabels(page) {
  const loginPage = new LoginPage(page)
  const mainPage = new MainPage(page)
  const labelsPage = new LabelsPage(page)

  await loginPage.goto()
  await loginPage.login(testUser.username, testUser.password)
  await expect(mainPage.userAvatar).toBeVisible()

  await labelsPage.goto()

  return labelsPage
}

test.describe('Метки CRUD', () => {
  test('Создание метки', async ({ page }) => {
    const labels = await loginAndGoToLabels(page)

    const label = {
      name: `label_${Date.now()}`,
    }

    await labels.createLabel(label)
    await labels.expectLabelInList(label, expect)
  })

  test('Отображение списка меток', async ({ page }) => {
    const labels = await loginAndGoToLabels(page)

    await expect(page.getByText(/^Name$/i)).toBeVisible()
    await expect(page.getByText(/^Created at$/i)).toBeVisible()

    const bugRow = labels.rowByName('bug')
    await expect(bugRow).toBeVisible()
    await expect(bugRow).toContainText('bug')
  })

  test('Редактирование метки', async ({ page }) => {
    const labels = await loginAndGoToLabels(page)

    const original = {
      name: `original_${Date.now()}`,
    }

    await labels.createLabel(original)
    await labels.expectLabelInList(original, expect)

    const updated = {
      name: `updated_${Date.now()}`,
    }

    await labels.openLabelForEdit(original.name)
    await expect(labels.nameInput).toBeVisible()

    await labels.fillLabelForm(updated)
    await labels.submitForm()
    await labels.goto()
    await labels.expectLabelInList(updated, expect)
  })

  test('Удаление одного лейбла', async ({ page }) => {
    const labels = await loginAndGoToLabels(page)

    const target = {
      name: `to_delete_${Date.now()}`,
    }

    await labels.createLabel(target)
    await labels.expectLabelInList(target, expect)

    await labels.deleteLabelViaEdit(target.name)
    await labels.goto()
    await expect(labels.rowByName(target.name)).toHaveCount(0)
  })

  test('Массовое удаление', async ({ page }) => {
    const labels = await loginAndGoToLabels(page)

    const label1 = {
      name: `bulk_one_${Date.now()}`,
    }
    const label2 = {
      name: `bulk_two_${Date.now()}`,
    }

    await labels.createLabel(label1)
    await labels.expectLabelInList(label1, expect)

    await labels.createLabel(label2)
    await labels.expectLabelInList(label2, expect)

    await labels.selectAllLabels()
    await labels.deleteSelectedLabels()
    await expect(labels.rowByName(label1.name)).toHaveCount(0)
    await expect(labels.rowByName(label2.name)).toHaveCount(0)
  })
})
