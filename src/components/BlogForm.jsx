import { useState } from 'react'



const BlogForm = ({ createBlog }) => {
  const [blogTitle, setBlogTitle] = useState('')
  const [blogAuthor, setBlogAuthor] = useState('')
  const [blogUrl, setBlogUrl] = useState('')

  const addBlog = (event) => {
    event.preventDefault()
    createBlog({
      title: blogTitle,
      author: blogAuthor,
      url: blogUrl
    })
    setBlogTitle('')
    setBlogAuthor('')
    setBlogUrl('')
  }
  return (
    <form onSubmit={addBlog}>
      <div>
        title:<input data-testid="title" value={blogTitle} onChange={event => setBlogTitle(event.target.value)} />
      </div>
      <div>
        author:<input data-testid="author" value={blogAuthor} onChange={event => setBlogAuthor(event.target.value)} />
      </div>
      <div>
        url:<input data-testid="url" value={blogUrl} onChange={event => setBlogUrl(event.target.value)} />
      </div>
      <button type="submit">create</button>
    </form>
  )
}

export default BlogForm