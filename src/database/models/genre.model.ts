import { Schema, model, type Document } from 'mongoose'

export interface GenreDocument extends Document {
  name: string
  createdAt: Date
  updatedAt: Date
}

const genreSchema = new Schema<GenreDocument>({
  name: { type: String, required: true, unique: true, index: true },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

export const GenreModel = model<GenreDocument>('genres', genreSchema)


