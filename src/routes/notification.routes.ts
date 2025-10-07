import { Router } from 'express'
import { NotificationController } from '../controllers/notification.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { adminMiddleware } from '../middleware/admin.middleware.js'

const router = Router()
const notificationController = new NotificationController()

// User routes (require authentication)
router.get('/', authMiddleware, notificationController.getAllNotifications.bind(notificationController))
router.get('/unread', authMiddleware, notificationController.getUnreadNotifications.bind(notificationController))
router.get('/unread-count', authMiddleware, notificationController.getUnreadCount.bind(notificationController))
router.put('/:id/read', authMiddleware, notificationController.markAsRead.bind(notificationController))
router.put('/read-all', authMiddleware, notificationController.markAllAsRead.bind(notificationController))

// Admin routes (require admin authentication)
router.post('/', adminMiddleware, notificationController.createNotification.bind(notificationController))
router.post('/booking', adminMiddleware, notificationController.createBookingNotification.bind(notificationController))
router.post('/payment', adminMiddleware, notificationController.createPaymentNotification.bind(notificationController))
router.post(
  '/promotion',
  adminMiddleware,
  notificationController.createPromotionNotification.bind(notificationController),
)
router.post('/system', adminMiddleware, notificationController.createSystemNotification.bind(notificationController))

export { router as notificationRoutes }
