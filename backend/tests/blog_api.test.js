const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const api = supertest(app)
var token = ''

const initialBlogs = [
    {
        _id: "5a422a851b54a676234d17f7",
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7,
        __v: 0
    },
    {
        _id: "5a422aa71b54a676234d17f8",
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
        __v: 0
    }
]

const tokenHelper = async () => {
    const response = await api
      .post('/api/login')
      .send({
        username: 'root',
        password: 'sekret'
      })
    return `Bearer ${response.body.token}`
  }

beforeEach(async () => {
    await Blog.deleteMany({})


    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    let blogObject = new Blog({
        ...initialBlogs[0],
        user: user._id
    })

    await blogObject.save()
    let blogObject2 = new Blog({
        ...initialBlogs[1],
        user: user._id
    })
    await blogObject2.save()

    await user.save()
    token = await tokenHelper()

})
describe('when there are blogs in the database', () => {
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('there are two blogs', async () => {
        const response = await api.get('/api/blogs')
        assert.strictEqual(response.body.length, 2)
    })

    test('the post id is named id', async () => {
        const response = await api.get('/api/blogs')
        assert(response.body[0].id)
    })
})




test('post creates a new blog', async () => {
    const newBlog = {
        _id: "5a422b3a1b54a676234d17f9",
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12,
        __v: 0
    }
    await api
        .post('/api/blogs')
        .send(newBlog)
        .set({ Authorization: token })
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, 3)
    assert.strictEqual(response.body[2].title, newBlog.title)
})

test('posting a new blog without token gives 401', async () => {
    const newBlog = {
        _id: "5a422b3a1b54a676234d17f9",
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12,
        __v: 0
    }
    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
})

test('post with no likes field has 0 likes', async () => {
    const newBlog = {
        _id: "5a422b3a1b54a676234d17f9",
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        __v: 0
    }
    await api
        .post('/api/blogs')
        .send(newBlog)
        .set({ Authorization: token })
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body[2].likes, 0)
})

test('post with no title gets bad request', async () => {
    const newBlog = {
        _id: "5a422b3a1b54a676234d17f9",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        __v: 0
    }
    await api
        .post('/api/blogs')
        .send(newBlog)
        .set({ Authorization: token })
        .expect(400)
})

test('post with no url gets bad request', async () => {
    const newBlog = {
        _id: "5a422b3a1b54a676234d17f9",
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        __v: 0
    }
    await api
        .post('/api/blogs')
        .send(newBlog)
        .set({ Authorization: token })
        .expect(400)
})

test('deleting a post works', async () => {
    const response = await api.get('/api/blogs')
    const id = response.body[0].id
    await api
        .delete(`/api/blogs/${id}`)
        .set({ Authorization: token })
        .expect(204)
    const secondResponse = await api.get('/api/blogs')
    assert.strictEqual(secondResponse.body.length, 1)
})

test('deleting a malformed id post returns 400', async () => {
    await api
        .delete(`/api/blogs/1234567890`)
        .set({ Authorization: token })
        .expect(400)
})

test('updating a blogs likes works', async () => {
    const response = await api.get('/api/blogs')
    const id = response.body[0].id
    const updatedBlog = {
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 8,
        __v: 0
    }
    await api
        .put(`/api/blogs/${id}`)
        .send(updatedBlog)
        .set({ Authorization: token })
        .expect(200)
    const response2 = await api.get('/api/blogs')
    assert.strictEqual(response2.body[0].likes, 8)
})

test('updating with malformed id returns 400', async () => {
    const updatedBlog = {
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 8,
        __v: 0
    }
    await api
        .put(`/api/blogs/1234567890`)
        .send(updatedBlog)
        .set({ Authorization: token })
        .expect(400)
})

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}


describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await usersInDb()

        const newUser = {
            username: 'knimi',
            name: 'nimi',
            password: 'salasana',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await usersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        assert(usernames.includes(newUser.username))
    })
})

test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await usersInDb()

    const newUser = {
        username: 'root',
        name: 'Superuser',
        password: 'salainen',
    }

    const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

    const usersAtEnd = await usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
})

test('creation fails with proper statuscode and message if username is invalid length', async () => {
    const usersAtStart = await usersInDb()

    const newUser = {
        username: 'j',
        name: 'kayttis',
        password: 'salasana',
    }
    const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

    const usersAtEnd = await usersInDb()
    assert(result.body.error.includes('is shorter than the minimum allowed length'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
})

test('creation fails with proper statuscode and message if password is invalid length', async () => {
    const usersAtStart = await usersInDb()

    const newUser = {
        username: 'kayttis',
        name: 'kayttis',
        password: 's',
    }
    const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

    const usersAtEnd = await usersInDb()
    assert(result.body.error.includes('password must be at least 3 characters long'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
})

test('creation fails with proper statuscode and message if username is not given', async () => {
    const usersAtStart = await usersInDb()

    const newUser = {
        name: 'kayttis',
        password: 'salasana',
    }
    const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

    const usersAtEnd = await usersInDb()
    assert(result.body.error.includes('`username` is required'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
})

test('creation fails with proper statuscode and message if password is not given', async () => {
    const usersAtStart = await usersInDb()

    const newUser = {
        username: 'kayttis',
        name: 'kayttis',
    }
    const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

    const usersAtEnd = await usersInDb()
    assert(result.body.error.includes('password must be at least 3 characters long'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
})




after(async () => {
    await mongoose.connection.close()
})