import { Schema, model, type Document, type Types } from 'mongoose'

export type NotificationType = 'general' | 'booking' | 'payment' | 'promotion' | 'system'

export interface NotificationDocument extends Document {
  userId: Types.ObjectId
  title: string
  message: string
  type: NotificationType
  data?: Record<string, unknown>
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<NotificationDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'users', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['general','booking','payment','promotion','system'], default: 'general', required: true },
  data: { type: Schema.Types.Mixed },
  isRead: { type: Boolean, default: false, required: true },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

export const NotificationModel = model<NotificationDocument>('notifications', notificationSchema)


