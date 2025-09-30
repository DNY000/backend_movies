import { Response } from 'express';
import { ApiResponse } from '../types/api.types.js';

export class ResponseHelper {
  static success<T>(res: Response, data: T, message: string = 'Success', statusCode: number = 200): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message
    };
    res.status(statusCode).json(response);
  }

  static error(res: Response, message: string, statusCode: number = 500, error?: string): void {
    const response: ApiResponse = {
      success: false,
      message,
      error
    };
    res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message: string = 'Created successfully'): void {
    this.success(res, data, message, 201);
  }

  static notFound(res: Response, message: string = 'Resource not found'): void {
    this.error(res, message, 404);
  }

  static badRequest(res: Response, message: string = 'Bad request', error?: string): void {
    this.error(res, message, 400, error);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): void {
    this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = 'Forbidden'): void {
    this.error(res, message, 403);
  }

  static internalError(res: Response, message: string = 'Internal server error', error?: string): void {
    this.error(res, message, 500, error);
  }
}
