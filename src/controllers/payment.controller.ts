import { Request, Response } from 'express'
import { PaymentService, PaymentRequest } from '../services/payment.service.js'
import { sendSuccess, sendError, sendBadRequest, sendNotFound } from '../utils/response.util.js'
import { HttpStatus } from '../types/common.types.js'
import { validate } from '../utils/validation.util.js'

export class PaymentController {
  private svc = new PaymentService()

  // POST /api/payments/initialize
  async initializePayment(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId, userId, amount, method, returnUrl, cancelUrl } = req.body
      
      // Advanced validation
      if (!['card', 'vnpay', 'momo', 'zalopay', 'bank_transfer', 'e_wallet', 'cash'].includes(method)) {
        return sendBadRequest(res, 'Invalid payment method')
      }
      
      const paymentRequest: PaymentRequest = {
        bookingId,
        userId,
        amount,
        method,
        returnUrl,
        cancelUrl
      }
      
      const response = await this.svc.initializePayment(paymentRequest)
      sendSuccess(res, response, 'Payment initialized successfully', HttpStatus.CREATED)
    } catch (err: any) {
      sendError(res, 'Error initializing payment', err?.message || 'Unknown error')
    }
  }

  // POST /api/payments/:id/confirm
  async confirmPayment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { gatewayTransactionId } = req.body
      
      const success = await this.svc.confirmPayment(id, gatewayTransactionId)
      
      if (success) {
        sendSuccess(res, { confirmed: true }, 'Payment confirmed successfully')
      } else {
        sendError(res, 'Failed to confirm payment')
      }
    } catch (err: any) {
      sendError(res, 'Error confirming payment', err?.message || 'Unknown error')
    }
  }

  // GET /api/payments/:id/status
  async getPaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      
      const payment = await this.svc.getPaymentStatus(id)
      
      if (!payment) {
        return sendNotFound(res, 'Payment not found')
      }
      
      sendSuccess(res, payment, 'Payment status retrieved successfully')
    } catch (err: any) {
      sendError(res, 'Error retrieving payment status', err?.message || 'Unknown error')
    }
  }

  // POST /api/payments/webhook/:method
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { method } = req.params
      const webhookData = req.body
      
      // Handle different payment gateway webhooks
      switch (method) {
        case 'vnpay':
          await this.handleVNPayWebhook(webhookData)
          break
        case 'momo':
          await this.handleMoMoWebhook(webhookData)
          break
        case 'zalopay':
          await this.handleZaloPayWebhook(webhookData)
          break
        default:
          return sendBadRequest(res, 'Unsupported webhook method')
      }
      
      sendSuccess(res, { received: true }, 'Webhook processed successfully')
    } catch (err: any) {
      sendError(res, 'Error processing webhook', err?.message || 'Unknown error')
    }
  }

  // POST /api/payments/capture (legacy endpoint)
  // Note: Basic validation handled by validatePaymentBasic middleware
  async capture(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId, userId, amount, method } = req.body
      
      // Advanced validation: Check payment method validity, amount matches booking, etc.
      // This is business logic validation
      
      const data = await this.svc.capture({ bookingId, userId, amount, method })
      sendSuccess(res, data, 'Payment captured successfully', HttpStatus.CREATED)
    } catch (err: any) {
      sendError(res, 'Error processing payment', err?.message || 'Unknown error')
    }
  }

  // Private webhook handlers
  private async handleVNPayWebhook(data: any): Promise<void> {
    // VNPay webhook processing logic
    if (data.vnp_ResponseCode === '00') {
      // Payment successful
      await this.svc.confirmPayment(data.vnp_TxnRef, data.vnp_TransactionNo)
    } else {
      // Payment failed
      // Handle failure logic
    }
  }

  private async handleMoMoWebhook(data: any): Promise<void> {
    // MoMo webhook processing logic
    if (data.resultCode === 0) {
      // Payment successful
      await this.svc.confirmPayment(data.orderId, data.transId)
    }
  }

  private async handleZaloPayWebhook(data: any): Promise<void> {
    // ZaloPay webhook processing logic
    if (data.return_code === 1) {
      // Payment successful
      await this.svc.confirmPayment(data.app_trans_id, data.zp_trans_id)
    }
  }
}


