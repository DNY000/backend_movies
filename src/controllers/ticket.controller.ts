import { Request, Response } from 'express'
import { TicketService } from '../services/ticket.service.js'
import { sendSuccess, sendError, sendNotFound, sendBadRequest } from '../utils/response.util.js'

export class TicketController {
  private ticketService = new TicketService()

  // POST /api/tickets/generate/:bookingId
  async generateTickets(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId } = req.params

      const result = await this.ticketService.generateTickets(bookingId)
      sendSuccess(res, result, 'Tickets generated successfully')
    } catch (err: any) {
      sendError(res, 'Error generating tickets', err?.message || 'Unknown error')
    }
  }

  // POST /api/tickets/validate
  async validateTicket(req: Request, res: Response): Promise<void> {
    try {
      const { qrCode } = req.body

      if (!qrCode) {
        return sendBadRequest(res, 'QR code is required')
      }

      const result = await this.ticketService.validateTicket(qrCode)

      if (result.valid) {
        sendSuccess(res, result, 'Ticket validation successful')
      } else {
        sendBadRequest(res, result.message)
      }
    } catch (err: any) {
      sendError(res, 'Error validating ticket', err?.message || 'Unknown error')
    }
  }

  // POST /api/tickets/:id/checkin
  async checkInTicket(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const success = await this.ticketService.checkInTicket(id)

      if (success) {
        sendSuccess(res, { checkedIn: true }, 'Ticket checked in successfully')
      } else {
        sendError(res, 'Failed to check in ticket')
      }
    } catch (err: any) {
      sendError(res, 'Error checking in ticket', err?.message || 'Unknown error')
    }
  }

  // GET /api/tickets/:id
  async getTicketInfo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const ticket = await this.ticketService.getTicketInfo(id)

      if (!ticket) {
        return sendNotFound(res, 'Ticket not found')
      }

      sendSuccess(res, ticket, 'Ticket information retrieved successfully')
    } catch (err: any) {
      sendError(res, 'Error retrieving ticket information', err?.message || 'Unknown error')
    }
  }

  // GET /api/tickets/booking/:bookingId
  async getBookingTickets(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId } = req.params

      const tickets = await this.ticketService.getBookingTickets(bookingId)
      sendSuccess(res, tickets, 'Booking tickets retrieved successfully')
    } catch (err: any) {
      sendError(res, 'Error retrieving booking tickets', err?.message || 'Unknown error')
    }
  }

  // PUT /api/tickets/booking/:bookingId/cancel
  async cancelBookingTickets(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId } = req.params

      const success = await this.ticketService.cancelTickets(bookingId)

      if (success) {
        sendSuccess(res, { cancelled: true }, 'Tickets cancelled successfully')
      } else {
        sendError(res, 'Failed to cancel tickets')
      }
    } catch (err: any) {
      sendError(res, 'Error cancelling tickets', err?.message || 'Unknown error')
    }
  }

  // GET /api/tickets/user/:userId
  async getUserTickets(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params
      const page = parseInt((req.query.page as string) || '0')
      const limit = parseInt((req.query.limit as string) || '10')

      const result = await this.ticketService.getUserTickets(userId, page, limit)
      sendSuccess(res, result, 'User tickets retrieved successfully')
    } catch (err: any) {
      sendError(res, 'Error retrieving user tickets', err?.message || 'Unknown error')
    }
  }
}
