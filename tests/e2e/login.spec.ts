import { expect, test, type Page } from '@playwright/test'

const loginApi = '**/api/internal/business/form/login'
const userInfoApi = '**/api/internal/business/userinfo'
const deptByUserApi = '**/api/internal/business/dept/v1/getDeptByUser**'

const accountRequiredMessage = '\u8bf7\u8f93\u5165\u8d26\u53f7'
const passwordRequiredMessage = '\u8bf7\u8f93\u5165\u5bc6\u7801'
const loginSuccessMessage = '\u767b\u5f55\u6210\u529f'
const loginFailedMessage = '\u8d26\u53f7\u6216\u5bc6\u7801\u9519\u8bef'

const getAccountInput = (page: Page) =>
  page.locator('.login-form .form-item').nth(0).locator('input').first()

const getPasswordInput = (page: Page) =>
  page.locator('.login-form .form-item').nth(1).locator('input').first()

const getLoginButton = (page: Page) => page.locator('.login-btn')

const mockLoginSuccess = async (page: Page, onLoginRequest?: () => void) => {
  await page.route(loginApi, async (route) => {
    onLoginRequest?.()
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 200,
        success: true,
        message: '\u6210\u529f',
        data: 'mocked-token',
      }),
    })
  })

  await page.route(userInfoApi, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 200,
        success: true,
        message: '\u6210\u529f',
        data: {
          id: 'u-1001',
          userId: 'u-1001',
          username: 'admin',
          nickname: '\u7ba1\u7406\u5458',
        },
      }),
    })
  })

  await page.route(deptByUserApi, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 200,
        success: true,
        message: '\u6210\u529f',
        data: [
          {
            id: 'dept-1',
            deptName: '\u4fe1\u606f\u4e2d\u5fc3',
          },
        ],
      }),
    })
  })
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
})

test.describe('\u767b\u5f55\u9875\u529f\u80fd\u6d4b\u8bd5', () => {
  test('\u8f93\u5165\u8d26\u53f7\u548c\u5bc6\u7801\u540e\u53ef\u4ee5\u70b9\u51fb\u767b\u5f55', async ({ page }) => {
    let loginRequestCount = 0

    await mockLoginSuccess(page, () => {
      loginRequestCount += 1
    })

    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const loginButton = getLoginButton(page)
    await expect(loginButton).toBeEnabled()

    await getAccountInput(page).fill('admin')
    await getPasswordInput(page).fill('joyou@123456')
    await loginButton.click()

    await expect.poll(() => loginRequestCount).toBe(1)
    await expect(page.getByText(loginSuccessMessage)).toBeVisible()
    await expect
      .poll(async () => page.evaluate(() => localStorage.getItem('wornbench_token')))
      .toBe('mocked-token')
  })

  test('\u8d26\u53f7\u4e3a\u7a7a\u65f6\u663e\u793a\u9519\u8bef\u63d0\u793a', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await getAccountInput(page).fill('')
    await getPasswordInput(page).fill('joyou@123456')
    await getLoginButton(page).click()

    await expect(page.getByText(accountRequiredMessage)).toBeVisible()
  })

  test('\u5bc6\u7801\u4e3a\u7a7a\u65f6\u663e\u793a\u9519\u8bef\u63d0\u793a', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await getAccountInput(page).fill('admin')
    await getPasswordInput(page).fill('')
    await getLoginButton(page).click()

    await expect(page.getByText(passwordRequiredMessage)).toBeVisible()
  })

  test('\u767b\u5f55\u5931\u8d25\u65f6\u663e\u793a\u63a5\u53e3\u9519\u8bef', async ({ page }) => {
    await page.route(loginApi, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          success: false,
          message: loginFailedMessage,
          data: null,
        }),
      })
    })

    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await getAccountInput(page).fill('admin')
    await getPasswordInput(page).fill('wrong-password')
    await getLoginButton(page).click()

    await expect(page.getByText(loginFailedMessage)).toBeVisible()
  })
})
