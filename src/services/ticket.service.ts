import { TicketModel } from '../database/models/ticket.model.js'
import { BookingModel } from '../database/models/booking.model.js'
import { ShowtimeModel } from '../database/models/showtime.model.js'
import { SeatModel } from '../database/models/seat.model.js'
import { UserModel } from '../database/models/user.model.js'
import { MovieModel } from '../database/models/movie.model.js'
import { CinemaModel } from '../database/models/cinema.model.js'
import { RoomModel } from '../database/models/room.model.js'
import crypto from 'crypto'

export interface TicketInfo {
  ticketId: string
  bookingId: string
  movieTitle: string
  cinemaName: string
  roomName: string
  seatInfo: string
  showtime: Date
  price: number
  qrCode: string
  ticketCode: string
  customerName: string
  customerEmail: string
  status: 'valid' | 'used' | 'expired' | 'cancelled'
}

export interface TicketGenerationResult {
  tickets: TicketInfo[]
  totalTickets: number
  bookingReference: string
}

export class TicketService {
  /**
   * Generate tickets for a paid booking
   */
  async generateTickets(bookingId: string): Promise<TicketGenerationResult> {
    // Get booking with all related data
    const booking = await BookingModel.findById(bookingId)
      .populate('userId')
      .populate('showtimeId')
      .lean()

    if (!booking) {
      throw new Error('Booking not found')
    }

    if (booking.status !== 'paid') {
      throw new Error('Can only generate tickets for paid bookings')
    }

    // Get tickets for this booking
    const tickets = await TicketModel.find({ bookingId })
      .populate('seatId')
      .lean()

    if (tickets.length === 0) {
      throw new Error('No tickets found for this booking')
    }

    // Get showtime details
    const showtime = await ShowtimeModel.findById(booking.showtimeId)
      .populate('movieId')
      .populate('roomId')
      .lean()

    if (!showtime) {
      throw new Error('Showtime not found')
    }

    // Get room and cinema details
    const room = await RoomModel.findById((showtime as any).roomId)
      .populate('cinemaId')
      .lean()

    if (!room) {
      throw new Error('Room not found')
    }

    const movie = (showtime as any).movieId
    const cinema = (room as any).cinemaId
    const user = booking.userId

    // Generate ticket info for each ticket
    const ticketInfos: TicketInfo[] = []

    for (const ticket of tickets) {
      const seat = (ticket as any).seatId
      const ticketCode = this.generateTicketCode()
      const qrData = this.generateQRData({
        ticketId: ticket._id.toString(),
        bookingId: bookingId,
        ticketCode,
        showtimeId: booking.showtimeId.toString(),
        seatId: ticket.seatId.toString()
      })

      const ticketInfo: TicketInfo = {
        ticketId: ticket._id.toString(),
        bookingId: bookingId,
        movieTitle: movie?.title || 'Unknown Movie',
        cinemaName: cinema?.name || 'Unknown Cinema',
        roomName: room?.name || 'Unknown Room',
        seatInfo: `${seat?.seatRow}${seat?.seatNumber}`,
        showtime: (showtime as any).startTime,
        price: ticket.price,
        qrCode: qrData,
        ticketCode,
        customerName: (user as any)?.name || 'Unknown Customer',
        customerEmail: (user as any)?.email || '',
        status: 'valid'
      }

      ticketInfos.push(ticketInfo)
    }

    return {
      tickets: ticketInfos,
      totalTickets: ticketInfos.length,
      bookingReference: this.generateBookingReference(bookingId)
    }
  }

  /**
   * Validate ticket by QR code or ticket code
   */
  async validateTicket(qrData: string): Promise<{
    valid: boolean
    ticket?: TicketInfo
    message: string
  }> {
    try {
      // Decode QR data
      const ticketData = this.decodeQRData(qrData)
      
      // Get ticket from database
      const ticket = await TicketModel.findById(ticketData.ticketId)
        .populate('bookingId')
        .populate('showtimeId')
        .populate('seatId')
        .lean()

      if (!ticket) {
        return { valid: false, message: 'Ticket not found' }
      }

      const booking = (ticket as any).bookingId
      if (booking.status !== 'paid') {
        return { valid: false, message: 'Booking is not paid' }
      }

      // Check if showtime has passed
      const showtime = await ShowtimeModel.findById(ticket.showtimeId).lean()
      if (!showtime) {
        return { valid: false, message: 'Showtime not found' }
      }

      const now = new Date()
      const showtimeStart = new Date((showtime as any).startTime)
      
      if (now > showtimeStart) {
        return { valid: false, message: 'Ticket has expired (showtime passed)' }
      }

      // Generate ticket info for validation response
      const ticketInfo = await this.getTicketInfo(ticket._id.toString())

      return {
        valid: true,
        ticket: ticketInfo || undefined,
        message: 'Ticket is valid'
      }
    } catch (error) {
      return { valid: false, message: 'Invalid QR code format' }
    }
  }

