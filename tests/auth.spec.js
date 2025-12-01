import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage.js'
import { MainPage } from './pages/MainPage.js'

test.describe('Authentication & Authorization', () => {
  test('user can sign in with any credentials', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const mainPage = new MainPage(page)

    await loginPage.goto()

    await loginPage.login('testuser', 'some-password')

    await expect(mainPage.userAvatar).toBeVisible()
  })

  test('user can logout and returns to login form', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const mainPage = new MainPage(page)

    await loginPage.goto()
    await loginPage.login('another-user', 'another-password')

    await mainPage.logout()

    await expect(loginPage.usernameInput).toBeVisible()
    await expect(loginPage.passwordInput).toBeVisible()
    await expect(loginPage.signInButton).toBeVisible()
  })
})
