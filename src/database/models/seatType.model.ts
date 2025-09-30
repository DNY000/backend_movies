import { Schema, model, type Document } from 'mongoose'

export interface SeatTypeDocument extends Document {
  code: string
  description?: string
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const seatTypeSchema = new Schema<SeatTypeDocument>({
  code: { type: String, required: true, unique: true },
  description: { type: String },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

export const SeatTypeModel = model<SeatTypeDocument>('seat_types', seatTypeSchema)


