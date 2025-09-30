import { Schema, model, type Document, type Types } from 'mongoose'

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded'
export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'e_wallet' | 'cash' | 'other'

export interface PaymentDocument extends Document {
  bookingId: Types.ObjectId
  userId: Types.ObjectId
  amount: number
  method: PaymentMethod
  provider?: string
  status: PaymentStatus
  transactionId?: string
  rawResponse?: Record<string, unknown>
  paidAt?: Date
  createdAt: Date
  updatedAt: Date
}

const paymentSchema = new Schema<PaymentDocument>({
  bookingId: { type: Schema.Types.ObjectId, ref: 'bookings', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['credit_card','bank_transfer','e_wallet','cash','other'], required: true },
  provider: { type: String },
  status: { type: String, enum: ['pending','success','failed','refunded'], default: 'pending', required: true },
  transactionId: { type: String },
  rawResponse: { type: Schema.Types.Mixed },
  paidAt: { type: Date },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

export const PaymentModel = model<PaymentDocument>('payments', paymentSchema)


