import { Request, Response } from 'express'
import { sendSuccess, sendBadRequest, sendError } from '../utils/response.util.js'
import { HttpStatus } from '../types/common.types.js'
import { SeatService } from '../services/seat.service.js'
import { ShowtimeModel } from '../database/models/showtime.model.js'
import { MovieModel } from '../database/models/movie.model.js'
import { RoomModel } from '../database/models/room.model.js'
// Removed unused import 'CinemaModel'
import { SeatTypeModel } from '../database/models/seatType.model.js'

export class SeatController {
  private seatService: SeatService

  constructor() {
    this.seatService = new SeatService()
  }

  // GET /api/seats/discovery?movieId=...
  // Returns cinemas -> dates -> showtime slots for a given movie
  async getDiscovery(req: Request, res: Response): Promise<void> {
    try {
      const { movieId } = req.query as { movieId?: string }
      if (!movieId) {
        return sendBadRequest(res, 'movieId is required')
      }

      // Find all showtimes for this movie
      const showtimes = await ShowtimeModel.find({ movieId }).lean()

      // Preload rooms and cinemas referenced
      const roomIds = Array.from(new Set(showtimes.map(st => (st as any).roomId?.toString()).filter(Boolean)))
      const rooms = await RoomModel.find({ _id: { $in: roomIds } })
        .populate('cinemaId')
        .lean()
      const roomMap = new Map<string, any>(rooms.map(r => [r._id.toString(), r]))

      // Group by cinema -> date -> showtime slots
      const cinemasMap: Record<string, any> = {}

      for (const st of showtimes) {
        const room = roomMap.get((st as any).roomId?.toString())
        const cinema = room ? (room as any).cinemaId : null
        if (!cinema) continue

        const cinemaId = (cinema as any)._id.toString()
        if (!cinemasMap[cinemaId]) {
          cinemasMap[cinemaId] = {
            id: cinemaId,
            name: (cinema as any).name,
            address: (cinema as any).address,
            rooms: {},
            dates: {},
          }
        }

        // date key as YYYY-MM-DD
        const start = new Date((st as any).startTime)
        const yyyy = start.getUTCFullYear()
        const mm = String(start.getUTCMonth() + 1).padStart(2, '0')
        const dd = String(start.getUTCDate()).padStart(2, '0')
        const dateKey = `${yyyy}-${mm}-${dd}`

        if (!cinemasMap[cinemaId].dates[dateKey]) {
          cinemasMap[cinemaId].dates[dateKey] = []
        }

        cinemasMap[cinemaId].dates[dateKey].push({
          showtimeId: (st as any)._id.toString(),
          startTime: (st as any).startTime,
          endTime: (st as any).endTime,
          price: (st as any).price,
          room: room ? { id: room._id.toString(), name: (room as any).name } : undefined,
        })
      }

      // Normalize to array structure
      const cinemas = Object.values(cinemasMap).map((c: any) => ({
        id: c.id,
        name: c.name,
        address: c.address,
        dates: Object.keys(c.dates)
          .sort()
          .map(date => ({
            date,
            showtimes: c.dates[date].sort(
              (a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
            ),
          })),
      }))

      const movie = await MovieModel.findById(movieId).lean()

      const payload = {
        movie: movie
          ? { id: (movie as any)._id.toString(), title: (movie as any).title }
          : { id: movieId, title: 'Unknown Movie' },
        cinemas,
      }

      sendSuccess(res, payload, 'Showtime discovery retrieved')
    } catch (error) {
      sendError(
        res,
        'Failed to get showtime discovery',
        error instanceof Error ? error.message : 'Unknown error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  // GET /api/seats/availability?showtimeId=...&roomId=...
  async getAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { showtimeId, roomId } = req.query as { showtimeId?: string; roomId?: string }
      if (!showtimeId) {
        return sendBadRequest(res, 'showtimeId is required')
      }

      const showtime = await ShowtimeModel.findById(showtimeId).lean()
      if (!showtime) {
        return sendBadRequest(res, 'Showtime not found')
      }

      const roomIdToUse = roomId || (showtime as any).roomId?.toString()
      if (!roomIdToUse) {
        return sendBadRequest(res, 'roomId is missing')
      }

      const [movie, room, cinema, seatTypes] = await Promise.all([
        MovieModel.findById((showtime as any).movieId).lean(),
        RoomModel.findById(roomIdToUse).lean(),
        (async () => {
          const r = await RoomModel.findById(roomIdToUse).populate('cinemaId').lean()
          return (r as any)?.cinemaId || null
        })(),
        SeatTypeModel.find().lean(),
      ])

      const availability = await this.seatService.getSeatAvailability(showtimeId, roomIdToUse)

      // Build seatTypes map for pricing metadata
      const seatTypeMap: Record<string, { description?: string; priceMultiplier?: number }> = {}
      for (const st of seatTypes || []) {
        seatTypeMap[(st as any).code] = {
          description: (st as any).description,
          priceMultiplier: (st as any).metadata?.priceMultiplier,
        }
      }

      const basePrice = (showtime as any).price || 0
      const layoutRows: Record<string, any[]> = {}

      for (const s of availability) {
        const rowLabel = s.seatRow
        if (!layoutRows[rowLabel]) layoutRows[rowLabel] = []
        const multiplier = seatTypeMap[s.seatType]?.priceMultiplier ?? 1
        const price = Math.round(basePrice * multiplier)
        layoutRows[rowLabel].push({
          id: s.seatId,
          number: s.seatNumber,
          type: s.seatType,
          price,
          status: s.status,
          heldBy: s.heldBy,
          holdUntil: s.holdUntil,
        })
      }

      const layout = Object.keys(layoutRows)
        .sort()
        .map(rowLabel => ({
          rowLabel,
          seats: layoutRows[rowLabel].sort((a, b) => a.number - b.number),
        }))

      const responsePayload = {
        showtime: {
          id: (showtime as any)._id?.toString(),
          movieTitle: (movie as any)?.title || 'Unknown Movie',
          startTime: (showtime as any).startTime,
          endTime: (showtime as any).endTime,
          room: {
            id: (room as any)?._id?.toString(),
            name: (room as any)?.name,
            cinema: cinema
              ? {
                  id: (cinema as any)?._id?.toString(),
                  name: (cinema as any)?.name,
                  address: (cinema as any)?.address,
                }
              : undefined,
          },
          pricing: {
            basePrice,
            currency: 'VND',
            seatTypes: Object.fromEntries(
              Object.entries(seatTypeMap).map(([code, v]) => [
                code,
                {
                  description: v.description,
                  priceMultiplier: v.priceMultiplier,
                },
              ]),
            ),
          },
        },
        holds: {
          enabled: true,
          holdMinutes: 15,
          serverTime: new Date().toISOString(),
        },
        layout,
        legend: {
          status: {
            available: 'Có thể chọn',
            held: 'Đang được giữ tạm',
            booked: 'Đã bán',
          },
          type: Object.fromEntries(Object.entries(seatTypeMap).map(([code, v]) => [code, v.description || code])),
        },
        selectionRules: {
          maxSeatsPerOrder: 8,
          preventSingleSeatGap: true,
          mustBeSameRow: false,
        },
        apiEndpoints: {
          availability: `/api/seats/availability?showtimeId=${(showtime as any)._id?.toString()}&roomId=${roomIdToUse}`,
          hold: '/api/seats/hold',
          release: '/api/seats/release',
          createBooking: '/api/bookings',
        },
      }

      sendSuccess(res, responsePayload, 'Seat availability retrieved')
    } catch (error) {
      sendError(
        res,
        'Failed to get seat availability',
        error instanceof Error ? error.message : 'Unknown error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
}
