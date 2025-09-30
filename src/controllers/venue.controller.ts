import { Request, Response } from 'express'
import { VenueService } from '../services/venue.service.js'

export class VenueController {
  private svc = new VenueService()

  async cinemas(_req: Request, res: Response): Promise<void> {
    try {
      const data = await this.svc.listCinemas()
      res.status(200).json({ success: true, data })
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Error' })
    }
  }

  async rooms(req: Request, res: Response): Promise<void> {
    try {
      const { cinemaId } = req.params
      const data = await this.svc.listRoomsByCinema(cinemaId)
      res.status(200).json({ success: true, data })
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Error' })
    }
  }

  async seats(req: Request, res: Response): Promise<void> {
    try {
      const { roomId } = req.params
      const data = await this.svc.listSeatsByRoom(roomId)
      res.status(200).json({ success: true, data })
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Error' })
    }
  }
}


