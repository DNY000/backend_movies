import { Router } from 'express'
import { TicketController } from '../controllers/ticket.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()
const ctrl = new TicketController()

// Generate tickets for a booking (requires auth)
router.post('/generate/:bookingId', authMiddleware, (req, res) => ctrl.generateTickets(req, res))

// Validate ticket by QR/string (requires auth)
router.post('/validate', authMiddleware, (req, res) => ctrl.validateTicket(req, res))

// Check-in a ticket (requires auth)
router.post('/:id/checkin', authMiddleware, (req, res) => ctrl.checkInTicket(req, res))

// Get a ticket by id (requires auth)
router.get('/:id', authMiddleware, (req, res) => ctrl.getTicketInfo(req, res))

// Get all tickets for a booking (requires auth)
router.get('/booking/:bookingId', authMiddleware, (req, res) => ctrl.getBookingTickets(req, res))

// Get tickets of a user (requires auth) — supports ?page=&limit=
router.get('/user/:userId', authMiddleware, (req, res) => ctrl.getUserTickets(req, res))

export { router as ticketRoutes }
