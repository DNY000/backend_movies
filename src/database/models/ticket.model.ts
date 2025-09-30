import { Schema, model, type Document, type Types } from 'mongoose'

export interface TicketDocument extends Document {
  bookingId: Types.ObjectId
  showtimeId: Types.ObjectId
  seatId: Types.ObjectId
  price: number
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const ticketSchema = new Schema<TicketDocument>({
  bookingId: { type: Schema.Types.ObjectId, ref: 'bookings', required: true, index: true },
  showtimeId: { type: Schema.Types.ObjectId, ref: 'showtimes', required: true },
  seatId: { type: Schema.Types.ObjectId, ref: 'seats', required: true },
  price: { type: Number, required: true },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

ticketSchema.index({ showtimeId: 1, seatId: 1 }, { unique: true })

export const TicketModel = model<TicketDocument>('tickets', ticketSchema)


