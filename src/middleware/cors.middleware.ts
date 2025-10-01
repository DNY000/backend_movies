import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../types/common.types.js';

export const corsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(HttpStatus.OK).end();
    return;
  }

  next();
};
