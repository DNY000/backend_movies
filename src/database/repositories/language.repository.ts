import { LanguageModel } from '../models/language.model.js'

export class LanguageRepository {
  async findAll() { return await LanguageModel.find({}).lean() }
  async findById(id: string) { return await LanguageModel.findById(id).lean() }
  async findByName(name: string) { return await LanguageModel.findOne({ name }).lean() }
  async create(data: any) { const d = await LanguageModel.create(data); return d.toObject() }
  async update(id: string, data: any) { return await LanguageModel.findByIdAndUpdate(id, data, { new: true }).lean() }
  async delete(id: string) { const r: any = await LanguageModel.deleteOne({ _id: id }); return r.deletedCount > 0 }
}