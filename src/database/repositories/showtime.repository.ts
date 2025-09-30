import { ShowtimeModel } from '../models/showtime.model.js'

export class ShowtimeRepository {
  async findAll(filter: any = {}) { return await ShowtimeModel.find(filter).lean() }
  async findById(id: string) { return await ShowtimeModel.findById(id).lean() }
  async create(data: any) { const d = await ShowtimeModel.create(data); return d.toObject() }
  async update(id: string, data: any) { return await ShowtimeModel.findByIdAndUpdate(id, data, { new: true }).lean() }
  async delete(id: string) { const r: any = await ShowtimeModel.deleteOne({ _id: id }); return r.deletedCount > 0 }
}


