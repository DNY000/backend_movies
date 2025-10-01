import { Request, Response } from 'express'
import { BookingService } from '../services/booking.service.js'
import { sendSuccess, sendError, sendNotFound, sendBadRequest } from '../utils/response.util.js'
import { HttpStatus } from '../types/common.types.js'
import { validate } from '../utils/validation.util.js'

export class BookingController {
  private svc = new BookingService()

  // POST /api/bookings
  // Note: Basic validation handled by validateBookingBasic middleware
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { userId, showtimeId, seatIds, promotionCode } = req.body
      
      // Advanced validation: Check seat availability, showtime validity, etc.
      // This is business logic validation that goes beyond basic field validation
      
      const data = await this.svc.create({ userId, showtimeId, seatIds, promotionCode })
      sendSuccess(res, data, 'Booking created successfully', HttpStatus.CREATED)
    } catch (err: any) {
      sendError(res, 'Error creating booking', err?.message || 'Unknown error')
    }
  }

  // GET /api/bookings/:id
  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const data = await this.svc.get(id)
      if (!data) {
        return sendNotFound(res, 'Booking not found')
      }
      sendSuccess(res, data, 'Booking retrieved successfully')
    } catch (err: any) {
      sendError(res, 'Error retrieving booking', err?.message || 'Unknown error')
    }
  }

  // GET /api/bookings/user/:userId
  async getUserBookings(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params
      const { status } = req.query
      
      const bookings = await this.svc.getUserBookings(userId, status as string)
      sendSuccess(res, bookings, 'User bookings retrieved successfully')
    } catch (err: any) {
      sendError(res, 'Error retrieving user bookings', err?.message || 'Unknown error')
    }
  }

  // PUT /api/bookings/:id/cancel
  async cancelBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { userId } = req.body
      
      if (!userId) {
        return sendBadRequest(res, 'User ID is required')
      }

      const result = await this.svc.cancelBooking(id, userId)
      sendSuccess(res, result, 'Booking cancelled successfully')
    } catch (err: any) {
      sendError(res, 'Error cancelling booking', err?.message || 'Unknown error')
    }
  }

  // GET /api/bookings/:id/details
  async getBookingDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const data = await this.svc.getBookingWithTickets(id)
      sendSuccess(res, data, 'Booking details retrieved successfully')
    } catch (err: any) {
      sendError(res, 'Error retrieving booking details', err?.message || 'Unknown error')
    }
  }
}


