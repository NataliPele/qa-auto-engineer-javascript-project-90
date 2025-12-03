import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage.js'

test.describe('Application bootstrap', () => {
  test('app renders login form on start', async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()

    await loginPage.expectLoginFormVisible(expect)
  })
})
