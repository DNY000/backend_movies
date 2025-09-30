import { TicketModel } from '../models/ticket.model.js'

export class TicketRepository {
  async findAllByBooking(bookingId: string) { return await TicketModel.find({ bookingId }).lean() }
  async findById(id: string) { return await TicketModel.findById(id).lean() }
  async create(data: any) { const d = await TicketModel.create(data); return d.toObject() }
  async deleteByBooking(bookingId: string) { const r: any = await TicketModel.deleteMany({ bookingId }); return r.deletedCount > 0 }
}


