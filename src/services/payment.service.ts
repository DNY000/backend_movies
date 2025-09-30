import { PaymentModel } from '../database/models/payment.model'
import { BookingModel } from '../database/models/booking.model'

export class PaymentService {
  async capture(params: { bookingId: string; userId: string; amount: number; method: string }) {
    const payment = await PaymentModel.create({
      bookingId: params.bookingId,
      userId: params.userId,
      amount: params.amount,
      method: params.method,
      status: 'success',
      paidAt: new Date()
    })
    await BookingModel.findByIdAndUpdate(params.bookingId, { status: 'paid' })
    return payment
  }
}


