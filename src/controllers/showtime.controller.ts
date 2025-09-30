import { Request, Response } from 'express'
import { ShowtimeService } from '../services/showtime.service.js'

export class ShowtimeController {
  private svc = new ShowtimeService()

  // GET /api/showtimes
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { movieId, roomId, from, to } = req.query as any
      const data = await this.svc.list({ movieId, roomId, from, to })
      res.status(200).json({ success: true, data })
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Error' })
    }
  }
}


