import { Schema, model, type Document, type Types } from 'mongoose'

export interface ShowtimeDocument extends Document {
  movieId: Types.ObjectId
  roomId: Types.ObjectId
  startTime: Date
  endTime?: Date
  price: number
  languageId?: Types.ObjectId
  subtitleLanguageId?: Types.ObjectId
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const showtimeSchema = new Schema<ShowtimeDocument>({
  movieId: { type: Schema.Types.ObjectId, ref: 'movies', required: true, index: true },
  roomId: { type: Schema.Types.ObjectId, ref: 'rooms', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  price: { type: Number, default: 0, required: true },
  languageId: { type: Schema.Types.ObjectId, ref: 'languages' },
  subtitleLanguageId: { type: Schema.Types.ObjectId, ref: 'languages' },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

showtimeSchema.index({ movieId: 1, startTime: 1 })

export const ShowtimeModel = model<ShowtimeDocument>('showtimes', showtimeSchema)


