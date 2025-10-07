/* eslint-disable no-console */
import { NotificationService } from './notification.service.js'
import { BookingModel } from '../database/models/booking.model.js'
import { ShowtimeModel } from '../database/models/showtime.model.js'
import { MovieModel } from '../database/models/movie.model.js'
import { CinemaModel } from '../database/models/cinema.model.js'
import { RoomModel } from '../database/models/room.model.js'

export class ScheduledNotificationService {
  private notificationService: NotificationService
  private intervals: NodeJS.Timeout[] = []

  constructor() {
    this.notificationService = new NotificationService()
  }

  /**
   * Khởi động tất cả scheduled tasks
   */
  startScheduledTasks(): void {
    console.log('Starting scheduled notification tasks...')

    // Chạy mỗi 30 phút để kiểm tra thông báo
    const checkInterval = setInterval(() => {
      this.checkAndSendNotifications()
    }, 30 * 60 * 1000) // 30 phút

    this.intervals.push(checkInterval)

    // Chạy ngay lập tức lần đầu
    this.checkAndSendNotifications()

    console.log('Scheduled notification tasks started')
  }

  /**
   * Dừng tất cả scheduled tasks
   */
  stopScheduledTasks(): void {
    console.log('Stopping scheduled notification tasks...')
    this.intervals.forEach(interval => clearInterval(interval))
    this.intervals = []
    console.log('Scheduled notification tasks stopped')
  }

  /**
   * Kiểm tra và gửi thông báo cho các showtime sắp tới
   */
  private async checkAndSendNotifications(): Promise<void> {
    try {
      const now = new Date()

      // Kiểm tra thông báo trước 1 ngày (24h)
      await this.checkAndSendDayBeforeNotifications(now)

      // Kiểm tra thông báo trước 12 giờ
      await this.checkAndSend12HoursBeforeNotifications(now)
    } catch (error) {
      console.error('Error in scheduled notification check:', error)
    }
  }

  /**
   * Gửi thông báo trước 1 ngày (24h)
   */
  private async checkAndSendDayBeforeNotifications(now: Date): Promise<void> {
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const oneDayFromNowPlus1Hour = new Date(oneDayFromNow.getTime() + 60 * 60 * 1000)

    // Tìm showtimes trong khoảng 24h ± 1h
    const showtimes = await ShowtimeModel.find({
      startTime: {
        $gte: oneDayFromNow,
        $lte: oneDayFromNowPlus1Hour,
      },
    })
      .populate('movieId roomId')
      .lean()

    for (const showtime of showtimes) {
      await this.sendDayBeforeNotification(showtime)
    }
  }

  /**
   * Gửi thông báo trước 12 giờ
   */
  private async checkAndSend12HoursBeforeNotifications(now: Date): Promise<void> {
    const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60 * 1000)
    const twelveHoursFromNowPlus30Min = new Date(twelveHoursFromNow.getTime() + 30 * 60 * 1000)

    // Tìm showtimes trong khoảng 12h ± 30 phút
    const showtimes = await ShowtimeModel.find({
      startTime: {
        $gte: twelveHoursFromNow,
        $lte: twelveHoursFromNowPlus30Min,
      },
    })
      .populate('movieId roomId')
      .lean()

