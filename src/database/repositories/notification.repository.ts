import { NotificationModel, type NotificationDocument } from '../models/notification.model.js'
import { Types } from 'mongoose'

export class NotificationRepository {
  async findAllByUser(userId: string, page: number = 0, limit: number = 10) {
    const skip = page * limit
    const notifications = await NotificationModel.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await NotificationModel.countDocuments({ userId: new Types.ObjectId(userId) })

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findUnreadByUser(userId: string, page: number = 0, limit: number = 10) {
    const skip = page * limit
    const notifications = await NotificationModel.find({ userId: new Types.ObjectId(userId), isRead: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await NotificationModel.countDocuments({ userId: new Types.ObjectId(userId), isRead: false })

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async markAsRead(id: string, userId: string) {
    return await NotificationModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
      { isRead: true },
      { new: true },
    ).lean()
  }

  async markAllAsRead(userId: string) {
    const result = await NotificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { isRead: true },
    )
    return result.modifiedCount
  }

  async create(data: Partial<NotificationDocument>) {
    const notification = await NotificationModel.create(data)
    return notification.toObject()
  }

  async getUnreadCount(userId: string) {
    return await NotificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
    })
  }
}
