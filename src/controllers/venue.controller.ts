import { Request, Response } from 'express'
import { VenueService } from '../services/venue.service.js'
import { SeatService } from '../services/seat.service.js'
import { sendSuccess, sendError, sendBadRequest } from '../utils/response.util.js'

export class VenueController {
  private svc = new VenueService()
  private seatService = new SeatService()

  async cinemas(_req: Request, res: Response): Promise<void> {
    try {
      const data = await this.svc.listCinemas()
      sendSuccess(res, data, 'Cinemas retrieved successfully')
    } catch (err: any) {
      sendError(res, 'Error retrieving cinemas', err?.message || 'Unknown error')
    }
  }

  async rooms(req: Request, res: Response): Promise<void> {
    try {
      const { cinemaId } = req.params
      const data = await this.svc.listRoomsByCinema(cinemaId)
      sendSuccess(res, data, 'Rooms retrieved successfully')
    } catch (err: any) {
      sendError(res, 'Error retrieving rooms', err?.message || 'Unknown error')
    }
  }

  async seats(req: Request, res: Response): Promise<void> {
    try {
      const { roomId } = req.params
      const data = await this.svc.listSeatsByRoom(roomId)
      sendSuccess(res, data, 'Seats retrieved successfully')
    } catch (err: any) {
      sendError(res, 'Error retrieving seats', err?.message || 'Unknown error')
    }
  }

  // GET /api/venues/seats/availability/:showtimeId
  async seatAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { showtimeId } = req.params
      const { roomId } = req.query

      if (!roomId) {
        return sendBadRequest(res, 'Room ID is required')
      }

      const availability = await this.seatService.getSeatAvailability(
        showtimeId, 
        roomId as string
      )
      
      sendSuccess(res, availability, 'Seat availability retrieved successfully')
    } catch (err: any) {
      sendError(res, 'Error retrieving seat availability', err?.message || 'Unknown error')
    }
  }

  // POST /api/venues/seats/hold
  async holdSeats(req: Request, res: Response): Promise<void> {
    try {
      const { showtimeId, seatIds, userId, holdMinutes = 15 } = req.body

      if (!showtimeId || !seatIds || !userId) {
        return sendBadRequest(res, 'Showtime ID, seat IDs, and user ID are required')
      }

      const success = await this.seatService.holdSeats(
        showtimeId, 
        seatIds, 
        userId, 
        holdMinutes
      )

      if (success) {
        sendSuccess(res, { holdMinutes }, 'Seats held successfully')
      } else {
        sendBadRequest(res, 'Failed to hold seats - some seats may not be available')
      }
    } catch (err: any) {
      sendError(res, 'Error holding seats', err?.message || 'Unknown error')
    }
  }

  // POST /api/venues/seats/release
  async releaseSeats(req: Request, res: Response): Promise<void> {
    try {
      const { showtimeId, seatIds, userId } = req.body

      if (!showtimeId || !seatIds || !userId) {
        return sendBadRequest(res, 'Showtime ID, seat IDs, and user ID are required')
      }

      const success = await this.seatService.releaseSeats(showtimeId, seatIds, userId)

      if (success) {
        sendSuccess(res, null, 'Seats released successfully')
      } else {
        sendError(res, 'Failed to release seats')
      }
    } catch (err: any) {
      sendError(res, 'Error releasing seats', err?.message || 'Unknown error')
    }
  }

  // GET /api/venues/seats/check-availability
  async checkSeatAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { showtimeId, seatIds } = req.query

      if (!showtimeId || !seatIds) {
        return sendBadRequest(res, 'Showtime ID and seat IDs are required')
      }

      const seatIdArray = Array.isArray(seatIds) ? seatIds : [seatIds]
      const availability = await this.seatService.checkSeatsAvailable(
        showtimeId as string, 
        seatIdArray as string[]
      )

      sendSuccess(res, availability, 'Seat availability checked successfully')
    } catch (err: any) {
      sendError(res, 'Error checking seat availability', err?.message || 'Unknown error')
    }
  }
}


