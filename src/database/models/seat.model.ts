import { Schema, model, type Document, type Types } from 'mongoose'

export interface SeatDocument extends Document {
  roomId: Types.ObjectId
  seatRow: string
  seatNumber: number
  seatTypeId?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const seatSchema = new Schema<SeatDocument>({
  roomId: { type: Schema.Types.ObjectId, ref: 'rooms', required: true, index: true },
  seatRow: { type: String, required: true },
  seatNumber: { type: Number, required: true },
  seatTypeId: { type: Schema.Types.ObjectId, ref: 'seat_types' },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

seatSchema.index({ roomId: 1, seatRow: 1, seatNumber: 1 }, { unique: true })

export const SeatModel = model<SeatDocument>('seats', seatSchema)


