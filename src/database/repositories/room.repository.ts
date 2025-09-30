import { RoomModel } from '../models/room.model.js'

export class RoomRepository {
  async findAllByCinema(cinemaId: string) { return await RoomModel.find({ cinemaId }).lean() }
  async findById(id: string) { return await RoomModel.findById(id).lean() }
  async create(data: any) { const d = await RoomModel.create(data); return d.toObject() }
  async update(id: string, data: any) { return await RoomModel.findByIdAndUpdate(id, data, { new: true }).lean() }
  async delete(id: string) { const r: any = await RoomModel.deleteOne({ _id: id }); return r.deletedCount > 0 }
}


