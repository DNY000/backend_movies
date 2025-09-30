import { Schema, model, type Document } from 'mongoose'

export interface UserDocument extends Document {
  email: string
  name: string
  phone?: string
  passwordHash?: string
  role: 'customer' | 'staff' | 'admin'
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<UserDocument>({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  phone: { type: String },
  passwordHash: { type: String },
  role: { type: String, enum: ['customer', 'staff', 'admin'], default: 'customer', required: true },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

export const UserModel = model<UserDocument>('users', userSchema)

