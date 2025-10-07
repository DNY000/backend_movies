import { validate } from '../utils/validation.util.js'
import { createValidation } from './validation.factory.js'

/**
 * Common Validation Middleware - Sử dụng cho validation cơ bản
 * Dùng middleware cho các validation đơn giản, thường xuyên sử dụng
 */

// Auth validation middleware
export const validateLogin = createValidation.body({
  email: validate.field('Email').required().email(),
  password: validate.field('Password').required().length(6, 50),
})

export const validateRegister = createValidation.body({
  email: validate.field('Email').required().email(),
  password: validate.field('Password').required().length(6, 50),
  name: validate.field('Name').required().length(2, 100),
})

// Movie validation middleware (basic fields only)
export const validateMovieBasic = createValidation.body({
  // No validation - let MongoDB schema handle it
})

// Movie query/filter validation (optional parameters)
export const validateMovieQuery = createValidation.query({
  search: validate.field('Search').length(1, 100), // Optional
  genre: validate.field('Genre').length(1, 50), // Optional
  year: validate.field('Year').range(1900, 2030), // Optional
  rating: validate.field('Rating').range(0, 10), // Optional
  page: validate.field('Page').range(1, 1000), // Optional
  limit: validate.field('Limit').range(1, 100), // Optional
})

// User validation middleware
export const validateUserBasic = createValidation.body({
  email: validate.field('Email').required().email(),
  name: validate.field('Name').required().length(2, 100),
})

// Booking validation middleware
export const validateBookingBasic = createValidation.body({
  userId: validate.field('User ID').required(),
  showtimeId: validate.field('Showtime ID').required(),
  seatIds: validate.field('Seat IDs').required().array(1),
})

// Payment validation middleware
export const validatePaymentBasic = createValidation.body({
  bookingId: validate.field('Booking ID').required(),
  userId: validate.field('User ID').required(),
  amount: validate.field('Amount').required().range(1, 10000000),
  method: validate.field('Payment Method').required(),
})

// ID validation middleware
export const validateId = createValidation.params({
  id: validate.field('ID').required().length(1, 50),
})

// Pagination validation middleware
export const validatePagination = createValidation.query({
  page: validate.field('Page').range(0, 1000),
  limit: validate.field('Limit').range(1, 100),
})
