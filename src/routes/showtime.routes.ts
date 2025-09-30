import { Router } from 'express'
import { ShowtimeController } from '../controllers/showtime.controller.js'

const router = Router()
const ctrl = new ShowtimeController()

router.get('/', (req, res) => ctrl.list(req, res))

export { router as showtimeRoutes }


