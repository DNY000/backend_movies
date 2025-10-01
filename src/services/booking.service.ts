import { BookingModel } from '../database/models/booking.model'
import { TicketModel } from '../database/models/ticket.model'
import { ShowtimeModel } from '../database/models/showtime.model'
import { SeatModel } from '../database/models/seat.model'
import { SeatTypeModel } from '../database/models/seatType.model'
import { PromotionModel } from '../database/models/promotion.model'
import { SeatService } from './seat.service.js'

export class BookingService {
  private seatService = new SeatService()

  async create(params: { userId: string; showtimeId: string; seatIds: string[]; promotionCode?: string }) {
    // Check seat availability first
    const availability = await this.seatService.checkSeatsAvailable(params.showtimeId, params.seatIds)
    if (!availability.allAvailable) {
      throw new Error(`Some seats are not available: ${availability.unavailableSeats.join(', ')}`)
    }

    // Hold seats temporarily during booking process
    const holdSuccess = await this.seatService.holdSeats(params.showtimeId, params.seatIds, params.userId, 15)
    if (!holdSuccess) {
      throw new Error('Failed to hold seats for booking')
    }

    try {
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

      // Confirm seat holds after successful booking
      await this.seatService.confirmSeats(params.showtimeId, params.seatIds, params.userId)

      return { booking, tickets, subtotal, discount, totalAmount }
    } catch (error) {
      // Release held seats if booking fails
      await this.seatService.releaseSeats(params.showtimeId, params.seatIds, params.userId)
      throw error
    }
  }

  async get(id: string) {
    return await BookingModel.findById(id)
      .populate('userId', 'name email')
      .populate('showtimeId')
      .populate('promotionId')
      .lean()
  }

  async getUserBookings(userId: string, status?: string) {
    const filter: any = { userId }
    if (status) {
      filter.status = status
    }

    return await BookingModel.find(filter)
      .populate('showtimeId')
      .populate('promotionId')
      .sort({ createdAt: -1 })
      .lean()
  }

  async cancelBooking(bookingId: string, userId: string) {
    const booking = await BookingModel.findOne({ _id: bookingId, userId }).lean()
    if (!booking) {
      throw new Error('Booking not found')
    }

    if (booking.status !== 'pending') {
      throw new Error('Only pending bookings can be cancelled')
    }

    // Get tickets for this booking
    const tickets = await TicketModel.find({ bookingId }).lean()
    const seatIds = tickets.map(ticket => ticket.seatId.toString())

    // Release seats
    await this.seatService.releaseSeats(
      booking.showtimeId.toString(), 
      seatIds, 
      userId
    )

    // Update booking status
    await BookingModel.findByIdAndUpdate(bookingId, { 
      status: 'cancelled' 
    })

    // Note: In a real system, you might want to keep tickets for audit purposes
    // but mark them as cancelled instead of deleting them

    return { success: true, message: 'Booking cancelled successfully' }
  }

  async getBookingWithTickets(bookingId: string) {
    const booking = await BookingModel.findById(bookingId)
      .populate('userId', 'name email')
      .populate('showtimeId')
      .populate('promotionId')
      .lean()

    if (!booking) {
      throw new Error('Booking not found')
    }

    const tickets = await TicketModel.find({ bookingId })
      .populate('seatId')
      .lean()

    return { booking, tickets }
  }
}


