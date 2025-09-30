import { BookingModel } from '../database/models/booking.model'
import { TicketModel } from '../database/models/ticket.model'
import { ShowtimeModel } from '../database/models/showtime.model'
import { SeatModel } from '../database/models/seat.model'
import { SeatTypeModel } from '../database/models/seatType.model'
import { PromotionModel } from '../database/models/promotion.model'

export class BookingService {
  async create(params: { userId: string; showtimeId: string; seatIds: string[]; promotionCode?: string }) {
    const showtime = await ShowtimeModel.findById(params.showtimeId).lean()
    if (!showtime) throw new Error('Showtime not found')

    const basePrice: number = (showtime as any).price ?? 0
    const seats = await SeatModel.find({ _id: { $in: params.seatIds } }).lean()

    let subtotal = 0
    const pricedSeats: Array<{ seatId: any; price: number }> = []
    for (const seat of seats) {
      let multiplier = 1
      if ((seat as any).seatTypeId) {
        const st = await SeatTypeModel.findById((seat as any).seatTypeId).lean()
        const meta = (st as any)?.metadata as any
        if (meta && typeof meta.priceMultiplier === 'number') multiplier = meta.priceMultiplier
      }
      const price = Math.max(0, Math.round(basePrice * multiplier))
      subtotal += price
      pricedSeats.push({ seatId: (seat as any)._id, price })
    }

    // Apply promotion if provided
    let discount = 0
    let appliedPromotionId: any = undefined
    if (params.promotionCode) {
      const promo = await PromotionModel.findOne({ code: params.promotionCode, isActive: true }).lean()
      if (promo) {
        const now = new Date()
        const validFrom = (promo as any).validFrom ? new Date((promo as any).validFrom) : undefined
        const validTo = (promo as any).validTo ? new Date((promo as any).validTo) : undefined
        if ((!validFrom || now >= validFrom) && (!validTo || now <= validTo)) {
          const percent = (promo as any).discountPercent ?? 0
          const amount = (promo as any).discountAmount ?? 0
          const byPercent = percent ? (subtotal * percent) / 100 : 0
          discount = Math.max(byPercent, amount)
          discount = Math.min(discount, subtotal)
          appliedPromotionId = (promo as any)._id
        }
      }
    }

    const totalAmount = Math.max(0, subtotal - discount)

    const booking = await BookingModel.create({
      userId: params.userId,
      showtimeId: params.showtimeId,
      bookingTime: new Date(),
      totalAmount,
      status: 'pending',
      promotionId: appliedPromotionId
    })

    const tickets = [] as any[]
    for (const ps of pricedSeats) {
      tickets.push(await TicketModel.create({
        bookingId: booking._id,
        showtimeId: params.showtimeId,
        seatId: ps.seatId,
        price: ps.price
      }))
    }

    return { booking, tickets, subtotal, discount, totalAmount }
  }

  async get(id: string) {
    return await BookingModel.findById(id).lean()
  }
}


