import { Schema, model, type Document } from 'mongoose'
import { UserRole } from '../../types/user.types.js'

export interface UserDocument extends Document {
  email: string
  name: string
  username?: string
  phone?: string
  password: string
  avatar?: string
  role: UserRole
  isActive: boolean
  refreshToken?: string
  refreshTokenExpiresAt?: Date
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<UserDocument>({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  username: { type: String },
  phone: { type: String },
  password: { type: String, required: true },
  avatar: { type: String },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.USER, required: true },
  isActive: { type: Boolean, default: true, required: true },
  refreshToken: { type: String },
  refreshTokenExpiresAt: { type: Date },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

export const UserModel = model<UserDocument>('users', userSchema)

