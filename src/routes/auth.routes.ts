import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller.js'
import { validateLogin, validateRegister } from '../middleware/validation.middleware.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()
const authController = new AuthController()

// Public routes
router.post('/register', validateRegister, authController.register.bind(authController))
// User login (role: user only)
router.post('/login', validateLogin, authController.login.bind(authController))
// Admin login (role: admin only)
router.post('/admin/login', validateLogin, authController.loginAdmin.bind(authController))
router.post('/refresh', authController.refresh.bind(authController))

// Protected routes (require authentication)
router.post('/logout', authMiddleware, authController.logout.bind(authController))
router.get('/me', authMiddleware, authController.getProfile.bind(authController))

export { router as authRoutes }
