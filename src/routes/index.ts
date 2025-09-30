import { Router } from 'express';
import { movieRoutes } from './movie.routes.js';
import { userRoutes } from './user.routes.js';
import { authRoutes } from './auth.routes.js';
import { showtimeRoutes } from './showtime.routes.js';
import { venueRoutes } from './venue.routes.js';
import { bookingRoutes } from './booking.routes.js';
import { paymentRoutes } from './payment.routes.js';

const router = Router();

// API Routes
router.use('/api/movies', movieRoutes);
router.use('/api/users', userRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/showtimes', showtimeRoutes);
router.use('/api/venues', venueRoutes);
router.use('/api/bookings', bookingRoutes);
router.use('/api/payments', paymentRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

export { router as routes };
