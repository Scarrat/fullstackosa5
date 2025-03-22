

const loginWith = async (page, username, password) => {
  await page.getByRole('button', { name: 'log in' }).click()
  await page.getByTestId('username').fill(username)
  await page.getByTestId('password').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

const createBlog = async (page, title, author, url) => {
  await page.getByRole('button', { name: 'new blog' }).click()
  await page.getByTestId('title').fill(title || 'a test blog')
  await page.getByTestId('author').fill(author || 'Playwright')
  await page.getByTestId('url').fill(url || 'www.playwright.com')
  await page.getByRole('button', { name: 'create' }).click()
}

export { loginWith, createBlog }