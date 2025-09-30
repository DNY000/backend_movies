import { Movie } from '../types/movie.types.js';
import { MovieRepository } from '../database/repositories/movie.repository.js';

export class MovieService {
  private movieRepository: MovieRepository;

  constructor() {
    this.movieRepository = new MovieRepository();
  }

  async getAllMovies(): Promise<Movie[]> {
    return await this.movieRepository.findAll();
  }

  async getMovieById(id: string): Promise<Movie | null> {
    return await this.movieRepository.findById(id);
  }

  async createMovie(movieData: Omit<Movie, 'id' | 'createdAt' | 'updatedAt'>): Promise<Movie> {
    return await this.movieRepository.create(movieData);
  }

  async updateMovie(id: string, updateData: Partial<Movie>): Promise<Movie | null> {
    return await this.movieRepository.update(id, updateData);
  }

  async deleteMovie(id: string): Promise<boolean> {
    return await this.movieRepository.delete(id);
  }

  async searchMovies(query: string): Promise<Movie[]> {
    return await this.movieRepository.search(query);
  }

  async getMoviesByGenre(genre: string): Promise<Movie[]> {
    return await this.movieRepository.findByGenre(genre);
  }

  async getMoviesByYear(year: number): Promise<Movie[]> {
    return await this.movieRepository.findByYear(year);
  }
}
