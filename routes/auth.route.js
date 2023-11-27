const express = require('express')
const router = express.Router()
const { Create, Login, verifyEmail, forgotPassword, resetPassword } = require('../controller/auth.controller')
const { CheckLogin, CheckRegister } = require('../middleware/middleware')

router.post('/auth/create', CheckRegister, Create)

router.post('/auth/login', CheckLogin, Login)

router.get('/auth/verify', verifyEmail)

router.post('/auth/forgot-password', forgotPassword)

router.put('/auth/reset-password', resetPassword)

module.exports = router