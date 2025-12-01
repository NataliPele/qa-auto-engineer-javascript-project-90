import { test, expect } from '@playwright/test'

test('app renders login form on start', async ({ page }) => {
  await page.goto('/')

  // Ищем поля формы авторизации
  const usernameInput = page.getByLabel(/username/i)
  const passwordInput = page.getByLabel(/password/i)
  const signInButton = page.getByRole('button', { name: /sign in/i })

  // Проверяем, что элементы видимы
  await expect(usernameInput).toBeVisible()
  await expect(passwordInput).toBeVisible()
  await expect(signInButton).toBeVisible()
})
