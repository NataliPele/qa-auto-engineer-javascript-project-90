import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage.js'
import { MainPage } from './pages/MainPage.js'
import { UsersPage } from './pages/UsersPage.js'

async function loginAndGoToUsers(page) {
  const loginPage = new LoginPage(page)
  const mainPage = new MainPage(page)
  const usersPage = new UsersPage(page)

  await loginPage.goto()
  await loginPage.login('test', 'test')

  await expect(mainPage.userAvatar).toBeVisible()

  await usersPage.goto()

  return usersPage
}

test.describe('Users CRUD', () => {
  test('Create user', async ({ page }) => {
    const users = await loginAndGoToUsers(page)

    const user = {
      email: `user_${Date.now()}@example.com`,
      firstName: 'Alice',
      lastName: 'Johnson',
    };

    // Форма создания отображается корректно
    await users.openCreateForm()
    await expect(users.emailInput).toBeVisible()
    await expect(users.firstNameInput).toBeVisible()
    await expect(users.lastNameInput).toBeVisible()

    // Вводим данные и сохраняем
    await users.fillUserForm(user)
    await users.submitForm()
    await users.goto()
    await users.expectUserInList(user)
  });

  test('Users list displays basic info', async ({ page }) => {
    const users = await loginAndGoToUsers(page)

    // Проверяем заголовки колонок
    await expect(page.getByText(/^Email$/i)).toBeVisible()
    await expect(page.getByText(/^First name$/i)).toBeVisible()
    await expect(page.getByText(/^Last name$/i)).toBeVisible()

    // Проверяем, что в списке есть хотя бы один «живой» пользователь
    const existingRow = users.rowByEmail('alice@hotmail.com')
    await expect(existingRow).toBeVisible()
    await expect(existingRow.getByText(/^Alice$/i)).toBeVisible()
    await expect(existingRow.getByText(/^Johnson$/i)).toBeVisible()
  })

  test('Edit user', async ({ page }) => {
    const users = await loginAndGoToUsers(page)

    const original = {
      email: `orig_${Date.now()}@example.com`,
      firstName: 'Peter',
      lastName: 'Brown',
    };

    // создаём пользователя
    await users.openCreateForm()
    await users.fillUserForm(original)
    await users.submitForm()
    await users.goto()
    await users.expectUserInList(original)

    const updated = {
      email: `upd_${Date.now()}@example.com`,
      firstName: 'Bob',
      lastName: 'Updated',
    };

    // форма редактирования отображается и позволяет изменить данные
    await users.openUserForEdit(original.email)
    await expect(users.emailInput).toBeVisible()
    await expect(users.firstNameInput).toBeVisible()
    await expect(users.lastNameInput).toBeVisible()

    await users.fillUserForm(updated)
    await users.submitForm()
    await users.goto()
    await users.expectUserInList(updated)
  })

  test('Edit user: email validation', async ({ page }) => {
    const users = await loginAndGoToUsers(page)
  
    const user = {
      email: `val_${Date.now()}@example.com`,
      firstName: 'Val',
      lastName: 'Test',
    };
  
    // создаём корректного пользователя
    await users.openCreateForm()
    await users.fillUserForm(user)
    await users.submitForm()
    await users.goto()
    await users.expectUserInList(user)
  
    // открываем редактирование и вводим некорректный email
    await users.openUserForEdit(user.email)
    await users.emailInput.fill('not-an-email')
    await users.submitForm()
    await expect(
      page.getByText(/incorrect email format/i)
    ).toBeVisible()
  })
  

  test('Delete one user', async ({ page }) => {
    const users = await loginAndGoToUsers(page)

    const target = {
      email: `del_${Date.now()}@example.com`,
      firstName: 'Del',
      lastName: 'One',
    }

    await users.openCreateForm()
    await users.fillUserForm(target)
    await users.submitForm()
    await users.goto()
    await users.expectUserInList(target)

    // Удаляем через форму редактирования
    await users.deleteUserViaEdit(target.email)
    await users.goto()

    // Пользователь исчез из списка
    await expect(users.rowByEmail(target.email)).toHaveCount(0)
  })

  test('Bulk delete users', async ({ page }) => {
    const users = await loginAndGoToUsers(page)

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

    // создаём первого
    await users.openCreateForm()
    await users.fillUserForm(u1)
    await users.submitForm()
    await users.goto()
    await users.expectUserInList(u1)

    // создаём второго
    await users.openCreateForm()
    await users.fillUserForm(u2)
    await users.submitForm()
    await users.goto()
    await users.expectUserInList(u2)

    // Выделяем всех и удаляем
    await users.selectAllUsers()
    await users.deleteSelectedUsers()

    // проверка, что удалились
    await expect(users.rowByEmail(u1.email)).toHaveCount(0)
    await expect(users.rowByEmail(u2.email)).toHaveCount(0)
  })
})
