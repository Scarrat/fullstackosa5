import { useState } from 'react'
const Blog = ({ blog, updateBlog, deleteBlog, user }) => {
  const [visible, setVisible] = useState(false)
  const [likes, setLikes] = useState(blog.likes)
  const showDelete = user.username === blog.user.username

  const blogStyleVisible = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5,
    display: visible ? '' : 'none'
  }

  const blogStyleNotVisible = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5,
    display: visible ? 'none' : ''
  }

  const addLike = async () => {
    const updatedBlog = {
      ...blog,
      likes: likes + 1
    }
    const success = await updateBlog(updatedBlog)
    if (success) {
      setLikes(likes + 1)
    }
  }
  const handleDelete = async () => {
    if (!window.confirm(`Remove blog ${blog.title} by ${blog.author}`)) {
      return
    }
    await deleteBlog(blog.id)
  }



  return (
    <div className="blog">
      <div style={blogStyleNotVisible}>
        {blog.title} {blog.author} <button className="showButton" onClick={() => setVisible(true)}>view</button>
      </div>
      <div style={blogStyleVisible}>
        {blog.title} {blog.author} <button onClick={() => setVisible(false)}>hide</button>
        <div className="url">{blog.url}</div>
        <div className="likes">
          likes {blog.likes} <button onClick={addLike}>like</button>
        </div>
        <div>{blog.user.name}</div>
        {showDelete && <div><button onClick={handleDelete}>delete</button></div>}
      </div>
    </div>

  )



}



export default Blog