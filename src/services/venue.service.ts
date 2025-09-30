import { CinemaModel } from '../database/models/cinema.model'
import { RoomModel } from '../database/models/room.model'
import { SeatModel } from '../database/models/seat.model'

export class VenueService {
  async listCinemas() {
    return await CinemaModel.find().lean()
  }

  async listRoomsByCinema(cinemaId: string) {
    return await RoomModel.find({ cinemaId }).lean()
  }

  async listSeatsByRoom(roomId: string) {
    return await SeatModel.find({ roomId }).lean()
  }
}


