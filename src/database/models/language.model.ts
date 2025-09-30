import { Schema, model, type Document } from 'mongoose'

export interface LanguageDocument extends Document {
  name: string
  isoCode?: string
  createdAt: Date
  updatedAt: Date
}

const languageSchema = new Schema<LanguageDocument>({
  name: { type: String, required: true, unique: true },
  isoCode: { type: String },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

export const LanguageModel = model<LanguageDocument>('languages', languageSchema)


