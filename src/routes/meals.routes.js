const { Router } = require('express')
const multer = require('multer')
const uploadConfig = require('../configs/upload')

const MealsController = require('../controllers/MealsController')
const ensureAuthenticated = require('../middlewares/ensureAuthenticated')
const ensureAdminAuthenticated = require('../middlewares/ensureAdminAuthenticated')

const mealsRoutes = Router()
const upload = multer(uploadConfig.MULTER)

const mealsController = new MealsController()

mealsRoutes.get('/', ensureAuthenticated, mealsController.index)
mealsRoutes.get('/:id', ensureAuthenticated, mealsController.show)
mealsRoutes.post('/', ensureAuthenticated, ensureAdminAuthenticated, mealsController.store)
mealsRoutes.patch('/:id', ensureAuthenticated, ensureAdminAuthenticated, mealsController.update)
mealsRoutes.delete('/:id', ensureAuthenticated, ensureAdminAuthenticated, mealsController.destroy)
mealsRoutes.patch(
    '/:id/image',
    ensureAuthenticated,
    ensureAdminAuthenticated,
    upload.single("image"), mealsController.updateImage
)

module.exports = mealsRoutes
