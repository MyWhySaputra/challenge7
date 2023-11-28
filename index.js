require('dotenv').config()
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const router = require('./routes/routes')
const jwt = require('jsonwebtoken')
const { CompareToken } = require('./helper/hash_pass_helper')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

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
        const { token, event } = socket.handshake.headers

        if (!token) {
            throw new Error('User not authenticated')
        }

        const user = await jwt.verify(token, process.env.SECRET_KEY)

        const checkTemp = await prisma.temp.findUnique({
            where: {
                email: user.email
            }
        })

        const welcome = 'welcome'

        const password = 'success'

        const notif1 = await CompareToken(welcome, checkTemp.hashtoken)

        const notif2 = await CompareToken(password, checkTemp.hashtoken)

        if (notif1) {
            var pesan = 'wellcome'
        } else if (notif2) {
            var pesan = 'Your password has been changed !!!'
        }

        socket.emit(event, pesan)

        socket.on('disconnect', async () => {
            console.log(`user ${user.email} disconnected`)
            await prisma.temp.delete({
                where: {
                    email: user.email
                }
            })
        })
    } catch (error) {
        console.error(`Socket error: ${error.message}`)
        socket.disconnect(true)
    }
})