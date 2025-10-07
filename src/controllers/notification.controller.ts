import { Request, Response } from 'express'
import { NotificationService } from '../services/notification.service.js'
import { sendSuccess, sendError } from '../utils/response.util.js'
import { HttpStatus } from '../types/common.types.js'

export class NotificationController {
  private notificationService: NotificationService

  constructor() {
    this.notificationService = new NotificationService()
  }

  async getAllNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id
      if (!userId) {
        sendError(res, 'User not authenticated', undefined, HttpStatus.UNAUTHORIZED)
        return
      }

      const page = parseInt(req.query.page as string) || 0
      const limit = parseInt(req.query.limit as string) || 10

      const result = await this.notificationService.getAllByUser(userId, page, limit)

      sendSuccess(res, result, 'Notifications retrieved successfully')
    } catch (error) {
      sendError(
        res,
        error instanceof Error ? error.message : 'Failed to get notifications',
        undefined,
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  async getUnreadNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id
      if (!userId) {
        sendError(res, 'User not authenticated', undefined, HttpStatus.UNAUTHORIZED)
        return
      }

      const page = parseInt(req.query.page as string) || 0
      const limit = parseInt(req.query.limit as string) || 10

      const result = await this.notificationService.getUnreadByUser(userId, page, limit)

      sendSuccess(res, result, 'Unread notifications retrieved successfully')
    } catch (error) {
      sendError(
        res,
        error instanceof Error ? error.message : 'Failed to get unread notifications',
        undefined,
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id
      if (!userId) {
        sendError(res, 'User not authenticated', undefined, HttpStatus.UNAUTHORIZED)
        return
      }

      const { id } = req.params
      if (!id) {
        sendError(res, 'Notification ID is required', undefined, HttpStatus.BAD_REQUEST)
        return
      }

      const notification = await this.notificationService.markAsRead(id, userId)

      if (!notification) {
        sendError(res, 'Notification not found', undefined, HttpStatus.NOT_FOUND)
        return
      }

      sendSuccess(res, notification, 'Notification marked as read')
    } catch (error) {
      sendError(
        res,
        error instanceof Error ? error.message : 'Failed to mark notification as read',
        undefined,
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id
      if (!userId) {
        sendError(res, 'User not authenticated', undefined, HttpStatus.UNAUTHORIZED)
        return
      }

      const result = await this.notificationService.markAllAsRead(userId)

      sendSuccess(res, result, 'All notifications marked as read')
    } catch (error) {
      sendError(
        res,
        error instanceof Error ? error.message : 'Failed to mark all notifications as read',
        undefined,
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  async createNotification(req: Request, res: Response): Promise<void> {
    try {
      const { userId, title, message, type, data } = req.body

      if (!userId || !title || !message || !type) {
        sendError(res, 'Missing required fields: userId, title, message, type', undefined, HttpStatus.BAD_REQUEST)
        return
      }

      const notification = await this.notificationService.create({
        userId,
        title,
        message,
        type,
        data,
      })

      sendSuccess(res, notification, 'Notification created successfully', HttpStatus.CREATED)
    } catch (error) {
      sendError(
        res,
        error instanceof Error ? error.message : 'Failed to create notification',
        undefined,
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id
      if (!userId) {
        sendError(res, 'User not authenticated', undefined, HttpStatus.UNAUTHORIZED)
        return
      }

      const count = await this.notificationService.getUnreadCount(userId)

      sendSuccess(res, { unreadCount: count }, 'Unread count retrieved successfully')
    } catch (error) {
      sendError(
        res,
        error instanceof Error ? error.message : 'Failed to get unread count',
        undefined,
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  // Helper methods for creating specific types of notifications
  async createBookingNotification(req: Request, res: Response): Promise<void> {
    try {
      const { userId, bookingData } = req.body

      if (!userId || !bookingData) {
        sendError(res, 'Missing required fields: userId, bookingData', undefined, HttpStatus.BAD_REQUEST)
        return
      }

      const notification = await this.notificationService.createBookingNotification(userId, bookingData)

      sendSuccess(res, notification, 'Booking notification created successfully', HttpStatus.CREATED)
    } catch (error) {
      sendError(
        res,
        error instanceof Error ? error.message : 'Failed to create booking notification',
        undefined,
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  async createPaymentNotification(req: Request, res: Response): Promise<void> {
    try {
      const { userId, paymentData } = req.body

      if (!userId || !paymentData) {
        sendError(res, 'Missing required fields: userId, paymentData', undefined, HttpStatus.BAD_REQUEST)
        return
      }

      const notification = await this.notificationService.createPaymentNotification(userId, paymentData)

      sendSuccess(res, notification, 'Payment notification created successfully', HttpStatus.CREATED)
    } catch (error) {
      sendError(
        res,
        error instanceof Error ? error.message : 'Failed to create payment notification',
        undefined,
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  async createPromotionNotification(req: Request, res: Response): Promise<void> {
    try {
      const { userId, promotionData } = req.body

      if (!userId || !promotionData) {
        sendError(res, 'Missing required fields: userId, promotionData', undefined, HttpStatus.BAD_REQUEST)
        return
      }

      const notification = await this.notificationService.createPromotionNotification(userId, promotionData)

      sendSuccess(res, notification, 'Promotion notification created successfully', HttpStatus.CREATED)
    } catch (error) {
      sendError(
        res,
        error instanceof Error ? error.message : 'Failed to create promotion notification',
        undefined,
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  async createSystemNotification(req: Request, res: Response): Promise<void> {
    try {
      const { userId, systemData } = req.body

      if (!userId || !systemData) {
        sendError(res, 'Missing required fields: userId, systemData', undefined, HttpStatus.BAD_REQUEST)
        return
      }

      const notification = await this.notificationService.createSystemNotification(userId, systemData)

      sendSuccess(res, notification, 'System notification created successfully', HttpStatus.CREATED)
    } catch (error) {
      sendError(
        res,
        error instanceof Error ? error.message : 'Failed to create system notification',
        undefined,
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
}
