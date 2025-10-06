/* eslint-disable no-console */
import { SeatModel } from '../database/models/seat.model.js'
import { SeatHoldModel } from '../database/models/seatHold.model.js'
import { TicketModel } from '../database/models/ticket.model.js'
import { Types } from 'mongoose'

export interface SeatAvailability {
  seatId: string
  seatRow: string
  seatNumber: number
  seatType: string
  price: number
  status: 'available' | 'held' | 'booked'
  heldBy?: string
  holdUntil?: Date
}

export class SeatService {
  /**
   * Get seat availability for a specific showtime
   */
  async getSeatAvailability(showtimeId: string, roomId: string): Promise<SeatAvailability[]> {
    // Get all seats in the room
    const seats = await SeatModel.find({ roomId }).populate('seatTypeId').lean()

    // Get booked seats (confirmed tickets)
    const bookedSeats = await TicketModel.find({ showtimeId }).select('seatId').lean()
    const bookedSeatIds = bookedSeats.map(ticket => ticket.seatId.toString())

    // Get held seats (temporary holds)
    const heldSeats = await SeatHoldModel.find({
      showtimeId,
      status: 'holding',
      holdUntil: { $gt: new Date() },
    }).lean()
    const heldSeatMap = new Map(
      heldSeats.map(hold => [hold.seatId.toString(), { userId: hold.userId.toString(), holdUntil: hold.holdUntil }]),
    )

    // Build availability response
    const availability: SeatAvailability[] = seats.map(seat => {
      const seatId = seat._id.toString()
      const seatType = (seat as any).seatTypeId

      let status: 'available' | 'held' | 'booked' = 'available'
      let heldBy: string | undefined
      let holdUntil: Date | undefined

      if (bookedSeatIds.includes(seatId)) {
        status = 'booked'
      } else if (heldSeatMap.has(seatId)) {
        status = 'held'
        const holdInfo = heldSeatMap.get(seatId)!
        heldBy = holdInfo.userId
        holdUntil = holdInfo.holdUntil
      }

      return {
        seatId,
        seatRow: (seat as any).seatRow,
        seatNumber: (seat as any).seatNumber,
        seatType: seatType?.code || 'STD',
        price: this.calculateSeatPrice(100, seatType?.metadata?.priceMultiplier || 1), // Base price from showtime
        status,
        heldBy,
        holdUntil,
      }
    })

    return availability
  }

  /**
   * Hold seats temporarily for a user
   */
  async holdSeats(showtimeId: string, seatIds: string[], userId: string, holdMinutes: number = 15): Promise<boolean> {
    const holdUntil = new Date()
    holdUntil.setMinutes(holdUntil.getMinutes() + holdMinutes)

    try {
      // Check if seats are available
      const availability = await this.checkSeatsAvailable(showtimeId, seatIds)
      if (!availability.allAvailable) {
        throw new Error(`Some seats are not available: ${availability.unavailableSeats.join(', ')}`)
      }

      // Create seat holds
      const seatHolds = seatIds.map(seatId => ({
        showtimeId: new Types.ObjectId(showtimeId),
        seatId: new Types.ObjectId(seatId),
        userId: new Types.ObjectId(userId),
        holdUntil,
        status: 'holding' as const,
      }))

      await SeatHoldModel.insertMany(seatHolds)
      return true
    } catch (error) {
      console.error('Error holding seats:', error)
      return false
    }
  }

  /**
   * Release held seats
   */
  async releaseSeats(showtimeId: string, seatIds: string[], userId: string): Promise<boolean> {
    try {
      await SeatHoldModel.deleteMany({
        showtimeId,
        seatId: { $in: seatIds.map(id => new Types.ObjectId(id)) },
        userId: new Types.ObjectId(userId),
        status: 'holding',
      })
      return true
    } catch (error) {
      console.error('Error releasing seats:', error)
      return false
    }
  }

  /**
   * Confirm held seats (convert to booked)
   */
  async confirmSeats(showtimeId: string, seatIds: string[], userId: string): Promise<boolean> {
    try {
      await SeatHoldModel.updateMany(
        {
          showtimeId,
          seatId: { $in: seatIds.map(id => new Types.ObjectId(id)) },
          userId: new Types.ObjectId(userId),
          status: 'holding',
        },
        { status: 'confirmed' },
      )
      return true
    } catch (error) {
      console.error('Error confirming seats:', error)
      return false
    }
  }

  /**
   * Check if specific seats are available
   */
  async checkSeatsAvailable(
    showtimeId: string,
    seatIds: string[],
  ): Promise<{
    allAvailable: boolean
    availableSeats: string[]
    unavailableSeats: string[]
  }> {
    // Check booked seats
    const bookedSeats = await TicketModel.find({
      showtimeId,
      seatId: { $in: seatIds.map(id => new Types.ObjectId(id)) },
    })
      .select('seatId')
      .lean()
    const bookedSeatIds = bookedSeats.map(ticket => ticket.seatId.toString())

    // Check held seats
    const heldSeats = await SeatHoldModel.find({
      showtimeId,
      seatId: { $in: seatIds.map(id => new Types.ObjectId(id)) },
      status: 'holding',
      holdUntil: { $gt: new Date() },
    })
      .select('seatId')
      .lean()
    const heldSeatIds = heldSeats.map(hold => hold.seatId.toString())

    const unavailableSeats = [...new Set([...bookedSeatIds, ...heldSeatIds])]
    const availableSeats = seatIds.filter(seatId => !unavailableSeats.includes(seatId))

    return {
      allAvailable: unavailableSeats.length === 0,
      availableSeats,
      unavailableSeats,
    }
  }

  /**
   * Clean up expired seat holds
   */
  async cleanupExpiredHolds(): Promise<number> {
    const result = await SeatHoldModel.deleteMany({
      holdUntil: { $lt: new Date() },
      status: 'holding',
    })
    return result.deletedCount || 0
  }

  /**
   * Calculate seat price based on base price and multiplier
   */
  private calculateSeatPrice(basePrice: number, multiplier: number): number {
    return Math.round(basePrice * multiplier)
  }
}
