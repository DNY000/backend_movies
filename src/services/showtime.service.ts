import { ShowtimeModel } from '../database/models/showtime.model'
import type { FilterQuery } from 'mongoose'

export class ShowtimeService {
  async list(params: { movieId?: string; roomId?: string; from?: string; to?: string }) {
    const filter: FilterQuery<any> = {}
    if (params.movieId) filter.movieId = params.movieId
    if (params.roomId) filter.roomId = params.roomId
    if (params.from || params.to) {
      filter.startTime = {}
      if (params.from) filter.startTime.$gte = new Date(params.from)
      if (params.to) filter.startTime.$lte = new Date(params.to)
    }

    return await ShowtimeModel.find(filter).sort({ startTime: 1 }).lean()
  }
}


