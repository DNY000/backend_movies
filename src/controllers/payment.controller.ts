import { Request, Response } from 'express'
import { PaymentService } from '../services/payment.service.js'

export class PaymentController {
  private svc = new PaymentService()

  // POST /api/payments/capture
  async capture(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId, userId, amount, method } = req.body
      const data = await this.svc.capture({ bookingId, userId, amount, method })
      res.status(201).json({ success: true, data })
    } catch (err: any) {
      res.status(500).json({ success: false, message: err?.message || 'Error' })
    }
  }
}


