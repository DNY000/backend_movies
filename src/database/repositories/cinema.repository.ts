import { CinemaModel } from '../models/cinema.model.js'

export class CinemaRepository {
  async findAll() { return await CinemaModel.find({}).lean() }
  async findById(id: string) { return await CinemaModel.findById(id).lean() }
  async create(data: any) { const d = await CinemaModel.create(data); return d.toObject() }
  async update(id: string, data: any) { return await CinemaModel.findByIdAndUpdate(id, data, { new: true }).lean() }
  async delete(id: string) { const r: any = await CinemaModel.deleteOne({ _id: id }); return r.deletedCount > 0 }
}