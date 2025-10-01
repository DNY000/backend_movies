import { Schema, model, type Document, type Types } from 'mongoose'

export interface SeatHoldDocument extends Document {
  showtimeId: Types.ObjectId
  seatId: Types.ObjectId
  userId: Types.ObjectId
  holdUntil: Date
  status: 'holding' | 'expired' | 'confirmed'
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const seatHoldSchema = new Schema<SeatHoldDocument>({
  showtimeId: { type: Schema.Types.ObjectId, ref: 'showtimes', required: true, index: true },
  seatId: { type: Schema.Types.ObjectId, ref: 'seats', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  holdUntil: { type: Date, required: true, index: true },
  status: { type: String, enum: ['holding', 'expired', 'confirmed'], default: 'holding', required: true },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

// Compound index for unique seat hold per showtime
seatHoldSchema.index({ showtimeId: 1, seatId: 1 }, { unique: true })

// TTL index to automatically remove expired holds
seatHoldSchema.index({ holdUntil: 1 }, { expireAfterSeconds: 0 })

export const SeatHoldModel = model<SeatHoldDocument>('seatHolds', seatHoldSchema)
