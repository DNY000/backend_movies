import { Schema, model, type Document } from 'mongoose'

export interface CinemaDocument extends Document {
  name: string
  address: string
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const cinemaSchema = new Schema<CinemaDocument>({
  name: { type: String, required: true },
  address: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

export const CinemaModel = model<CinemaDocument>('cinemas', cinemaSchema)


