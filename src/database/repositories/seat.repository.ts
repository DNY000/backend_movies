import { SeatModel } from '../models/seat.model.js'

export class SeatRepository {
  async findAllByRoom(roomId: string) { return await SeatModel.find({ roomId }).lean() }
  async findById(id: string) { return await SeatModel.findById(id).lean() }
  async create(data: any) { const d = await SeatModel.create(data); return d.toObject() }
  async update(id: string, data: any) { return await SeatModel.findByIdAndUpdate(id, data, { new: true }).lean() }
  async delete(id: string) { const r: any = await SeatModel.deleteOne({ _id: id }); return r.deletedCount > 0 }
}


