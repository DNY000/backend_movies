import { Router } from 'express'
import { HttpStatus } from '../types/common.types.js'
import { movieRoutes } from './movie.routes.js'
import { userRoutes } from './user.routes.js'
import { authRoutes } from './auth.routes.js'
import { showtimeRoutes } from './showtime.routes.js'
import { venueRoutes } from './venue.routes.js'
import { bookingRoutes } from './booking.routes.js'
import { paymentRoutes } from './payment.routes.js'
import { seatRoutes } from './seat.routes.js'
import { notificationRoutes } from './notification.routes.js'
import { scheduledNotificationRoutes } from './scheduled-notification.routes.js'
import { ticketRoutes } from './ticket.routes.js'

const router = Router()

// API Routes
router.use('/api/movies', movieRoutes)
router.use('/api/users', userRoutes)
router.use('/api/auth', authRoutes)
router.use('/api/showtimes', showtimeRoutes)
router.use('/api/venues', venueRoutes)
router.use('/api/bookings', bookingRoutes)
router.use('/api/payments', paymentRoutes)
router.use('/api/seats', seatRoutes)
router.use('/api/notifications', notificationRoutes)
router.use('/api/tickets', ticketRoutes)
router.use('/api/scheduled-notifications', scheduledNotificationRoutes)

// Health check
router.get('/health', (req, res) => {
  res.status(HttpStatus.OK).json({
    success: true,
    status: HttpStatus.OK,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  })
})

export { router as routes }
