import { Schema, model, type Document, type Types } from 'mongoose'

export type BookingStatus = 'pending' | 'paid' | 'cancelled' | 'expired'

export interface BookingDocument extends Document {
  userId: Types.ObjectId
  showtimeId: Types.ObjectId
  bookingTime: Date
  totalAmount: number
  status: BookingStatus
  promotionId?: Types.ObjectId
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const bookingSchema = new Schema<BookingDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'users', required: true, index: true },
  showtimeId: { type: Schema.Types.ObjectId, ref: 'showtimes', required: true },
  bookingTime: { type: Date, default: Date.now, required: true },
  totalAmount: { type: Number, default: 0, required: true },
  status: { type: String, enum: ['pending','paid','cancelled','expired'], default: 'pending', required: true },
  promotionId: { type: Schema.Types.ObjectId, ref: 'promotions' },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

export const BookingModel = model<BookingDocument>('bookings', bookingSchema)


