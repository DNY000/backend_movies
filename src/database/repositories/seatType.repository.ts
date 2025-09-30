import { SeatTypeModel } from '../models/seatType.model.js'

export class SeatTypeRepository {
  async findAll() { return await SeatTypeModel.find({}).lean() }
  async findById(id: string) { return await SeatTypeModel.findById(id).lean() }
  async findByCode(code: string) { return await SeatTypeModel.findOne({ code }).lean() }
  async create(data: any) { const d = await SeatTypeModel.create(data); return d.toObject() }
  async update(id: string, data: any) { return await SeatTypeModel.findByIdAndUpdate(id, data, { new: true }).lean() }
  async delete(id: string) { const r: any = await SeatTypeModel.deleteOne({ _id: id }); return r.deletedCount > 0 }
}


