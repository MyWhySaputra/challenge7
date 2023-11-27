
const { ResponseTemplate } = require('../helper/template.helper')
const Joi = require('joi')
const jwt = require('jsonwebtoken')

function CheckRegister(req, res, next) {
    const schema = Joi.object({
        name: Joi.string().max(255).required(),
        email: Joi.string().email().required(),
        password: Joi.string().alphanum().min(6).required()
    })

    const { error } = schema.validate(req.body)
    if (error) {
        let respErr = ResponseTemplate(null, 'invalid request',
            error.details[0].message, 400)
        res.status(400).json(respErr)
        return
    }
    next()
}

function CheckLogin(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().alphanum().min(6).required()
    })

    const { error } = schema.validate(req.body)
    if (error) {
        let respErr = ResponseTemplate(null, 'invalid request',
            error.details[0].message, 400)
        res.status(400).json(respErr)
        return
    }

    next()
}

async function Auth(req, res, next) {

    const { authorization } = req.headers

    if (!authorization) {
        let resp = ResponseTemplate(null, 'user unauthorized', null, 400)
        res.status(400).json(resp)
        return
    }

    try {

        const user = await jwt.verify(authorization, process.env.SECRET_KEY)

        req.user = user

        next()

    } catch (error) {
        let resp = ResponseTemplate(null, 'user not authorized', null, 401)
        res.status(401).json(resp)
        return
    }
}

module.exports = {
    Auth,
    CheckLogin,
    CheckRegister
}