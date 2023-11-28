const express = require('express')
const router = express.Router()
const { Register, Login, verifyEmail, forgetPassword, resetPassword } = require('../controller/auth.controller')
const { CheckLogin, CheckRegister } = require('../middleware/middleware')

router.post('/auth/register', CheckRegister, Register)

router.post('/auth/login', CheckLogin, Login)

router.get('/auth/verify', verifyEmail)

router.post('/auth/forget-password', forgetPassword)

router.put('/auth/reset-password', resetPassword)

module.exports = router