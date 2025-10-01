import { Movie } from '../../types/movie.types.js';
import { MovieModel } from '../models/movie.model.js'
import { GenreModel } from '../models/genre.model.js'
import { MovieFilters, MovieSearchResult } from '../../services/movie.service.js'

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

  async findWithFilters(filters: MovieFilters): Promise<MovieSearchResult> {
    const query: any = {}
    
    // Search filter
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i')
      query.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ]
    }

    // Genre filter
    if (filters.genre) {
      const genre = await GenreModel.findOne({ name: new RegExp(`^${filters.genre}$`, 'i') }).lean()
      if (genre) {
        query.genres = genre._id
      }
    }

    // Year filter
    if (filters.year) {
      query.releaseDate = { 
        $gte: new Date(`${filters.year}-01-01T00:00:00Z`), 
        $lte: new Date(`${filters.year}-12-31T23:59:59Z`) 
      }
    }

    // Rating filter
    if (filters.rating) {
      query.rating = { $gte: filters.rating }
    }

    // Trending filter
    if (filters.trending) {
      query.trending = true
    }

    // Most popular filter
    if (filters.mostPopular) {
      query.mostPopular = true
    }

    // Calculate pagination
    const skip = (filters.page - 1) * filters.limit
    
    // Build sort object
    const sort: any = {}
    sort[filters.sortBy] = filters.sortOrder === 'asc' ? 1 : -1

    // Execute query with pagination
    const [movies, total] = await Promise.all([
      MovieModel.find(query)
        .populate('genres')
        .populate('languages')
        .sort(sort)
        .skip(skip)
        .limit(filters.limit)
        .lean(),
      MovieModel.countDocuments(query)
    ])

    const totalPages = Math.ceil(total / filters.limit)

    return {
      movies: movies as any[],
      total,
      page: filters.page,
      totalPages,
      hasNext: filters.page < totalPages,
      hasPrev: filters.page > 1
    }
  }

  async findTrending(limit: number): Promise<any[]> {
    const movies = await MovieModel.find({ trending: true })
      .populate('genres')
      .sort({ rating: -1, releaseDate: -1 })
      .limit(limit)
      .lean()
    return movies as any[]
  }

  async findMostPopular(limit: number): Promise<any[]> {
    const movies = await MovieModel.find({ mostPopular: true })
      .populate('genres')
      .sort({ rating: -1, releaseDate: -1 })
      .limit(limit)
      .lean()
    return movies as any[]
  }

  async findUpcoming(limit: number): Promise<any[]> {
    const now = new Date()
    const movies = await MovieModel.find({ 
      releaseDate: { $gt: now }
    })
      .populate('genres')
      .sort({ releaseDate: 1 })
      .limit(limit)
      .lean()
    return movies as any[]
  }

  async findNowShowing(limit: number): Promise<any[]> {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
    
    const movies = await MovieModel.find({ 
      releaseDate: { 
        $gte: thirtyDaysAgo,
        $lte: now
      }
    })
      .populate('genres')
      .sort({ releaseDate: -1 })
      .limit(limit)
      .lean()
    return movies as any[]
  }
}
