import { Request, Response } from 'express';
import { MovieService } from '../services/movie.service.js';

export class MovieController {
  private movieService: MovieService;

  constructor() {
    this.movieService = new MovieService();
  }

  // GET /api/movies
  async getAllMovies(req: Request, res: Response): Promise<void> {
    try {
      const movies = await this.movieService.getAllMovies();
      res.status(200).json({
        success: true,
        data: movies,
        message: 'Movies retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving movies',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/movies/:id
  async getMovieById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const movie = await this.movieService.getMovieById(id);
      
      if (!movie) {
        res.status(404).json({
          success: false,
          message: 'Movie not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: movie,
        message: 'Movie retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving movie',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // POST /api/movies
  async createMovie(req: Request, res: Response): Promise<void> {
    try {
      const movieData = req.body;
      const newMovie = await this.movieService.createMovie(movieData);
      
      res.status(201).json({
        success: true,
        data: newMovie,
        message: 'Movie created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating movie',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // PUT /api/movies/:id
  async updateMovie(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedMovie = await this.movieService.updateMovie(id, updateData);
      
      if (!updatedMovie) {
        res.status(404).json({
          success: false,
          message: 'Movie not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedMovie,
        message: 'Movie updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating movie',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // DELETE /api/movies/:id
  async deleteMovie(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.movieService.deleteMovie(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Movie not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Movie deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting movie',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
