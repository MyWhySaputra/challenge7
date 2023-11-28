require('dotenv').config()
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const router = require('./routes/routes')
const jwt = require('jsonwebtoken')

const initializeSentry = require('./lib/Sentry')

initializeSentry

const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

http.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

app.use('/', router)

io.on('connection', async (socket) => {
    try {
        const { token } = socket.handshake.headers

        if (!token) {
            throw new Error('User not authenticated')
        }

        const user = await jwt.verify(token, process.env.SECRET_KEY)

        socket.on(token, (data) => {
            io.emit(token, data)
        })

        socket.emit(token, `welcome ${user.email}`)

        socket.on('disconnect', () => {
            console.log(`user ${user.email} disconnected`)
        })
    } catch (error) {
        console.error(`Socket error: ${error.message}`)
        socket.disconnect(true)
    }
})