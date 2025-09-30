import { Schema, model, type Document } from 'mongoose'

export interface ActorDocument extends Document {
  name: string
  dob?: Date
  bio?: string
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}

const actorSchema = new Schema<ActorDocument>({
  name: { type: String, required: true },
  dob: { type: Date },
  bio: { type: String },
  imageUrl: { type: String },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

export const ActorModel = model<ActorDocument>('actors', actorSchema)


