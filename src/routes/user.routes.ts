import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';

const router = Router();
const userController = new UserController();

// Protected routes (require authentication)
router.get('/', authMiddleware, adminMiddleware, userController.getAllUsers.bind(userController));
router.get('/:id', authMiddleware, userController.getUserById.bind(userController));
router.put('/:id', authMiddleware, userController.updateUser.bind(userController));
router.delete('/:id', authMiddleware, adminMiddleware, userController.deleteUser.bind(userController));

export { router as userRoutes };
