/**
 * Controllers Index
 *
 * This file exports all controllers for easy importing.
 * Controllers handle HTTP requests and responses.
 */

// Import controllers
import { MovieController } from './movie.controller.js'
import { UserController } from './user.controller.js'
import { AuthController } from './auth.controller.js'
import { BookingController } from './booking.controller.js'
import { PaymentController } from './payment.controller.js'
import { ShowtimeController } from './showtime.controller.js'
import { VenueController } from './venue.controller.js'
import { TicketController } from './ticket.controller.js'
import { NotificationController } from './notification.controller.js'
import { ScheduledNotificationController } from './scheduled-notification.controller.js'

// Export all controllers
export * from './movie.controller.js'
export * from './user.controller.js'
export * from './auth.controller.js'
export * from './booking.controller.js'
export * from './payment.controller.js'
export * from './showtime.controller.js'
export * from './venue.controller.js'
export * from './ticket.controller.js'
export * from './notification.controller.js'
export * from './scheduled-notification.controller.js'

// Controller factory function for dependency injection
export const createControllers = () => ({
  movieController: new MovieController(),
  userController: new UserController(),
  authController: new AuthController(),
  bookingController: new BookingController(),
  paymentController: new PaymentController(),
  showtimeController: new ShowtimeController(),
  venueController: new VenueController(),
  ticketController: new TicketController(),
  notificationController: new NotificationController(),
  scheduledNotificationController: new ScheduledNotificationController(),
})

// Controller registry for easy access
export const controllerRegistry = {
  movie: 'MovieController',
  user: 'UserController',
  auth: 'AuthController',
  booking: 'BookingController',
  payment: 'PaymentController',
  showtime: 'ShowtimeController',
  venue: 'VenueController',
  ticket: 'TicketController',
  notification: 'NotificationController',
  scheduledNotification: 'ScheduledNotificationController',
} as const

export type ControllerType = keyof typeof controllerRegistry
