import { Schema, model, type Document, type Types } from 'mongoose'

export type AuditEntityType = 'users'|'movies'|'bookings'|'payments'|'promotions'|'showtimes'|'tickets'|'cinemas'|'rooms'|'seats'|'other'

export interface AuditLogDocument extends Document {
  userId?: Types.ObjectId
  action: string
  entityType: AuditEntityType
  entityId: Types.ObjectId
  oldData?: Record<string, unknown>
  newData?: Record<string, unknown>
  createdAt: Date
}

const auditLogSchema = new Schema<AuditLogDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'users' },
  action: { type: String, required: true },
  entityType: { type: String, enum: ['users','movies','bookings','payments','promotions','showtimes','tickets','cinemas','rooms','seats','other'], default: 'other', required: true },
  entityId: { type: Schema.Types.ObjectId, required: true },
  oldData: { type: Schema.Types.Mixed },
  newData: { type: Schema.Types.Mixed },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } })

export const AuditLogModel = model<AuditLogDocument>('audit_logs', auditLogSchema)


