import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'
import BlogForm from './BlogForm'


const blog = {
  title: 'TestTitle',
  author: 'Tester',
  likes: 0,
  url: 'www.test.com',
  user: {
    username: 'testuser',
    name: 'Tester'
  }
}
const testUser = {
  username: 'testuser',
  name: 'Tester'
}
test('renders default visible content', () => {

  const { container } = render(<Blog blog={blog} user={testUser} />)
  expect(container.querySelector('.blog')).toHaveTextContent(
    'TestTitle Tester'
  )
  expect(container.querySelector('.url')).not.toBeVisible()
  expect(container.querySelector('.likes')).not.toBeVisible()
})



test('clicking the button shows url and likes', async () => {

  const { container } = render(<Blog blog={blog} user={testUser} />)
  const user = userEvent.setup()
  const button = screen.getByText('view')
  await user.click(button)
  expect(container.querySelector('.url')).toBeVisible()
  expect(container.querySelector('.likes')).toBeVisible()

})

test('clicking the button twitce calls event handler twice', async () => {
  const mockHandler = vi.fn()

  render(
    <Blog blog={blog}
      user={testUser}
      updateBlog={mockHandler} />)

  const user = userEvent.setup()
  const viewButton = screen.getByText('view')
  await user.click(viewButton)
  const likeButton = screen.getByText('like')
  await user.click(likeButton)
  await user.click(likeButton)
  expect(mockHandler.mock.calls).toHaveLength(2)
})

test('form calls the event handler with right details when new blog is created', async () => {
  const createBlog = vi.fn()
  const user = userEvent.setup()

  render(<BlogForm createBlog={createBlog} />)
  const inputs = screen.getAllByRole('textbox')
  const title = inputs[0]
  const author = inputs[1]
  const url = inputs[2]
  const button = screen.getByText('create')

  await user.type(title, 'Test Blog Title')
  await user.type(author, 'Test Author')
  await user.type(url, 'http://testblog.com')
  await user.click(button)
  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0]).toEqual({
    title: 'Test Blog Title',
    author: 'Test Author',
    url: 'http://testblog.com'
  })
})