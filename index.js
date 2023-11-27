require('dotenv').config()
const express = require('express')
const http = require('http')
const socketIo = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIo(server)
const router = require('./routes/routes')

const initializeSentry = require('./lib/Sentry')

initializeSentry

const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/', router)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

const connectedUsers = {};

io.on('connection', (socket) => {
    console.log('User connected')
    
    socket.on('newAccount', (userId) => {
        connectedUsers[userId] = socket
        socket.userId = userId
        io.to(socket.id).emit('welcome', 'Selamat datang di aplikasi!')
    })
    
    socket.on('passwordChanged', (userId) => {
        if (connectedUsers[userId]) {
            io.to(connectedUsers[userId].id).emit('passwordChangedSuccess', 'Password berhasil diubah!')
        }
    })

    socket.on('disconnect', () => {
        console.log('User disconnected')
        delete connectedUsers[socket.userId]
    })
})