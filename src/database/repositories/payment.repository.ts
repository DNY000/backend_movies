import { PaymentModel } from '../models/payment.model.js'

export class PaymentRepository {
  async findAllByUser(userId: string) { return await PaymentModel.find({ userId }).lean() }
  async findById(id: string) { return await PaymentModel.findById(id).lean() }
  async create(data: any) { const d = await PaymentModel.create(data); return d.toObject() }
}


