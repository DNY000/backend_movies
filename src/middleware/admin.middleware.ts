import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/user.types.js';
import { HttpStatus } from '../types/common.types.js';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const user = (req as any).user;

    if (!user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        status: HttpStatus.UNAUTHORIZED,
        message: 'Authentication required'
      });
      return;
    }

    if (user.role !== UserRole.ADMIN) {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        status: HttpStatus.FORBIDDEN,
        message: 'Admin access required'
      });
      return;
    }

    next();
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Authorization check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
