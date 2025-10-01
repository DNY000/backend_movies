import { Router } from 'express';
import { MovieController } from '../controllers/movie.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateMovieBasic } from '../middleware/validation.middleware.js';

const router = Router();
const movieController = new MovieController();

// Public routes
router.get('/', movieController.getAllMovies.bind(movieController));
router.get('/search', movieController.getAllMovies.bind(movieController)); // Will be updated for search
router.get('/:id', movieController.getMovieById.bind(movieController));

// Protected routes (require authentication)
router.post('/', authMiddleware, validateMovieBasic, movieController.createMovie.bind(movieController));
router.put('/:id', authMiddleware, validateMovieBasic, movieController.updateMovie.bind(movieController));
router.delete('/:id', authMiddleware, movieController.deleteMovie.bind(movieController));

export { router as movieRoutes };
