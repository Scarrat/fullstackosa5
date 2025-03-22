const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { tokenExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, id: 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = request.user
  const blog = new Blog({
    ...request.body,
    user: user._id 
  })
  const saveBlog = await blog.save()
  user.blogs = user.blogs.concat(saveBlog._id)
  await user.save()
  response.status(201).json(saveBlog)

})

blogsRouter.delete('/:id', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const id = request.params.id
  const blog = await Blog.findById(id)
  
  if (blog.user.toString() !== decodedToken.id.toString()) {
    return response.status(401).json({ error: 'unauthorized' })
  }
  const user = request.user
  if (user) {
    user.blogs = user.blogs.filter(bloo => bloo.toString() !== id)
    await user.save()
  }
  await Blog.findByIdAndDelete(id)
  response.status(204).end()


})

blogsRouter.put('/:id', async (request, response) => {
  const { user, ...blog } = request.body

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { ...blog, user: blog.user?.id || blog.user },
    { new: true, runValidators: true }
  ).populate('user', { username: 1, name: 1, id: 1 })

  if (updatedBlog) {
    response.json(updatedBlog)
  } else {
    response.status(404).end()
  }
})



module.exports = blogsRouter