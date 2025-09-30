import { Schema, model, type Document, type Types } from 'mongoose'

export interface MovieDocument extends Document {
  title: string
  description?: string
  trailerUrl?: string
  trailerYoutubeUrl?: string
  posterUrl?: string
  releaseDate?: Date
  durationMinutes?: number
  rating?: number
  trending: boolean
  mostPopular: boolean
  genres: Types.ObjectId[]
  actors: Array<{ actor: Types.ObjectId, roleType: 'main' | 'supporting' | 'director' | 'cameo' | 'other', characterName?: string }>
  languages: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const movieActorSchema = new Schema({
  actor: { type: Schema.Types.ObjectId, ref: 'actors', required: true },
  roleType: { type: String, enum: ['main','supporting','director','cameo','other'], default: 'supporting', required: true },
  characterName: { type: String },
}, { _id: false })

const movieSchema = new Schema<MovieDocument>({
  title: { type: String, required: true },
  description: { type: String },
  trailerUrl: { type: String },
  trailerYoutubeUrl: { type: String },
  posterUrl: { type: String },
  releaseDate: { type: Date },
  durationMinutes: { type: Number },
  rating: { type: Number, min: 0, max: 10 },
  trending: { type: Boolean, default: false, required: true },
  mostPopular: { type: Boolean, default: false, required: true },
  genres: [{ type: Schema.Types.ObjectId, ref: 'genres', index: true }],
  actors: [movieActorSchema],
  languages: [{ type: Schema.Types.ObjectId, ref: 'languages' }],
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

export const MovieModel = model<MovieDocument>('movies', movieSchema)


