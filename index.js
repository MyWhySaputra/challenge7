require('dotenv').config()
const express = require('express')
const app = express()
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