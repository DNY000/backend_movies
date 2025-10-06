import { Request, Response } from 'express'
import { MovieService } from '../services/movie.service.js'
import { sendSuccess, sendError, sendNotFound, sendBadRequest } from '../utils/response.util.js'
import { HttpStatus } from '../types/common.types.js'

export class MovieController {
  private movieService: MovieService

  constructor() {
    this.movieService = new MovieService()
  }

  // GET /api/movies
  async getAllMovies(req: Request, res: Response): Promise<void> {
    try {
      const {
        search,
        genre,
        year,
        rating,
        trending,
        mostPopular,
        page = 1,
        limit = 20,
        sortBy = 'releaseDate',
        sortOrder = 'desc',
      } = req.query

      const filters = {
        search: search as string,
        genre: genre as string,
        year: year ? parseInt(year as string) : undefined,
        rating: rating ? parseFloat(rating as string) : undefined,
        trending: trending === 'true',
        mostPopular: mostPopular === 'true',
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      }

      const result = await this.movieService.getMoviesWithFilters(filters)
      sendSuccess(res, result, 'Movies retrieved successfully')
    } catch (error) {
      sendError(res, 'Error retrieving movies', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  // GET /api/movies/:id
  async getMovieById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const movie = await this.movieService.getMovieById(id)

      if (!movie) {
        return sendNotFound(res, 'Movie not found')
      }

      sendSuccess(res, movie, 'Movie retrieved successfully')
    } catch (error) {
      sendError(res, 'Error retrieving movie', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  // POST /api/movies
  // Note: Basic validation handled by validateMovieBasic middleware
  async createMovie(req: Request, res: Response): Promise<void> {
    try {
      // Advanced validation (business rules) for complex fields
      const movieData = req.body

      // Example: Complex validation for genres, actors, etc.
      if (movieData.genres && movieData.genres.length > 10) {
        return sendBadRequest(res, 'Movie cannot have more than 10 genres')
      }

      if (movieData.releaseDate && new Date(movieData.releaseDate) > new Date()) {
        // Allow future release dates, but validate they're reasonable
        const futureLimit = new Date()
        futureLimit.setFullYear(futureLimit.getFullYear() + 5)
        if (new Date(movieData.releaseDate) > futureLimit) {
          return sendBadRequest(res, 'Release date cannot be more than 5 years in the future')
        }
      }

      const newMovie = await this.movieService.createMovie(movieData)

      sendSuccess(res, newMovie, 'Movie created successfully', HttpStatus.CREATED)
    } catch (error) {
      sendError(res, 'Error creating movie', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  // PUT /api/movies/:id
  async updateMovie(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const updateData = req.body
      const updatedMovie = await this.movieService.updateMovie(id, updateData)

      if (!updatedMovie) {
        return sendNotFound(res, 'Movie not found')
      }

      sendSuccess(res, updatedMovie, 'Movie updated successfully')
    } catch (error) {
      sendError(res, 'Error updating movie', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  // DELETE /api/movies/:id
  async deleteMovie(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const deleted = await this.movieService.deleteMovie(id)

      if (!deleted) {
        return sendNotFound(res, 'Movie not found')
      }

      sendSuccess(res, null, 'Movie deleted successfully')
    } catch (error) {
      sendError(res, 'Error deleting movie', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  // GET /api/movies/trending
  async getTrendingMovies(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10 } = req.query
      const movies = await this.movieService.getTrendingMovies(parseInt(limit as string))
      sendSuccess(res, movies, 'Trending movies retrieved successfully')
    } catch (error) {
      sendError(res, 'Error retrieving trending movies', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  // GET /api/movies/popular
  async getMostPopularMovies(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10 } = req.query
      const movies = await this.movieService.getMostPopularMovies(parseInt(limit as string))
      sendSuccess(res, movies, 'Popular movies retrieved successfully')
    } catch (error) {
      sendError(res, 'Error retrieving popular movies', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  // GET /api/movies/upcoming
  async getUpcomingMovies(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10 } = req.query
      const movies = await this.movieService.getUpcomingMovies(parseInt(limit as string))
      sendSuccess(res, movies, 'Upcoming movies retrieved successfully')
    } catch (error) {
      sendError(res, 'Error retrieving upcoming movies', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  // GET /api/movies/now-showing
  async getNowShowingMovies(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10 } = req.query
      const movies = await this.movieService.getNowShowingMovies(parseInt(limit as string))
      sendSuccess(res, movies, 'Now showing movies retrieved successfully')
    } catch (error) {
      sendError(res, 'Error retrieving now showing movies', error instanceof Error ? error.message : 'Unknown error')
    }
  }
}
