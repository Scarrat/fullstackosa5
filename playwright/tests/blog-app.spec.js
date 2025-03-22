const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        name: 'Tester',
        username: 'TestUser',
        password: 'Salasana'
      }
    })
    await request.post('/api/users', {
      data: {
        name: 'Tester2',
        username: 'TestUser2',
        password: 'Salasana'
      }
    })
    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    const locator = await page.getByText('Log in to application')
    await expect(locator).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'TestUser', 'Salasana')
      await expect(page.getByText('TestUser logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'TestUser', 'Wrong')
      await expect(page.getByText('TestUser logged in')).not.toBeVisible()
    })
  })
  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'TestUser', 'Salasana')
      await page.getByRole('button', { name: 'login' }).click()
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page)
      await expect(page.locator('.blog')).toContainText('a test blog Playwright')
    })

    test('a blog can be liked', async ({ page }) => {
      await createBlog(page)
      await page.getByRole('button', { name: 'view' }).click()
      await expect(page.locator('.likes')).toContainText('0')
      await page.getByRole('button', { name: 'like' }).click()
      await expect(page.locator('.likes')).toContainText('1')
    })
    test('a blog can be deleted', async ({ page }) => {
      await createBlog(page)
      await page.getByRole('button', { name: 'view' }).click()
      page.on('dialog', dialog => dialog.accept())
      await page.getByRole('button', { name: 'delete' }).click()
      await expect(page.locator('.blog')).toHaveCount(0)
    })
  })
  test('only the user who added the blog sees the delete button', async ({ page }) => {
    await loginWith(page, 'TestUser', 'Salasana')
    await createBlog(page)
    await page.getByRole('button', { name: 'view' }).click()
    await expect(page.getByRole('button', { name: 'delete' })).toBeVisible()
    await page.getByRole('button', { name: 'logout' }).click()
    await loginWith(page, 'TestUser2', 'Salasana')
    await page.getByRole('button', { name: 'login' }).click()
    await page.getByRole('button', { name: 'view' }).click()
    await expect(page.getByRole('button', { name: 'delete' })).not.toBeVisible()
  })
  test('blogs are ordered by likes', async ({ page }) => {
    await loginWith(page, 'TestUser', 'Salasana')
    await createBlog(page, 'title1', 'author1', 'url1')
    await createBlog(page, 'title2', 'author2', 'url2')
    await createBlog(page, 'title3', 'author3', 'url3')
    const blogs = page.locator('.blog')
    await blogs.nth(0).getByRole('button', { name: 'view' }).click()
    await blogs.nth(1).getByRole('button', { name: 'view' }).click()
    await blogs.nth(2).getByRole('button', { name: 'view' }).click()
    await blogs.nth(0).getByRole('button', { name: 'like' }).click()
    await page.waitForTimeout(200)
    await blogs.nth(1).getByRole('button', { name: 'like' }).click()
    await page.waitForTimeout(200)
    await blogs.nth(1).getByRole('button', { name: 'like' }).click()
    await page.waitForTimeout(200)
    await blogs.nth(2).getByRole('button', { name: 'like' }).click()
    await page.waitForTimeout(200)
    await blogs.nth(2).getByRole('button', { name: 'like' }).click()
    await page.waitForTimeout(200)
    await blogs.nth(2).getByRole('button', { name: 'like' }).click()
    await page.waitForTimeout(200)
    await page.reload()
    const blogs2 = page.locator('.blog')
    await blogs2.nth(0).getByRole('button', { name: 'view' }).click()
    await blogs2.nth(1).getByRole('button', { name: 'view' }).click()
    await blogs2.nth(2).getByRole('button', { name: 'view' }).click()
    const likes = page.locator('.likes')
    expect(await likes.nth(0).textContent()).toContain('3')
    expect(await likes.nth(1).textContent()).toContain('2')
    expect(await likes.nth(2).textContent()).toContain('1')
  })
})