import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../types/common.types.js';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  // Default error response
  let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  let message = 'Internal server error';
  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = HttpStatus.BAD_REQUEST;
    message = 'Validation error';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = HttpStatus.UNAUTHORIZED;
    message = 'Unauthorized';
  } else if (error.name === 'ForbiddenError') {
    statusCode = HttpStatus.FORBIDDEN;
    message = 'Forbidden';
  } else if (error.name === 'NotFoundError') {
    statusCode = HttpStatus.NOT_FOUND;
    message = 'Not found';
  }

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(HttpStatus.NOT_FOUND).json({
    success: false,
    status: HttpStatus.NOT_FOUND,
    message: `Route ${req.originalUrl} not found`
  });
};
