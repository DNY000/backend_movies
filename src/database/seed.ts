import 'dotenv/config'
import mongoose from 'mongoose'
import { DatabaseConnection } from './connection.js'
import './models/index.js'

import { GenreModel } from './models/genre.model.js'
import { SeatTypeModel } from './models/seatType.model.js'
import { CinemaModel } from './models/cinema.model.js'
import { RoomModel } from './models/room.model.js'
import { SeatModel } from './models/seat.model.js'
import { LanguageModel } from './models/language.model.js'
import { ActorModel } from './models/actor.model.js'
import { MovieModel } from './models/movie.model.js'
import { PromotionModel } from './models/promotion.model.js'
import { ShowtimeModel } from './models/showtime.model.js'
import { UserModel } from './models/user.model.js'

async function upsertOne<T extends mongoose.Model<any>>(model: T, filter: any, update: any) {
  await model.updateOne(filter, { $setOnInsert: update }, { upsert: true })
}

async function seed() {
  const db = DatabaseConnection.getInstance()
  await db.connect()

  // Genres
  const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi']
  for (const name of genres) {
    await upsertOne(GenreModel as any, { name }, { name })
  }

  // Seat Types with price multipliers
  const seatTypes = [
    { code: 'STD', description: 'Standard', metadata: { priceMultiplier: 1.0 } },
    { code: 'VIP', description: 'VIP', metadata: { priceMultiplier: 1.3 } },
    { code: 'VVIP', description: 'VVIP', metadata: { priceMultiplier: 1.6 } }
  ]
  for (const st of seatTypes) {
    await upsertOne(SeatTypeModel as any, { code: st.code }, st)
  }

  // Languages
  const languages = [
    { name: 'English', isoCode: 'en' },
    { name: 'Vietnamese', isoCode: 'vi' }
  ]
  for (const lang of languages) {
    await upsertOne(LanguageModel as any, { name: lang.name }, lang)
  }

  // Users (for reference/testing only)
  await upsertOne(UserModel as any, { email: 'admin@example.com' }, {
    email: 'admin@example.com',
    name: 'Admin',
    role: 'admin',
    passwordHash: '$2b$10$PZs0oJbCjH2c0rN0K0K0uO3qf1f2cJc3m5Qq4Tt9uWwXxYyZzAaBC' // dummy hash
  })

  // Cinema + one room
  await upsertOne(CinemaModel as any, { name: 'Downtown Cinema' }, { name: 'Downtown Cinema', address: '123 Main St' })
  const cinema = await CinemaModel.findOne({ name: 'Downtown Cinema' }).lean()

  await upsertOne(RoomModel as any, { cinemaId: cinema?._id, name: 'Room 1' }, { cinemaId: cinema?._id, name: 'Room 1' })
  const room = await RoomModel.findOne({ cinemaId: cinema?._id, name: 'Room 1' }).lean()

  // Seats: rows A-D, numbers 1-10
  const seatTypeStd = await SeatTypeModel.findOne({ code: 'STD' }).lean()
  const seatTypeVip = await SeatTypeModel.findOne({ code: 'VIP' }).lean()

  const rows = ['A','B','C','D']
  for (const row of rows) {
    for (let n = 1; n <= 10; n++) {
      const seatTypeId = (row === 'A' || row === 'B') ? seatTypeVip?._id : seatTypeStd?._id
      await upsertOne(SeatModel as any, { roomId: room?._id, seatRow: row, seatNumber: n }, { roomId: room?._id, seatRow: row, seatNumber: n, seatTypeId })
    }
  }

  // Actors
  const actors = [
    { name: 'Actor One' },
    { name: 'Actor Two' },
    { name: 'Director X' }
  ]
  for (const a of actors) {
    await upsertOne(ActorModel as any, { name: a.name }, a)
  }

  // Movie referencing genres, actors, languages
  const action = await GenreModel.findOne({ name: 'Action' }).lean()
  const english = await LanguageModel.findOne({ name: 'English' }).lean()
  const actorOne = await ActorModel.findOne({ name: 'Actor One' }).lean()
  const directorX = await ActorModel.findOne({ name: 'Director X' }).lean()

  await upsertOne(MovieModel as any, { title: 'Sample Action Movie' }, {
    title: 'Sample Action Movie',
    description: 'An example seeded movie',
    posterUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/anh/Welcome.png',
    trailerUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/video/6956365212701.mp4',
    trailerYoutubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    releaseDate: new Date(),
    durationMinutes: 120,
    rating: 7.8,
    trending: true,
    mostPopular: false,
    genres: action?._id ? [action?._id] : [],
    languages: english?._id ? [english?._id] : [],
    actors: [
      { actor: actorOne?._id, roleType: 'main', characterName: 'Hero' },
      { actor: directorX?._id, roleType: 'director' }
    ]
  })

  const movie = await MovieModel.findOne({ title: 'Sample Action Movie' }).lean()

  // Promotion
  await upsertOne(PromotionModel as any, { code: 'WELCOME10' }, {
    code: 'WELCOME10',
    description: '10% off for first booking',
    discountPercent: 10,
    isActive: true
  })

  // Create a showtime for the movie in Room 1
  const start = new Date()
  start.setHours(start.getHours() + 2)
  await upsertOne(ShowtimeModel as any, { movieId: movie?._id, roomId: room?._id, startTime: start }, {
    movieId: movie?._id,
    roomId: room?._id,
    startTime: start,
    endTime: new Date(start.getTime() + 120 * 60000),
    price: 90000, // base price VND
  })

  // Sync indexes for safety after seed
  const modelNames = mongoose.modelNames()
  for (const name of modelNames) {
    try { await mongoose.model(name).syncIndexes() } catch { /* ignore */ }
  }

  // eslint-disable-next-line no-console
  console.log('Seed completed')
  await mongoose.disconnect()
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err)
  process.exit(1)
})


