import { PaymentModel, PaymentMethod, PaymentStatus } from '../database/models/payment.model.js'
import { BookingModel } from '../database/models/booking.model.js'
import { TicketService } from './ticket.service.js'
import crypto from 'crypto'

export interface PaymentRequest {
  bookingId: string
  userId: string
  amount: number
  method: PaymentMethod
  returnUrl?: string
  cancelUrl?: string
  metadata?: Record<string, unknown>
}

export interface PaymentResponse {
  paymentId: string
  transactionId: string
  status: PaymentStatus
  paymentUrl?: string
  qrCode?: string
  message: string
}

export class PaymentService {
  private ticketService = new TicketService()

  /**
   * Initialize payment process
   */
  async initializePayment(params: PaymentRequest): Promise<PaymentResponse> {
    // Verify booking exists and is pending
    const booking = await BookingModel.findById(params.bookingId).lean()
    if (!booking) {
      throw new Error('Booking not found')
    }

    if (booking.status !== 'pending') {
      throw new Error('Booking is not in pending status')
    }

    if (booking.totalAmount !== params.amount) {
      throw new Error('Payment amount does not match booking total')
    }

    // Generate transaction ID
    const transactionId = this.generateTransactionId()

    // Create payment record
    const payment = await PaymentModel.create({
      bookingId: params.bookingId,
      userId: params.userId,
      amount: params.amount,
      method: params.method,
      status: 'pending',
      transactionId,
      metadata: params.metadata
    })

    const paymentId = (payment as any)._id.toString()

    // Process based on payment method
    let response: PaymentResponse

    switch (params.method) {
      case 'card':
        response = await this.processCardPayment(paymentId, params)
        break
      case 'vnpay':
        response = await this.processVNPayPayment(paymentId, params)
        break
      case 'momo':
        response = await this.processMoMoPayment(paymentId, params)
        break
      case 'zalopay':
        response = await this.processZaloPayPayment(paymentId, params)
        break
      case 'bank_transfer':
        response = await this.processBankTransfer(paymentId, params)
        break
      case 'e_wallet':
        response = await this.processEWallet(paymentId, params)
        break
      case 'cash':
        response = await this.processCashPayment(paymentId, params)
        break
      default:
        throw new Error(`Unsupported payment method: ${params.method}`)
    }

    return response
  }

  /**
   * Process card payment
   */
  private async processCardPayment(paymentId: string, params: PaymentRequest): Promise<PaymentResponse> {
    await PaymentModel.findByIdAndUpdate(paymentId, { status: 'processing' })
    
    return {
      paymentId,
      transactionId: await this.getTransactionId(paymentId),
      status: 'processing',
      paymentUrl: `https://payment-gateway.com/pay/${paymentId}`,
      message: 'Redirecting to card payment gateway'
    }
  }

  /**
   * Process VNPay payment
   */
  private async processVNPayPayment(paymentId: string, params: PaymentRequest): Promise<PaymentResponse> {
    await PaymentModel.findByIdAndUpdate(paymentId, { status: 'processing' })

    return {
      paymentId,
      transactionId: await this.getTransactionId(paymentId),
      status: 'processing',
      paymentUrl: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?amount=${params.amount}`,
      message: 'Redirecting to VNPay'
    }
  }

  /**
   * Process MoMo payment
   */
  private async processMoMoPayment(paymentId: string, params: PaymentRequest): Promise<PaymentResponse> {
    await PaymentModel.findByIdAndUpdate(paymentId, { status: 'processing' })

    return {
      paymentId,
      transactionId: await this.getTransactionId(paymentId),
      status: 'processing',
      qrCode: `momo://pay?amount=${params.amount}&orderId=${paymentId}`,
      message: 'Scan QR code with MoMo app'
    }
  }

  /**
   * Process ZaloPay payment
   */
  private async processZaloPayPayment(paymentId: string, params: PaymentRequest): Promise<PaymentResponse> {
    await PaymentModel.findByIdAndUpdate(paymentId, { status: 'processing' })

    return {
      paymentId,
      transactionId: await this.getTransactionId(paymentId),
      status: 'processing',
      paymentUrl: `https://zalopay.vn/pay/${paymentId}`,
      message: 'Redirecting to ZaloPay'
    }
  }

  /**
   * Process bank transfer
   */
  private async processBankTransfer(paymentId: string, params: PaymentRequest): Promise<PaymentResponse> {
    return {
      paymentId,
      transactionId: await this.getTransactionId(paymentId),
      status: 'pending',
      message: 'Please transfer money to the provided bank account'
    }
  }

  /**
   * Process e-wallet payment
   */
  private async processEWallet(paymentId: string, params: PaymentRequest): Promise<PaymentResponse> {
    await PaymentModel.findByIdAndUpdate(paymentId, { status: 'processing' })

    return {
      paymentId,
      transactionId: await this.getTransactionId(paymentId),
      status: 'processing',
      paymentUrl: `https://ewallet.com/pay/${paymentId}`,
      message: 'Redirecting to e-wallet payment'
    }
  }

  /**
   * Process cash payment
   */
  private async processCashPayment(paymentId: string, params: PaymentRequest): Promise<PaymentResponse> {
    return {
      paymentId,
      transactionId: await this.getTransactionId(paymentId),
      status: 'pending',
      message: 'Please pay cash at the cinema counter'
    }
  }

  /**
   * Confirm payment
   */
  async confirmPayment(paymentId: string, gatewayTransactionId?: string): Promise<boolean> {
    const payment = await PaymentModel.findById(paymentId)
    if (!payment) {
      throw new Error('Payment not found')
    }

    // Update payment status
    await PaymentModel.findByIdAndUpdate(paymentId, {
      status: 'completed',
      gatewayTransactionId,
      processedAt: new Date()
    })

    // Update booking status
    await BookingModel.findByIdAndUpdate(payment.bookingId, { status: 'paid' })

    // Generate tickets automatically after payment confirmation
    try {
      await this.ticketService.generateTickets(payment.bookingId.toString())
    } catch (error) {
      console.error('Error generating tickets after payment confirmation:', error)
      // Don't fail the payment confirmation if ticket generation fails
      // Tickets can be generated manually later
    }

    return true
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string) {
    return await PaymentModel.findById(paymentId).populate('bookingId').lean()
  }

  /**
   * Generate transaction ID
   */
  private generateTransactionId(): string {
    const timestamp = Date.now().toString()
    const random = crypto.randomBytes(4).toString('hex').toUpperCase()
    return `TXN_${timestamp}_${random}`
  }

  /**
   * Get transaction ID
   */
  private async getTransactionId(paymentId: string): Promise<string> {
    const payment = await PaymentModel.findById(paymentId).lean()
    return payment?.transactionId || ''
  }

  /**
   * Legacy capture method for backward compatibility
   */
  async capture(params: { bookingId: string; userId: string; amount: number; method: string }) {
    const paymentRequest: PaymentRequest = {
      bookingId: params.bookingId,
      userId: params.userId,
      amount: params.amount,
      method: params.method as PaymentMethod
    }

    const response = await this.initializePayment(paymentRequest)
    
    // Auto-confirm for cash and bank transfer
    if (['cash', 'bank_transfer'].includes(params.method)) {
      await this.confirmPayment(response.paymentId)
    }

    return response
  }
}


