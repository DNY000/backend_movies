import { Router } from 'express'
import { BookingController } from '../controllers/booking.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { validateBookingBasic } from '../middleware/validation.middleware.js'

const router = Router()
const ctrl = new BookingController()

router.post('/', authMiddleware, validateBookingBasic, (req, res) => ctrl.create(req, res))
router.get('/:id', (req, res) => ctrl.get(req, res))

export { router as bookingRoutes }


