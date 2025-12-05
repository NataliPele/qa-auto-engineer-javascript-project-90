import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage.js'
import { MainPage } from './pages/MainPage.js'
import { UsersPage } from './pages/UsersPage.js'

const testUser = {
  username: 'test',
  password: 'PassThetest980',
}

test.describe('Users CRUD', () => {
  /** @type {UsersPage} */
  let users

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page)
    const mainPage = new MainPage(page)
    users = new UsersPage(page)

    await loginPage.goto()
    await loginPage.login(testUser.username, testUser.password)
    await expect(mainPage.userAvatar).toBeVisible()

    await users.goto()
  })

  test('Создание пользователя', async () => {
    const user = {
      email: `user_${Date.now()}@example.com`,
      firstName: 'Alice',
      lastName: 'Johnson',
    }

    await users.createUser(user)
    await users.expectUserInList(user, expect)
  })

  test('Отображение списка пользователей', async ({ page }) => {
    await expect(page.getByText(/^Email$/i)).toBeVisible()
    await expect(page.getByText(/^First name$/i)).toBeVisible()
    await expect(page.getByText(/^Last name$/i)).toBeVisible()

    const existingRow = users.rowByEmail('alice@hotmail.com')
    await expect(existingRow).toBeVisible()
    await expect(existingRow.getByText(/^Alice$/i)).toBeVisible()
    await expect(existingRow.getByText(/^Johnson$/i)).toBeVisible()
  })

  test('Редактирование пользователя', async () => {
    const original = {
      email: `orig_${Date.now()}@example.com`,
      firstName: 'Peter',
      lastName: 'Brown',
    }

    await users.createUser(original)
    await users.expectUserInList(original, expect)

    const updated = {
      email: `upd_${Date.now()}@example.com`,
      firstName: 'Bob',
      lastName: 'Updated',
    }

    await users.openUserForEdit(original.email)
    await expect(users.emailInput).toBeVisible()
    await expect(users.firstNameInput).toBeVisible()
    await expect(users.lastNameInput).toBeVisible()

    await users.fillUserForm(updated)
    await users.submitForm()
    await users.goto()
    await users.expectUserInList(updated, expect)
  })

  test('Редактирование с невалидным email', async ({ page }) => {
    const user = {
      email: `val_${Date.now()}@example.com`,
      firstName: 'Val',
      lastName: 'Test',
    }

    await users.createUser(user)
    await users.expectUserInList(user, expect)

    await users.openUserForEdit(user.email)
    await users.emailInput.fill('not-an-email')
    await users.submitForm()

    await expect(
      page.getByText(/incorrect email format/i),
    ).toBeVisible()
  })

  test('Удаление одного пользователя', async () => {
    const target = {
      email: `del_${Date.now()}@example.com`,
      firstName: 'Del',
      lastName: 'One',
    }

    await users.createUser(target)
    await users.expectUserInList(target, expect)

    await users.deleteUserViaEdit(target.email)
    await users.goto()

    await expect(users.rowByEmail(target.email)).toHaveCount(0)
  })

  test('Массовое удаление', async () => {
    const u1 = {
      email: `b1_${Date.now()}@example.com`,
      firstName: 'Bulk',
      lastName: 'One',
    }
    const u2 = {
      email: `b2_${Date.now()}@example.com`,
      firstName: 'Bulk',
      lastName: 'Two',
    }

    await users.createUser(u1)
    await users.expectUserInList(u1, expect)

    await users.createUser(u2)
    await users.expectUserInList(u2, expect)

    await users.selectAllUsers()
    await users.deleteSelectedUsers()

    await expect(users.rowByEmail(u1.email)).toHaveCount(0)
    await expect(users.rowByEmail(u2.email)).toHaveCount(0)
  })
})
