import { Request, Response } from 'express'
import { ShowtimeService } from '../services/showtime.service.js'
import { sendSuccess, sendError } from '../utils/response.util.js'

export class ShowtimeController {
  private svc = new ShowtimeService()

  // GET /api/showtimes
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { movieId, roomId, from, to } = req.query as any
      const data = await this.svc.list({ movieId, roomId, from, to })
      sendSuccess(res, data, 'Showtimes retrieved successfully')
    } catch (err: any) {
      sendError(res, 'Error retrieving showtimes', err?.message || 'Unknown error')
    }
  }
}


