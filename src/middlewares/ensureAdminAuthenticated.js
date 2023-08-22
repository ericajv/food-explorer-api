const AppError = require("../utils/AppError")
const knex = require("../database/knex")

async function ensureAdminAuthenticated(request, response, next) {
  if (!request.user.id) {
    throw new AppError("Apenas usuários com papel de administrador podem acessar este recurso", 401)
  }

  // const user = await knex("users").where({ id: request.user.id }).first()

  // if (!user || user.role != 'admin') {
  //   throw new AppError("Apenas usuários com papel de administrador podem acessar este recurso", 401)
  // }

  return next()
}

module.exports = ensureAdminAuthenticated