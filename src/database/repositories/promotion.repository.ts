import { PromotionModel } from '../models/promotion.model.js'

export class PromotionRepository {
  async findAll() { return await PromotionModel.find().lean() }
  async findActiveByCode(code: string) { return await PromotionModel.findOne({ code, isActive: true }).lean() }
  async create(data: any) { const d = await PromotionModel.create(data); return d.toObject() }
}