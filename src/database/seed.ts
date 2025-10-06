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
    { code: 'VVIP', description: 'VVIP', metadata: { priceMultiplier: 1.6 } },
  ]
  for (const st of seatTypes) {
    await upsertOne(SeatTypeModel as any, { code: st.code }, st)
  }

  // Languages
  const languages = [
    { name: 'English', isoCode: 'en' },
    { name: 'Vietnamese', isoCode: 'vi' },
  ]
  for (const lang of languages) {
    await upsertOne(LanguageModel as any, { name: lang.name }, lang)
  }

  // Users (for reference/testing only)
  await upsertOne(
    UserModel as any,
    { email: 'admin@example.com' },
    {
      email: 'admin@example.com',
      name: 'Admin',
      role: 'admin',
      password: '$2b$10$PZs0oJbCjH2c0rN0K0K0uO3qf1f2cJc3m5Qq4Tt9uWwXxYyZzAaBC', // dummy hash
      isActive: true,
    },
  )

  // Cinemas + rooms
  await upsertOne(CinemaModel as any, { name: 'Downtown Cinema' }, { name: 'Downtown Cinema', address: '123 Main St' })
  await upsertOne(CinemaModel as any, { name: 'Uptown Cinema' }, { name: 'Uptown Cinema', address: '456 High St' })
  const downtown = await CinemaModel.findOne({ name: 'Downtown Cinema' }).lean()
  const uptown = await CinemaModel.findOne({ name: 'Uptown Cinema' }).lean()

  // Downtown rooms
  await upsertOne(
    RoomModel as any,
    { cinemaId: downtown?._id, name: 'Room 1' },
    { cinemaId: downtown?._id, name: 'Room 1' },
  )
  await upsertOne(
    RoomModel as any,
    { cinemaId: downtown?._id, name: 'Room 2' },
    { cinemaId: downtown?._id, name: 'Room 2' },
  )
  const room1 = await RoomModel.findOne({ cinemaId: downtown?._id, name: 'Room 1' }).lean()
  const room2 = await RoomModel.findOne({ cinemaId: downtown?._id, name: 'Room 2' }).lean()

  // Uptown rooms
  await upsertOne(
    RoomModel as any,
    { cinemaId: uptown?._id, name: 'Hall A' },
    { cinemaId: uptown?._id, name: 'Hall A' },
  )
  const hallA = await RoomModel.findOne({ cinemaId: uptown?._id, name: 'Hall A' }).lean()

  // Seats layout for the room:
  //  - 4 rows: A, B, C, D
  //  - Rows A & D: 7 seats each
  //  - Rows B & C: 8 seats each
  const seatTypeStd = await SeatTypeModel.findOne({ code: 'STD' }).lean()
  const seatTypeVip = await SeatTypeModel.findOne({ code: 'VIP' }).lean()

  // Helper to (re)build seats for a room with the specified layout
  const buildSeatsForRoom = async (roomDoc: any) => {
    if (!roomDoc?._id) return
    await SeatModel.deleteMany({ roomId: roomDoc?._id })

    const seatConfig: Record<string, number> = { A: 7, B: 8, C: 8, D: 7 }
    for (const row of Object.keys(seatConfig)) {
      const seatCount = seatConfig[row]
      for (let n = 1; n <= seatCount; n++) {
        const seatTypeId = row === 'A' || row === 'B' ? seatTypeVip?._id : seatTypeStd?._id
        await upsertOne(
          SeatModel as any,
          { roomId: roomDoc?._id, seatRow: row, seatNumber: n },
          { roomId: roomDoc?._id, seatRow: row, seatNumber: n, seatTypeId },
        )
      }
    }
  }

  await buildSeatsForRoom(room1)
  await buildSeatsForRoom(room2)
  await buildSeatsForRoom(hallA)

  // Actors
  const actors = [{ name: 'Actor One' }, { name: 'Actor Two' }, { name: 'Director X' }]
  for (const a of actors) {
    await upsertOne(ActorModel as any, { name: a.name }, a)
  }

  // Movie referencing genres, actors, languages
  const action = await GenreModel.findOne({ name: 'Action' }).lean()
  const english = await LanguageModel.findOne({ name: 'English' }).lean()
  const actorOne = await ActorModel.findOne({ name: 'Actor One' }).lean()
  const directorX = await ActorModel.findOne({ name: 'Director X' }).lean()

  await upsertOne(
    MovieModel as any,
    { title: 'Sample Action Movie' },
    {
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
        { actor: directorX?._id, roleType: 'director' },
      ],
    },
  )

  // Additional 20 movies
  const comedy = await GenreModel.findOne({ name: 'Comedy' }).lean()
  const drama = await GenreModel.findOne({ name: 'Drama' }).lean()
  const horror = await GenreModel.findOne({ name: 'Horror' }).lean()
  const romance = await GenreModel.findOne({ name: 'Romance' }).lean()
  const scifi = await GenreModel.findOne({ name: 'Sci-Fi' }).lean()
  const vietnamese = await LanguageModel.findOne({ name: 'Vietnamese' }).lean()
  const actorTwo = await ActorModel.findOne({ name: 'Actor Two' }).lean()

  const newMovies = [
    {
      title: 'The Dark Knight Returns',
      description: 'Batman faces his greatest challenge yet in this epic superhero thriller.',
      posterUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/anh/Welcome.png',
      trailerUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/video/6956365212701.mp4',
      trailerYoutubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      releaseDate: new Date('2024-03-15'),
      durationMinutes: 142,
      rating: 9.1,
      trending: true,
      mostPopular: true,
      genres: [action?._id],
      languages: [english?._id],
      actors: [
        { actor: actorOne?._id, roleType: 'main', characterName: 'Batman' },
        { actor: directorX?._id, roleType: 'director' },
      ],
    },
    {
      title: 'Laugh Out Loud',
      description: 'A hilarious comedy about friendship and unexpected adventures.',
      posterUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/anh/Welcome.png',
      trailerUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/video/6956365212701.mp4',
      trailerYoutubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      releaseDate: new Date('2024-02-20'),
      durationMinutes: 98,
      rating: 7.5,
      trending: false,
      mostPopular: false,
      genres: [comedy?._id],
      languages: [english?._id],
      actors: [
        { actor: actorTwo?._id, roleType: 'main', characterName: 'Comedian' },
        { actor: directorX?._id, roleType: 'director' },
      ],
    },
    {
      title: 'Hearts Entwined',
      description: 'A romantic drama about love that transcends time and space.',
      posterUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/anh/Welcome.png',
      trailerUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/video/6956365212701.mp4',
      trailerYoutubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      releaseDate: new Date('2024-01-14'),
      durationMinutes: 115,
      rating: 8.2,
      trending: true,
      mostPopular: false,
      genres: [romance?._id, drama?._id],
      languages: [english?._id],
      actors: [
        { actor: actorOne?._id, roleType: 'main', characterName: 'Lover' },
        { actor: actorTwo?._id, roleType: 'main', characterName: 'Beloved' },
      ],
    },
    {
      title: 'Nightmare Valley',
      description: 'A spine-chilling horror that will keep you awake at night.',
      posterUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/anh/Welcome.png',
      trailerUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/video/6956365212701.mp4',
      trailerYoutubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      releaseDate: new Date('2024-10-31'),
      durationMinutes: 105,
      rating: 7.8,
      trending: true,
      mostPopular: false,
      genres: [horror?._id],
      languages: [english?._id],
      actors: [
        { actor: actorTwo?._id, roleType: 'main', characterName: 'Survivor' },
        { actor: directorX?._id, roleType: 'director' },
      ],
    },
    {
      title: 'Galactic Warriors',
      description: 'An epic space adventure with stunning visual effects.',
      posterUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/anh/Welcome.png',
      trailerUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/video/6956365212701.mp4',
      trailerYoutubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      releaseDate: new Date('2024-05-04'),
      durationMinutes: 138,
      rating: 8.7,
      trending: true,
      mostPopular: true,
      genres: [scifi?._id, action?._id],
      languages: [english?._id],
      actors: [
        { actor: actorOne?._id, roleType: 'main', characterName: 'Space Captain' },
        { actor: actorTwo?._id, roleType: 'supporting', characterName: 'Pilot' },
      ],
    },
    {
      title: 'Tình Yêu Sài Gòn',
      description: 'Câu chuyện tình yêu lãng mạn giữa lòng Sài Gòn.',
      posterUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/anh/Welcome.png',
      trailerUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/video/6956365212701.mp4',
      trailerYoutubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      releaseDate: new Date('2024-02-14'),
      durationMinutes: 110,
      rating: 8.0,
      trending: false,
      mostPopular: true,
      genres: [romance?._id, drama?._id],
      languages: [vietnamese?._id],
      actors: [
        { actor: actorOne?._id, roleType: 'main', characterName: 'Minh' },
        { actor: actorTwo?._id, roleType: 'main', characterName: 'Linh' },
      ],
    },
    {
      title: 'The Last Stand',
      description: 'A gripping action thriller about survival against all odds.',
      posterUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/anh/Welcome.png',
      trailerUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/video/6956365212701.mp4',
      trailerYoutubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      releaseDate: new Date('2024-07-20'),
      durationMinutes: 125,
      rating: 8.4,
      trending: true,
      mostPopular: false,
      genres: [action?._id, drama?._id],
      languages: [english?._id],
      actors: [
        { actor: actorOne?._id, roleType: 'main', characterName: 'Sheriff' },
        { actor: directorX?._id, roleType: 'director' },
      ],
    },
    {
      title: 'Comedy Central',
      description: 'The funniest movie of the year with non-stop laughs.',
      posterUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/anh/Welcome.png',
      trailerUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/video/6956365212701.mp4',
      trailerYoutubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      releaseDate: new Date('2024-04-01'),
      durationMinutes: 92,
      rating: 7.2,
      trending: false,
      mostPopular: false,
      genres: [comedy?._id],
      languages: [english?._id],
      actors: [
        { actor: actorTwo?._id, roleType: 'main', characterName: 'Joker' },
        { actor: directorX?._id, roleType: 'director' },
      ],
    },
    {
      title: 'Future World',
      description: 'A dystopian sci-fi adventure set in the year 2150.',
      posterUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/anh/Welcome.png',
      trailerUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/video/6956365212701.mp4',
      trailerYoutubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      releaseDate: new Date('2024-08-15'),
      durationMinutes: 145,
      rating: 8.6,
      trending: true,
      mostPopular: true,
      genres: [scifi?._id, action?._id],
      languages: [english?._id],
      actors: [
        { actor: actorOne?._id, roleType: 'main', characterName: 'Rebel Leader' },
        { actor: actorTwo?._id, roleType: 'supporting', characterName: 'Android' },
      ],
    },
    {
      title: 'Haunted House',
      description: 'A terrifying horror experience in an abandoned mansion.',
      posterUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/anh/Welcome.png',
      trailerUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/video/6956365212701.mp4',
      trailerYoutubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      releaseDate: new Date('2024-10-13'),
      durationMinutes: 98,
      rating: 7.6,
      trending: false,
      mostPopular: false,
      genres: [horror?._id],
      languages: [english?._id],
      actors: [
        { actor: actorTwo?._id, roleType: 'main', characterName: 'Investigator' },
        { actor: directorX?._id, roleType: 'director' },
      ],
    },
    {
      title: 'Love Actually Returns',
      description: 'A heartwarming romantic comedy about second chances.',
      posterUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/anh/Welcome.png',
      trailerUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/video/6956365212701.mp4',
      trailerYoutubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      releaseDate: new Date('2024-12-25'),
      durationMinutes: 118,
      rating: 8.1,
      trending: true,
      mostPopular: false,
      genres: [romance?._id, comedy?._id],
      languages: [english?._id],
      actors: [
        { actor: actorOne?._id, roleType: 'main', characterName: 'Writer' },
        { actor: actorTwo?._id, roleType: 'main', characterName: 'Editor' },
      ],
    },
    {
      title: 'Action Hero',
      description: 'Non-stop action with incredible stunts and fight scenes.',
      posterUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/anh/Welcome.png',
      trailerUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/video/6956365212701.mp4',
      trailerYoutubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      releaseDate: new Date('2024-06-10'),
      durationMinutes: 132,
      rating: 8.3,
      trending: true,
      mostPopular: true,
      genres: [action?._id],
      languages: [english?._id],
      actors: [
        { actor: actorOne?._id, roleType: 'main', characterName: 'Hero' },
        { actor: directorX?._id, roleType: 'director' },
      ],
    },
    {
      title: 'Cuộc Sống Thường Ngày',
      description: 'Bộ phim hài kịch về cuộc sống hàng ngày của người Việt.',
      posterUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/anh/Welcome.png',
      trailerUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/video/6956365212701.mp4',
      trailerYoutubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      releaseDate: new Date('2024-03-08'),
      durationMinutes: 105,
      rating: 7.9,
      trending: false,
      mostPopular: false,
      genres: [comedy?._id, drama?._id],
      languages: [vietnamese?._id],
      actors: [
        { actor: actorTwo?._id, roleType: 'main', characterName: 'Bác Tư' },
        { actor: directorX?._id, roleType: 'director' },
      ],
    },
    {
      title: 'Space Odyssey 2024',
      description: 'A mind-bending journey through space and time.',
      posterUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/anh/Welcome.png',
      trailerUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/video/6956365212701.mp4',
      trailerYoutubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      releaseDate: new Date('2024-09-21'),
      durationMinutes: 155,
      rating: 9.0,
      trending: true,
      mostPopular: true,
      genres: [scifi?._id, drama?._id],
      languages: [english?._id],
      actors: [
        { actor: actorOne?._id, roleType: 'main', characterName: 'Astronaut' },
        { actor: actorTwo?._id, roleType: 'supporting', characterName: 'AI Voice' },
      ],
    },
    {
      title: 'The Conjuring Returns',
      description: 'The most terrifying horror sequel of the decade.',
      posterUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/anh/Welcome.png',
      trailerUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/video/6956365212701.mp4',
      trailerYoutubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      releaseDate: new Date('2024-10-25'),
      durationMinutes: 112,
      rating: 8.5,
      trending: true,
      mostPopular: false,
      genres: [horror?._id],
      languages: [english?._id],
      actors: [
        { actor: actorTwo?._id, roleType: 'main', characterName: 'Paranormal Investigator' },
        { actor: directorX?._id, roleType: 'director' },
      ],
    },
    {
      title: 'Romantic Getaway',
      description: 'A beautiful love story set in the French countryside.',
      posterUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/anh/Welcome.png',
      trailerUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/video/6956365212701.mp4',
      trailerYoutubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      releaseDate: new Date('2024-05-20'),
      durationMinutes: 108,
      rating: 7.7,
      trending: false,
      mostPopular: false,
      genres: [romance?._id, drama?._id],
      languages: [english?._id],
      actors: [
        { actor: actorOne?._id, roleType: 'main', characterName: 'Tourist' },
        { actor: actorTwo?._id, roleType: 'main', characterName: 'Local Guide' },
      ],
    },
    {
      title: 'Comedy Gold',
      description: 'The ultimate comedy experience with award-winning humor.',
      posterUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/anh/Welcome.png',
      trailerUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/video/6956365212701.mp4',
      trailerYoutubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      releaseDate: new Date('2024-11-15'),
      durationMinutes: 95,
      rating: 8.8,
      trending: true,
      mostPopular: true,
      genres: [comedy?._id],
      languages: [english?._id],
      actors: [
        { actor: actorTwo?._id, roleType: 'main', characterName: 'Stand-up Comedian' },
        { actor: directorX?._id, roleType: 'director' },
      ],
    },
    {
      title: 'Dramatic Moments',
      description: 'A powerful drama about family, loss, and redemption.',
      posterUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/anh/Welcome.png',
      trailerUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/video/6956365212701.mp4',
      trailerYoutubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      releaseDate: new Date('2024-01-28'),
      durationMinutes: 128,
      rating: 8.9,
      trending: false,
      mostPopular: true,
      genres: [drama?._id],
      languages: [english?._id],
      actors: [
        { actor: actorOne?._id, roleType: 'main', characterName: 'Father' },
        { actor: actorTwo?._id, roleType: 'supporting', characterName: 'Son' },
      ],
    },
    {
      title: 'Chiến Tranh Việt Nam',
      description: 'Bộ phim chiến tranh lịch sử về cuộc kháng chiến chống Mỹ.',
      posterUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/anh/Welcome.png',
      trailerUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/video/6956365212701.mp4',
      trailerYoutubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      releaseDate: new Date('2024-04-30'),
      durationMinutes: 140,
      rating: 8.7,
      trending: true,
      mostPopular: true,
      genres: [action?._id, drama?._id],
      languages: [vietnamese?._id],
      actors: [
        { actor: actorOne?._id, roleType: 'main', characterName: 'Chiến sĩ' },
        { actor: directorX?._id, roleType: 'director' },
      ],
    },
    {
      title: 'Cyber Future',
      description: 'A cyberpunk thriller set in a digital world.',
      posterUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/anh/Welcome.png',
      trailerUrl: 'https://fmsuiqlwskrsvtuucnoi.supabase.co/storage/v1/object/public/video/6956365212701.mp4',
      trailerYoutubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      releaseDate: new Date('2024-12-01'),
      durationMinutes: 135,
      rating: 8.4,
      trending: true,
      mostPopular: false,
      genres: [scifi?._id, action?._id],
      languages: [english?._id],
      actors: [
        { actor: actorOne?._id, roleType: 'main', characterName: 'Hacker' },
        { actor: actorTwo?._id, roleType: 'supporting', characterName: 'AI Assistant' },
      ],
    },
  ]

  // Insert all new movies
  for (const movieData of newMovies) {
    await upsertOne(MovieModel as any, { title: movieData.title }, movieData)
  }

  const movie = await MovieModel.findOne({ title: 'Sample Action Movie' }).lean()

  // Create multiple showtimes across rooms, dates, and times for discovery API
  if (movie?._id) {
    const startOfDay = (date: Date) => {
      const d = new Date(date)
      d.setUTCHours(0, 0, 0, 0)
      return d
    }
    const today = startOfDay(new Date())
    const dayOffsets = [0, 1, 2] // today, +1, +2 days
    const timeSlots = [
      { h: 10, m: 0 },
      { h: 14, m: 0 },
      { h: 19, m: 0 },
    ]

    const targetRooms = [room1?._id, room2?._id, hallA?._id].filter(Boolean)

    for (const roomId of targetRooms as any[]) {
      for (const offset of dayOffsets) {
        for (const t of timeSlots) {
          const start = new Date(today)
          start.setUTCDate(start.getUTCDate() + offset)
          start.setUTCHours(t.h, t.m, 0, 0)
          const end = new Date(start.getTime() + 120 * 60000)

          await upsertOne(
            ShowtimeModel as any,
            { movieId: movie?._id, roomId, startTime: start },
            {
              movieId: movie?._id,
              roomId,
              startTime: start,
              endTime: end,
              price: roomId?.toString() === (room1 as any)?._id?.toString() ? 90000 : 110000,
            },
          )
        }
      }
    }
  }

  // Promotion
  await upsertOne(
    PromotionModel as any,
    { code: 'WELCOME10' },
    {
      code: 'WELCOME10',
      description: '10% off for first booking',
      discountPercent: 10,
      isActive: true,
    },
  )

  // Sync indexes for safety after seed
  const modelNames = mongoose.modelNames()
  for (const name of modelNames) {
    try {
      await mongoose.model(name).syncIndexes()
    } catch {
      /* ignore */
    }
  }

  // eslint-disable-next-line no-console
  console.log('Seed completed')
  await mongoose.disconnect()
}

seed().catch(err => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err)
  process.exit(1)
})
