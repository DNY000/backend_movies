import { Router } from 'express'
import { PaymentController } from '../controllers/payment.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { validatePaymentBasic } from '../middleware/validation.middleware.js'

const router = Router()
const ctrl = new PaymentController()

router.post('/capture', authMiddleware, validatePaymentBasic, (req, res) => ctrl.capture(req, res))

export { router as paymentRoutes }


