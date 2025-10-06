import { Router } from 'express'
import { SeatController } from '../controllers/seat.controller.js'

const router = Router()
const seatController = new SeatController()

// Public endpoint for Flutter seat page
router.get('/discovery', seatController.getDiscovery.bind(seatController))
router.get('/availability', seatController.getAvailability.bind(seatController))

export { router as seatRoutes }
