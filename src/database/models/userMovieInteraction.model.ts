import { Schema, model, type Document, type Types } from 'mongoose'

export type InteractionType = 'favorite' | 'review'

export interface UserMovieInteractionDocument extends Document {
  userId: Types.ObjectId
  movieId: Types.ObjectId
  type: InteractionType
  rating?: number
  comment?: string
  createdAt: Date
  updatedAt: Date
}

const umiSchema = new Schema<UserMovieInteractionDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'users', required: true, index: true },
  movieId: { type: Schema.Types.ObjectId, ref: 'movies', required: true, index: true },
  type: { type: String, enum: ['favorite','review'], required: true },
  rating: { type: Number, min: 1, max: 5 },
  comment: { type: String },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

umiSchema.index({ userId: 1, movieId: 1, type: 1 }, { unique: true })

export const UserMovieInteractionModel = model<UserMovieInteractionDocument>('user_movie_interactions', umiSchema)


