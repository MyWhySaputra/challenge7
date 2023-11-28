const { HashPassword, ComparePassword } = require('../helper/hash_pass_helper')
const { ResponseTemplate } = require('../helper/template.helper')
const transporter = require('../lib/nodemailer')
const Sentry = require("@sentry/node")
const { PrismaClient } = require('@prisma/client')

// const io = require('socket.io-client')
// const socket = io('http://localhost:8080')

const prisma = new PrismaClient()
var jwt = require('jsonwebtoken')

async function Create(req, res) {

    const { name, email, password } = req.body

    const hashPass = await HashPassword(password)

    const payload = {
        name,
        email,
        password: hashPass
    }

    const emailUser = await prisma.user.findUnique({
        where: {email: payload.email},
    });

    if (emailUser) {
        let resp = ResponseTemplate(null, 'Email already exist', null, 404)
        res.status(404).json(resp)
        return
    }

    try {
        
        await prisma.user.create({
            data: payload
        })

        await transporter.sendMail({
            from: process.env.EMAIL_SMTP, 
            to: payload.email, 
            subject: "Verification your email", 
            text: `Click here to verify your email`,
            html: `<a href="${process.env.BASE_URL}api/v1/auth/verify?email=${payload.email}">Click here to verify your email</a>`,
        })

        const userView = await prisma.user.findUnique({
            where: {
                email: payload.email
            },
            select: {
                name: true,
                email: true
            },
        })

        let resp = ResponseTemplate(userView, 'success, please check your email for verification', null, 200)
        res.status(200).json(resp);
        return

    } catch (error) {
        let resp = ResponseTemplate(null, 'internal server error', error, 500)
        Sentry.captureException(error)
        res.status(500).json(resp)
        return
    }
}

async function Login(req, res) {

    try {
        const { email, password } = req.body

        const checkUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (checkUser === null) {
            let resp = ResponseTemplate(null, 'email is not found or incorrect', null, 400)
            res.status(400).json(resp)
            return
        }

        const checkPassword = await ComparePassword(password, checkUser.password)

        if (!checkPassword) {
            let resp = ResponseTemplate(null, 'password is not correct', null, 400)
            res.status(400).json(resp)
            return
        }

        const token = jwt.sign({
            id: checkUser.id,
            email: checkUser.email,
        }, process.env.SECRET_KEY,
            // { expiresIn: '24h' }
        )

        // const data = 'Welcome new user'

        // socket.emit(token, data)

        let resp = ResponseTemplate(token, 'success', null, 200)
        res.status(200).json(resp)
        return

    } catch (error) {
        let resp = ResponseTemplate(null, 'internal server error', error, 500)
        Sentry.captureException(error)
        res.status(500).json(resp)
        return
    }
}

async function verifyEmail(req, res) {

    const { email } = req.query

    try {

        await prisma.user.update({
            where: {
                email: email
            },
            data: {
                is_verified: true
            }
        })

        let resp = ResponseTemplate(null, 'your email has been verified', null, 200)
        res.status(200).json(resp);
        return

    } catch (error) {
        let resp = ResponseTemplate(null, 'internal server error', error, 500)
        Sentry.captureException(error)
        res.status(500).json(resp)
        return
    }
}

async function forgotPassword(req, res) {

    const { email } = req.body

    try {

        const checkUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (checkUser === null) {
            let resp = ResponseTemplate(null, 'email is not found or incorrect', null, 400)
            res.status(400).json(resp)
            return
        }

        const token = jwt.sign({
            id: checkUser.id,
            email: checkUser.email,
        }, process.env.SECRET_KEY,
            { expiresIn: '1h' }
        );

        await transporter.sendMail({
            from: process.env.EMAIL_SMTP, 
            to: email, 
            subject: "Reset your password",
            html: `Copy this link = ${process.env.BASE_URL}api/v1/auth/reset-password?token=${token}`,
        })

        let resp = ResponseTemplate(null, 'your email has been verified', null, 200)
        res.status(200).json(resp);
        return

    } catch (error) {
        let resp = ResponseTemplate(null, 'internal server error', error, 500)
        Sentry.captureException(error)
        res.status(500).json(resp)
        return
    }
}

async function resetPassword(req, res) {

    const { newPassword } = req.body

    const token = req.query

    try {

        const user = await jwt.verify(token, process.env.SECRET_KEY)

        const encryptedPassword = await HashPassword(newPassword)

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: encryptedPassword,
            },
        })

        // const data = 'Password changed'

        // socket.emit(token, data)

        let resp = ResponseTemplate(null, 'Password reset successfully', null, 200)
        res.status(200).json(resp);
        return

    } catch (error) {
        let resp = ResponseTemplate(null, 'internal server error', error, 500)
        Sentry.captureException(error)
        res.status(500).json(resp)
        return
    }
}

module.exports = {
    Create,
    Login,
    verifyEmail,
    forgotPassword,
    resetPassword
}