    for (const showtime of showtimes) {
      await this.send12HoursBeforeNotification(showtime)
    }
  }

  /**
   * Gửi thông báo trước 1 ngày cho một showtime
   */
  private async sendDayBeforeNotification(showtime: any): Promise<void> {
    try {
      // Tìm tất cả booking cho showtime này
      const bookings = await BookingModel.find({
        showtimeId: showtime._id,
        status: 'confirmed',
      })
        .populate('userId')
        .lean()

      const movie = await MovieModel.findById(showtime.movieId).lean()
      const room = await RoomModel.findById(showtime.roomId).populate('cinemaId').lean()
      const cinema = await CinemaModel.findById(room?.cinemaId).lean()

      for (const booking of bookings) {
        const userId = booking.userId._id || booking.userId

        // Kiểm tra xem đã gửi thông báo chưa
        const existingNotification = await this.notificationService.getUnreadByUser(userId.toString(), 0, 100)

        const alreadyNotified = existingNotification.notifications.some(
          notif =>
            notif.type === 'booking' &&
            notif.data?.showtimeId === showtime._id.toString() &&
            notif.data?.reminderType === 'day_before',
        )

        if (!alreadyNotified) {
          await this.notificationService.create({
            userId: userId.toString(),
            title: 'Nhắc nhở xem phim ngày mai',
            message: `Bạn có vé xem phim "${movie?.title}" ngày mai lúc ${this.formatTime(showtime.startTime)} tại ${
              cinema?.name
            }`,
            type: 'booking',
            data: {
              bookingId: booking._id,
              showtimeId: showtime._id,
              movieTitle: movie?.title,
              cinemaName: cinema?.name,
              roomName: room?.name,
              showtime: showtime.startTime,
              reminderType: 'day_before',
            },
          })

          console.log(`Sent day-before notification to user ${userId} for showtime ${showtime._id}`)
        }
      }
    } catch (error) {
      console.error(`Error sending day-before notification for showtime ${showtime._id}:`, error)
    }
  }

  /**
   * Gửi thông báo trước 12 giờ cho một showtime
   */
  private async send12HoursBeforeNotification(showtime: any): Promise<void> {
    try {
      // Tìm tất cả booking cho showtime này
      const bookings = await BookingModel.find({
        showtimeId: showtime._id,
        status: 'confirmed',
      })
        .populate('userId')
        .lean()

      const movie = await MovieModel.findById(showtime.movieId).lean()
      const room = await RoomModel.findById(showtime.roomId).populate('cinemaId').lean()
      const cinema = await CinemaModel.findById(room?.cinemaId).lean()

      for (const booking of bookings) {
        const userId = booking.userId._id || booking.userId

        // Kiểm tra xem đã gửi thông báo chưa
        const existingNotification = await this.notificationService.getUnreadByUser(userId.toString(), 0, 100)

        const alreadyNotified = existingNotification.notifications.some(
          notif =>
            notif.type === 'booking' &&
            notif.data?.showtimeId === showtime._id.toString() &&
            notif.data?.reminderType === '12_hours_before',
        )

        if (!alreadyNotified) {
          await this.notificationService.create({
            userId: userId.toString(),
            title: 'Nhắc nhở xem phim sắp tới',
            message: `Bạn có vé xem phim "${movie?.title}" lúc ${this.formatTime(showtime.startTime)} tại ${
              cinema?.name
            }. Hãy đến sớm 15 phút!`,
            type: 'booking',
            data: {
              bookingId: booking._id,
              showtimeId: showtime._id,
              movieTitle: movie?.title,
              cinemaName: cinema?.name,
              roomName: room?.name,
              showtime: showtime.startTime,
              reminderType: '12_hours_before',
            },
          })

          console.log(`Sent 12-hours-before notification to user ${userId} for showtime ${showtime._id}`)
        }
      }
    } catch (error) {
      console.error(`Error sending 12-hours-before notification for showtime ${showtime._id}:`, error)
    }
  }

  /**
   * Format thời gian hiển thị
   */
  private formatTime(date: Date): string {
    return new Date(date).toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  /**
   * Gửi thông báo thủ công cho một showtime cụ thể
   */
  async sendManualReminder(showtimeId: string, reminderType: 'day_before' | '12_hours_before'): Promise<void> {
    const showtime = await ShowtimeModel.findById(showtimeId).populate('movieId roomId').lean()
    if (!showtime) {
      throw new Error('Showtime not found')
    }

    if (reminderType === 'day_before') {
      await this.sendDayBeforeNotification(showtime)
    } else {
      await this.send12HoursBeforeNotification(showtime)
    }
  }

  /**
   * Lấy thống kê thông báo đã gửi
   */
  async getNotificationStats(): Promise<{
    dayBeforeSent: number
    twelveHoursBeforeSent: number
    totalBookings: number
  }> {
    const now = new Date()
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60 * 1000)

    const [dayBeforeBookings, twelveHoursBookings, totalBookings] = await Promise.all([
      BookingModel.countDocuments({
        showtimeId: {
          $in: await ShowtimeModel.find({
            startTime: {
              $gte: oneDayFromNow,
              $lte: new Date(oneDayFromNow.getTime() + 60 * 60 * 1000),
            },
          }).distinct('_id'),
        },
        status: 'confirmed',
      }),
      BookingModel.countDocuments({
        showtimeId: {
          $in: await ShowtimeModel.find({
            startTime: {
              $gte: twelveHoursFromNow,
              $lte: new Date(twelveHoursFromNow.getTime() + 30 * 60 * 1000),
            },
          }).distinct('_id'),
        },
        status: 'confirmed',
      }),
      BookingModel.countDocuments({ status: 'confirmed' }),
    ])

    return {
      dayBeforeSent: dayBeforeBookings,
      twelveHoursBeforeSent: twelveHoursBookings,
      totalBookings,
    }
  }
}
