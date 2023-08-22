const { Router } = require('express')

const UsersController = require('../controllers/UsersController')

const usersRoutes = Router()

const usersController = new UsersController()

usersRoutes.post('/', usersController.create)
usersRoutes.post('/login', usersController.login)

module.exports = usersRoutes
