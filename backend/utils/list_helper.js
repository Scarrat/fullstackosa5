const lodash = require('lodash')
const blog = require('../models/blog')
const dummy = (blogs) => {
    return 1
}
  

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    return blogs.reduce((max, blog) => {
        if (blog.likes > max.likes) {
            return blog
        }
        return max
    })
}

const mostBlogs = (blogs) => {
    const authors = lodash.countBy(blogs, 'author')
    const [author, count] = lodash.maxBy(Object.entries(authors), ([, count]) => count)
    return {
        author: author,
        blogs: count
    }
}

const mostLikes = (blogs) => {
    const authors = lodash.groupBy(blogs, 'author')
    const summedLikes = lodash.mapValues(authors, (blogs) => lodash.sumBy(blogs, 'likes'))
    const [author, likes] = lodash.maxBy(Object.entries(summedLikes), ([, likes]) => likes)
    return {
        author: author,
        likes: likes
    }
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}