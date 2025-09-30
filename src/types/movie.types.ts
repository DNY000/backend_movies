export interface Movie {
  id: string;
  title: string;
  description: string;
  genre: string[];
  director: string;
  cast: string[];
  year: number;
  duration?: number; // legacy field
  durationMinutes?: number; // in minutes (align with model)
  rating: number;
  posterUrl?: string;
  trailerUrl?: string;
  trailerYoutubeUrl?: string;
  releaseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMovieRequest {
  title: string;
  description: string;
  genre: string[];
  director: string;
  cast: string[];
  year: number;
  duration?: number;
  durationMinutes?: number;
  rating: number;
  posterUrl?: string;
  trailerUrl?: string;
  trailerYoutubeUrl?: string;
  releaseDate: Date;
}

export interface UpdateMovieRequest {
  title?: string;
  description?: string;
  genre?: string[];
  director?: string;
  cast?: string[];
  year?: number;
  duration?: number;
  durationMinutes?: number;
  rating?: number;
  posterUrl?: string;
  trailerUrl?: string;
  trailerYoutubeUrl?: string;
  releaseDate?: Date;
}

export interface MovieSearchFilters {
  genre?: string;
  year?: number;
  director?: string;
  cast?: string;
  minRating?: number;
  maxRating?: number;
}
