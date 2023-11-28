const bcrypt = require('bcrypt');

function HashPassword(pass) {
    const saltParse = parseInt(process.env.SALT_ROUND)
    const salt = bcrypt.genSaltSync(saltParse)
    const hash = bcrypt.hashSync(pass, salt)
    return hash
}

function ComparePassword(pass, hashPassword) {
    const compare = bcrypt.compareSync(pass, hashPassword)
    return compare
}

function HashToken(token) {
    const salt = bcrypt.genSaltSync(4)
    const hash = bcrypt.hashSync(token, salt)
    return hash
}

function CompareToken(token, hashToken) {
    const compare = bcrypt.compareSync(token, hashToken)
    return compare
}

module.exports = {
    HashPassword,
    ComparePassword,
    HashToken,
    CompareToken
}