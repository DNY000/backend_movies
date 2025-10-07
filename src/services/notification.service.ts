/* eslint-disable no-console */
import { NotificationRepository } from '../database/repositories/notification.repository.js'
import { type NotificationDocument, type NotificationType } from '../database/models/notification.model.js'
import { Types } from 'mongoose'

export interface CreateNotificationData {
  userId: string | Types.ObjectId
  title: string
  message: string
  type: NotificationType
  data?: Record<string, unknown>
}

export interface NotificationListResponse {
  notifications: NotificationDocument[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  unreadCount: number
}

export class NotificationService {
  private notificationRepository: NotificationRepository

  constructor() {
    this.notificationRepository = new NotificationRepository()
  }

  async getAllByUser(userId: string, page: number = 0, limit: number = 10): Promise<NotificationListResponse> {
    try {
      const result = await this.notificationRepository.findAllByUser(userId, page, limit)
      const unreadCount = await this.notificationRepository.getUnreadCount(userId)

      return {
        ...result,
        unreadCount,
      }
    } catch (error) {
      console.error('Error getting all notifications for user:', error)
      throw new Error('Failed to get notifications')
    }
  }

  async getUnreadByUser(userId: string, page: number = 0, limit: number = 10): Promise<NotificationListResponse> {
    try {
      const result = await this.notificationRepository.findUnreadByUser(userId, page, limit)
      const unreadCount = await this.notificationRepository.getUnreadCount(userId)

      return {
        ...result,
        unreadCount,
      }
    } catch (error) {
      console.error('Error getting unread notifications for user:', error)
      throw new Error('Failed to get unread notifications')
    }
  }

  async markAsRead(notificationId: string, userId: string): Promise<NotificationDocument | null> {
    try {
      const notification = await this.notificationRepository.markAsRead(notificationId, userId)
      if (!notification) {
        throw new Error('Notification not found or access denied')
      }
      return notification
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw new Error('Failed to mark notification as read')
    }
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    try {
      const count = await this.notificationRepository.markAllAsRead(userId)
      return { count }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw new Error('Failed to mark all notifications as read')
    }
  }

  async create(data: CreateNotificationData): Promise<NotificationDocument> {
    try {
      const notification = await this.notificationRepository.create({
        userId: typeof data.userId === 'string' ? new Types.ObjectId(data.userId) : data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        data: data.data,
        isRead: false,
      })
      return notification
    } catch (error) {
      console.error('Error creating notification:', error)
      throw new Error('Failed to create notification')
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      return await this.notificationRepository.getUnreadCount(userId)
    } catch (error) {
      console.error('Error getting unread count:', error)
      throw new Error('Failed to get unread count')
    }
  }

  // Helper methods for creating specific types of notifications
  async createBookingNotification(userId: string, bookingData: any): Promise<NotificationDocument> {
    return this.create({
      userId,
      title: 'Đặt vé thành công',
      message: `Bạn đã đặt vé thành công cho phim "${bookingData.movieTitle}" tại ${bookingData.cinemaName}`,
      type: 'booking',
      data: {
        bookingId: bookingData.bookingId,
        movieTitle: bookingData.movieTitle,
        cinemaName: bookingData.cinemaName,
        showtime: bookingData.showtime,
      },
    })
  }

  async createPaymentNotification(userId: string, paymentData: any): Promise<NotificationDocument> {
    return this.create({
      userId,
      title: 'Thanh toán thành công',
      message: `Thanh toán ${paymentData.amount} VND đã được xử lý thành công`,
      type: 'payment',
      data: {
        paymentId: paymentData.paymentId,
        amount: paymentData.amount,
        method: paymentData.method,
      },
    })
  }

  async createPromotionNotification(userId: string, promotionData: any): Promise<NotificationDocument> {
    return this.create({
      userId,
      title: 'Khuyến mãi mới',
      message: `Có khuyến mãi mới: ${promotionData.title} - Giảm ${promotionData.discount}%`,
      type: 'promotion',
      data: {
        promotionId: promotionData.promotionId,
        title: promotionData.title,
        discount: promotionData.discount,
      },
    })
  }

  async createSystemNotification(userId: string, systemData: any): Promise<NotificationDocument> {
    return this.create({
      userId,
      title: systemData.title,
      message: systemData.message,
      type: 'system',
      data: systemData.data,
    })
  }
}
