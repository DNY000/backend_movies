import { Schema, model, type Document, type Types } from 'mongoose'

export interface RoomDocument extends Document {
  cinemaId: Types.ObjectId
  name: string
  createdAt: Date
  updatedAt: Date
}

const roomSchema = new Schema<RoomDocument>({
  cinemaId: { type: Schema.Types.ObjectId, ref: 'cinemas', required: true, index: true },
  name: { type: String, required: true },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

export const RoomModel = model<RoomDocument>('rooms', roomSchema)


