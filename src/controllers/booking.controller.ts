import { Request, Response } from 'express'
import { BookingService } from '../services/booking.service.js'

export class BookingController {
  private svc = new BookingService()

  // POST /api/bookings
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { userId, showtimeId, seatIds, promotionCode } = req.body
      const data = await this.svc.create({ userId, showtimeId, seatIds, promotionCode })
      res.status(201).json({ success: true, data })
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Error' })
    }
  }

  // GET /api/bookings/:id
  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const data = await this.svc.get(id)
      if (!data) { res.status(404).json({ success: false, message: 'Not found' }); return }
      res.status(200).json({ success: true, data })
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Error' })
    }
  }
}


