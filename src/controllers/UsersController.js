const { hash, compare } = require('bcryptjs')
const AppError = require('../utils/AppError')
const knex = require("../database/knex")
const authConfig = require("../configs/auth")
const { sign } = require("jsonwebtoken")

class UsersController {
  async create(request, response) {
    const { name, email, password } = request.body

    let user = await knex("users").where({ email }).first()

    if (user) {
      throw new AppError("Este e-mail já está em uso.")
    }

    const hashedPassword = await hash(password, 8)

    const [ id ] = await knex("users").insert({ name, email, password: hashedPassword })
    user = await knex("users").where({ id }).first()

    const { secret, expiresIn } = authConfig.jwt
    const token = sign({}, secret, { subject: String(id), expiresIn })

    return response.status(201).json({ user, token })
  }

  async login(request, response) {
    const { email, password } = request.body

    const user = await knex("users").where({ email }).first()

    if (!user) {
      throw new AppError("Email e/ou senha incorretas", 401)
    }

    const passwordMatches = await compare(password, user.password)

    if (!passwordMatches) {
      throw new AppError("Email e/ou senha incorretas", 401)
    }

    const { secret, expiresIn } = authConfig.jwt
    const token = sign({}, secret, { subject: String(user.id), expiresIn })

    return response.json({ user, token })
  }
}

module.exports = UsersController
