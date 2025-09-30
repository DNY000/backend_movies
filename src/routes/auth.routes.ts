import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateLogin, validateRegister } from '../middleware/validation.middleware.js';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', validateRegister, authController.register.bind(authController));
router.post('/login', validateLogin, authController.login.bind(authController));

// Protected routes (require authentication)
router.post('/logout', authController.logout.bind(authController));
router.get('/me', authController.getProfile.bind(authController));

export { router as authRoutes };
