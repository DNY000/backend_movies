import { Movie } from '../../types/movie.types.js';
import { MovieModel } from '../models/movie.model.js'
import { GenreModel } from '../models/genre.model.js'

export class MovieRepository {
  async findAll(): Promise<any[]> {
    return await MovieModel.find({}).lean()
  }

  async findById(id: string): Promise<any | null> {
    return await MovieModel.findById(id).lean()
  }

  async create(movieData: Partial<Movie>): Promise<any> {
    const created = await MovieModel.create(movieData as any)
    return created.toObject()
  }

  async update(id: string, updateData: Partial<Movie>): Promise<any | null> {
    return await MovieModel.findByIdAndUpdate(id, updateData as any, { new: true }).lean()
  }

  async delete(id: string): Promise<boolean> {
    const res = await MovieModel.deleteOne({ _id: id })
    return (res as any).deletedCount > 0
  }

  async search(query: string): Promise<any[]> {
    const q = new RegExp(query, 'i')
    return await MovieModel.find({ $or: [{ title: q }, { description: q }] }).lean()
  }

  async findByGenre(genre: string): Promise<any[]> {
    const g = await GenreModel.findOne({ name: new RegExp(`^${genre}$`, 'i') }).lean()
    if (!g) return []
    return await MovieModel.find({ genres: g._id }).lean()
  }

  async findByYear(year: number): Promise<any[]> {
    return await MovieModel.find({
      releaseDate: { $gte: new Date(`${year}-01-01T00:00:00Z`), $lte: new Date(`${year}-12-31T23:59:59Z`) }
    }).lean()
  }
}
