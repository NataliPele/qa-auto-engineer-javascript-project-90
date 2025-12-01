import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage.js'
import { MainPage } from './pages/MainPage.js'
import { LabelsPage } from './pages/LabelsPage.js'

async function loginAndGoToLabels(page) {
  const loginPage = new LoginPage(page)
  const mainPage = new MainPage(page)
  const labelsPage = new LabelsPage(page)

  await loginPage.goto()
  await loginPage.login('test', 'test')
  await expect(mainPage.userAvatar).toBeVisible()

  await labelsPage.goto()

  return labelsPage
}

test.describe('Labels CRUD', () => {
  test('Create label', async ({ page }) => {
    const labels = await loginAndGoToLabels(page)

    const label = {
      name: `label_${Date.now()}`,
    }

    await labels.openCreateForm()
    await expect(labels.nameInput).toBeVisible()

    // Вводим данные и сохраняем
    await labels.fillLabelForm(label)
    await labels.submitForm()

    await labels.goto()

    await labels.expectLabelInList(label)
  })

  test('Labels list displays basic info', async ({ page }) => {
    const labels = await loginAndGoToLabels(page)

    await expect(page.getByText(/^Name$/i)).toBeVisible()
    await expect(page.getByText(/^Created at$/i)).toBeVisible()

    const bugRow = labels.rowByName('bug')
    await expect(bugRow).toBeVisible()
    await expect(bugRow).toContainText('bug')
  })

  test('Edit label', async ({ page }) => {
    const labels = await loginAndGoToLabels(page)

    const original = {
      name: `original_${Date.now()}`,
    }

    // создаём метку
    await labels.openCreateForm();
    await labels.fillLabelForm(original)
    await labels.submitForm()
    await labels.goto()
    await labels.expectLabelInList(original)

    const updated = {
      name: `updated_${Date.now()}`,
    }

    // форма редактирования отображается и позволяет изменить данные
    await labels.openLabelForEdit(original.name)
    await expect(labels.nameInput).toBeVisible()

    await labels.fillLabelForm(updated)
    await labels.submitForm()
    await labels.goto()
    await labels.expectLabelInList(updated)
  })

  test('Delete one label', async ({ page }) => {
    const labels = await loginAndGoToLabels(page)

    const target = {
      name: `to_delete_${Date.now()}`,
    }

    await labels.openCreateForm()
    await labels.fillLabelForm(target)
    await labels.submitForm()
    await labels.goto()
    await labels.expectLabelInList(target)

    // Удаляем через форму редактирования
    await labels.deleteLabelViaEdit(target.name)
    await labels.goto()
    await expect(labels.rowByName(target.name)).toHaveCount(0)
  })

  test('Bulk delete labels', async ({ page }) => {
    const labels = await loginAndGoToLabels(page)

    const l1 = {
      name: `bulk_one_${Date.now()}`,
    }
    const l2 = {
      name: `bulk_two_${Date.now()}`,
    }

    // создаём первую метку
    await labels.openCreateForm()
    await labels.fillLabelForm(l1)
    await labels.submitForm()
    await labels.goto()
    await labels.expectLabelInList(l1)

    // создаём вторую метку
    await labels.openCreateForm()
    await labels.fillLabelForm(l2)
    await labels.submitForm()
    await labels.goto()
    await labels.expectLabelInList(l2)

    // Выделяем все и удаляем
    await labels.selectAllLabels()
    await labels.deleteSelectedLabels()
    await expect(labels.rowByName(l1.name)).toHaveCount(0)
    await expect(labels.rowByName(l2.name)).toHaveCount(0)
  })
})
