import { NotificationModel } from '../models/notification.model.js'

export class NotificationRepository {
  async findAllByUser(userId: string) { return await NotificationModel.find({ userId }).lean() }
  async markRead(id: string) { return await NotificationModel.findByIdAndUpdate(id, { isRead: true }, { new: true }).lean() }
  async create(data: any) { const d = await NotificationModel.create(data); return d.toObject() }
}


