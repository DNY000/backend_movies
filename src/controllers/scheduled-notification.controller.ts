import { Request, Response } from 'express'
import { ScheduledNotificationService } from '../services/scheduled-notification.service.js'
import { sendSuccess, sendError } from '../utils/response.util.js'
import { HttpStatus } from '../types/common.types.js'

export class ScheduledNotificationController {
  private scheduledNotificationService: ScheduledNotificationService

  constructor() {
    this.scheduledNotificationService = new ScheduledNotificationService()
  }

  /**
   * Gửi thông báo thủ công cho một showtime
   */
  async sendManualReminder(req: Request, res: Response): Promise<void> {
    try {
      const { showtimeId, reminderType } = req.body

      if (!showtimeId || !reminderType) {
        sendError(res, 'Missing required fields: showtimeId, reminderType', undefined, HttpStatus.BAD_REQUEST)
        return
      }

      if (!['day_before', '12_hours_before'].includes(reminderType)) {
        sendError(
          res,
          'Invalid reminderType. Must be "day_before" or "12_hours_before"',
          undefined,
          HttpStatus.BAD_REQUEST,
        )
        return
      }

      await this.scheduledNotificationService.sendManualReminder(showtimeId, reminderType)

      sendSuccess(res, { showtimeId, reminderType }, 'Manual reminder sent successfully')
    } catch (error) {
      sendError(
        res,
        error instanceof Error ? error.message : 'Failed to send manual reminder',
        undefined,
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  /**
   * Lấy thống kê thông báo đã gửi
   */
  async getNotificationStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.scheduledNotificationService.getNotificationStats()

      sendSuccess(res, stats, 'Notification stats retrieved successfully')
    } catch (error) {
      sendError(
        res,
        error instanceof Error ? error.message : 'Failed to get notification stats',
        undefined,
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  /**
   * Khởi động lại scheduled tasks
   */
  async restartScheduledTasks(req: Request, res: Response): Promise<void> {
    try {
      this.scheduledNotificationService.stopScheduledTasks()
      this.scheduledNotificationService.startScheduledTasks()

      sendSuccess(res, { message: 'Scheduled tasks restarted' }, 'Scheduled tasks restarted successfully')
    } catch (error) {
      sendError(
        res,
        error instanceof Error ? error.message : 'Failed to restart scheduled tasks',
        undefined,
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  /**
   * Dừng scheduled tasks
   */
  async stopScheduledTasks(req: Request, res: Response): Promise<void> {
    try {
      this.scheduledNotificationService.stopScheduledTasks()

      sendSuccess(res, { message: 'Scheduled tasks stopped' }, 'Scheduled tasks stopped successfully')
    } catch (error) {
      sendError(
        res,
        error instanceof Error ? error.message : 'Failed to stop scheduled tasks',
        undefined,
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  /**
   * Khởi động scheduled tasks
   */
  async startScheduledTasks(req: Request, res: Response): Promise<void> {
    try {
      this.scheduledNotificationService.startScheduledTasks()

      sendSuccess(res, { message: 'Scheduled tasks started' }, 'Scheduled tasks started successfully')
    } catch (error) {
      sendError(
        res,
        error instanceof Error ? error.message : 'Failed to start scheduled tasks',
        undefined,
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
}
