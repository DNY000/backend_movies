import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { UserService } from '../services/user.service.js';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const authService = new AuthService();
    const decoded = authService.verifyToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
      return;
    }

    const userService = new UserService();
    const user = await userService.getUserById(decoded.userId);

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
      return;
    }

    // Add user to request object
    (req as any).user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
