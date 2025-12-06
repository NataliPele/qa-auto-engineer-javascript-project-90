import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage.js'
import { MainPage } from './pages/MainPage.js'
import { generateRandomString } from './utils/generateCredentials.js';

const User1 = {
  username: `user_${generateRandomString(5)}`,
  password: generateRandomString(5),
}

const User2 = {
  username: `user_${generateRandomString(5)}`,
  password: generateRandomString(5),
}

test.describe('Авторизация', () => {
  /** @type {LoginPage} */
  let loginPage;
  /** @type {MainPage} */
  let mainPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    mainPage = new MainPage(page)
  })

  test('можно залогиниться', async () => {
    await loginPage.goto()
    await loginPage.login(User1.username, User1.password)

    await expect(mainPage.userAvatar).toBeVisible()
  })

  test('можно разлогиниться и вернуться к форме авторизации', async () => {
    await loginPage.goto()
    await loginPage.login(User2.username, User2.password)

    await mainPage.logout()

    await loginPage.expectLoginFormVisible(expect)
  })
})