  /**
   * Mark ticket as used (check-in)
   */
  async checkInTicket(ticketId: string): Promise<boolean> {
    try {
      // In a real system, you might want to add a 'usedAt' field to the ticket model
      // For now, we'll use metadata to track usage
      await TicketModel.findByIdAndUpdate(ticketId, {
        $set: { 'metadata.usedAt': new Date(), 'metadata.status': 'used' }
      })
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Get ticket information by ticket ID
   */
  async getTicketInfo(ticketId: string): Promise<TicketInfo | null> {
    const ticket = await TicketModel.findById(ticketId)
      .populate({
        path: 'bookingId',
        populate: { path: 'userId' }
      })
      .populate({
        path: 'showtimeId',
        populate: [
          { path: 'movieId' },
          { 
            path: 'roomId',
            populate: { path: 'cinemaId' }
          }
        ]
      })
      .populate('seatId')
      .lean()

    if (!ticket) {
      return null
    }

    const booking = (ticket as any).bookingId
    const showtime = (ticket as any).showtimeId
    const seat = (ticket as any).seatId
    const movie = showtime?.movieId
    const room = showtime?.roomId
    const cinema = room?.cinemaId
    const user = booking?.userId

    const ticketCode = this.generateTicketCode()
    const qrData = this.generateQRData({
      ticketId: ticket._id.toString(),
      bookingId: booking._id.toString(),
      ticketCode,
      showtimeId: showtime._id.toString(),
      seatId: seat._id.toString()
    })

    return {
      ticketId: ticket._id.toString(),
      bookingId: booking._id.toString(),
      movieTitle: movie?.title || 'Unknown Movie',
      cinemaName: cinema?.name || 'Unknown Cinema',
      roomName: room?.name || 'Unknown Room',
      seatInfo: `${seat?.seatRow}${seat?.seatNumber}`,
      showtime: showtime?.startTime,
      price: ticket.price,
      qrCode: qrData,
      ticketCode,
      customerName: user?.name || 'Unknown Customer',
      customerEmail: user?.email || '',
      status: (ticket as any).metadata?.status || 'valid'
    }
  }

  /**
   * Get all tickets for a booking
   */
  async getBookingTickets(bookingId: string): Promise<TicketInfo[]> {
    const tickets = await TicketModel.find({ bookingId }).lean()
    const ticketInfos: TicketInfo[] = []

    for (const ticket of tickets) {
      const ticketInfo = await this.getTicketInfo(ticket._id.toString())
      if (ticketInfo !== null) {
        ticketInfos.push(ticketInfo)
      }
    }

    return ticketInfos
  }

  /**
   * Cancel tickets for a booking
   */
  async cancelTickets(bookingId: string): Promise<boolean> {
    try {
      await TicketModel.updateMany(
        { bookingId },
        { $set: { 'metadata.status': 'cancelled', 'metadata.cancelledAt': new Date() } }
      )
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Generate unique ticket code
   */
  private generateTicketCode(): string {
    const timestamp = Date.now().toString().slice(-6)
    const random = crypto.randomBytes(3).toString('hex').toUpperCase()
    return `TK${timestamp}${random}`
  }

  /**
   * Generate booking reference
   */
  private generateBookingReference(bookingId: string): string {
    const shortId = bookingId.slice(-8).toUpperCase()
    const timestamp = Date.now().toString().slice(-4)
    return `BK${timestamp}${shortId}`
  }

  /**
   * Generate QR code data
   */
  private generateQRData(data: {
    ticketId: string
    bookingId: string
    ticketCode: string
    showtimeId: string
    seatId: string
  }): string {
    // In a real system, you might want to encrypt this data
    const qrPayload = {
      t: data.ticketId,
      b: data.bookingId,
      c: data.ticketCode,
      s: data.showtimeId,
      seat: data.seatId,
      ts: Date.now()
    }
    
    return Buffer.from(JSON.stringify(qrPayload)).toString('base64')
  }

  /**
   * Decode QR code data
   */
  private decodeQRData(qrData: string): {
    ticketId: string
    bookingId: string
    ticketCode: string
    showtimeId: string
    seatId: string
    timestamp: number
  } {
    const decoded = JSON.parse(Buffer.from(qrData, 'base64').toString())
    return {
      ticketId: decoded.t,
      bookingId: decoded.b,
      ticketCode: decoded.c,
      showtimeId: decoded.s,
      seatId: decoded.seat,
      timestamp: decoded.ts
    }
  }
}
