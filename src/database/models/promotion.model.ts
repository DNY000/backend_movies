import { Schema, model, type Document } from 'mongoose'

export interface PromotionDocument extends Document {
  code: string
  description?: string
  discountPercent?: number
  discountAmount?: number
  validFrom?: Date
  validTo?: Date
  usageLimit?: number
  usedCount: number
  perUserLimit: number
  isActive: boolean
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const promotionSchema = new Schema<PromotionDocument>({
  code: { type: String, required: true, unique: true },
  description: { type: String },
  discountPercent: { type: Number, min: 0, max: 100 },
  discountAmount: { type: Number, min: 0 },
  validFrom: { type: Date },
  validTo: { type: Date },
  usageLimit: { type: Number },
  usedCount: { type: Number, default: 0, required: true },
  perUserLimit: { type: Number, default: 1, required: true },
  isActive: { type: Boolean, default: true, required: true },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

export const PromotionModel = model<PromotionDocument>('promotions', promotionSchema)


