import { Router } from 'express'
import { VenueController } from '../controllers/venue.controller.js'

const router = Router()
const ctrl = new VenueController()

router.get('/cinemas', (req, res) => ctrl.cinemas(req, res))
router.get('/cinemas/:cinemaId/rooms', (req, res) => ctrl.rooms(req, res))
router.get('/rooms/:roomId/seats', (req, res) => ctrl.seats(req, res))

export { router as venueRoutes }


