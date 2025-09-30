import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/user.types.js';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (user.role !== UserRole.ADMIN) {
      res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authorization check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
