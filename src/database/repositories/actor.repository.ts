import { ActorModel } from '../models/actor.model.js'

export class ActorRepository {
  async findAll() { return await ActorModel.find({}).lean() }
  async findById(id: string) { return await ActorModel.findById(id).lean() }
  async create(data: any) { const d = await ActorModel.create(data); return d.toObject() }
  async update(id: string, data: any) { return await ActorModel.findByIdAndUpdate(id, data, { new: true }).lean() }
  async delete(id: string) { const r: any = await ActorModel.deleteOne({ _id: id }); return r.deletedCount > 0 }
}


