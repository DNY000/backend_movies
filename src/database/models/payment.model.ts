import { Schema, model, type Document, type Types } from 'mongoose'

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
export type PaymentMethod = 'card' | 'cash' | 'bank_transfer' | 'e_wallet' | 'vnpay' | 'momo' | 'zalopay'

export interface PaymentDocument extends Document {
  bookingId: Types.ObjectId
  userId: Types.ObjectId
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  transactionId?: string
  gatewayTransactionId?: string
  gatewayResponse?: Record<string, unknown>
  failureReason?: string
  refundAmount?: number
  refundReason?: string
  processedAt?: Date
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const paymentSchema = new Schema<PaymentDocument>({
  bookingId: { type: Schema.Types.ObjectId, ref: 'bookings', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['card','cash','bank_transfer','e_wallet','vnpay','momo','zalopay'], required: true },
  status: { type: String, enum: ['pending','processing','completed','failed','refunded','cancelled'], default: 'pending', required: true },
  transactionId: { type: String, index: true },
  gatewayTransactionId: { type: String, index: true },
  gatewayResponse: { type: Schema.Types.Mixed },
  failureReason: { type: String },
  refundAmount: { type: Number },
  refundReason: { type: String },
  processedAt: { type: Date },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

// Index for transaction tracking
paymentSchema.index({ transactionId: 1, gatewayTransactionId: 1 })

export const PaymentModel = model<PaymentDocument>('payments', paymentSchema)
