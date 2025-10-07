import { Router } from 'express'
import { ScheduledNotificationController } from '../controllers/scheduled-notification.controller.js'
import { adminMiddleware } from '../middleware/admin.middleware.js'

const router = Router()
const scheduledNotificationController = new ScheduledNotificationController()

// Admin routes (require admin authentication)
router.post(
  '/manual-reminder',
  adminMiddleware,
  scheduledNotificationController.sendManualReminder.bind(scheduledNotificationController),
)
router.get(
  '/stats',
  adminMiddleware,
  scheduledNotificationController.getNotificationStats.bind(scheduledNotificationController),
)
router.post(
  '/restart',
  adminMiddleware,
  scheduledNotificationController.restartScheduledTasks.bind(scheduledNotificationController),
)
router.post(
  '/stop',
  adminMiddleware,
  scheduledNotificationController.stopScheduledTasks.bind(scheduledNotificationController),
)
router.post(
  '/start',
  adminMiddleware,
  scheduledNotificationController.startScheduledTasks.bind(scheduledNotificationController),
)

export { router as scheduledNotificationRoutes }
