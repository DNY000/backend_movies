import { Response } from 'express';
import { HttpStatus, ResponseStatus, ApiResponse } from '../types/common.types.js';

/**
 * Base Response Builder - Hàm gọi lại nhiều lần để xây dựng response
 */
export class ResponseBuilder {
  private response: Partial<ApiResponse> = {};

  constructor() {
    this.response.timestamp = new Date();
  }

  /**
   * Set success status
   */
  success(message: string = 'Success'): ResponseBuilder {
    this.response.success = true;
    this.response.responseStatus = ResponseStatus.SUCCESS;
    this.response.message = message;
    return this;
  }

  /**
   * Set error status
   */
  error(message: string = 'Error occurred'): ResponseBuilder {
    this.response.success = false;
    this.response.responseStatus = ResponseStatus.ERROR;
    this.response.message = message;
    return this;
  }

  /**
   * Set warning status
   */
  warning(message: string = 'Warning'): ResponseBuilder {
    this.response.success = true;
    this.response.responseStatus = ResponseStatus.WARNING;
    this.response.message = message;
    return this;
  }

  /**
   * Set data
   */
  data<T>(data: T): ResponseBuilder {
    this.response.data = data;
    return this;
  }

  /**
   * Set error details
   */
  errorDetails(error: string): ResponseBuilder {
    this.response.error = error;
    return this;
  }

  /**
   * Set pagination
   */
  pagination(page: number, limit: number, total: number): ResponseBuilder {
    this.response.pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    };
    return this;
  }

  /**
   * Build and send response
   */
  send(res: Response, statusCode: HttpStatus = HttpStatus.OK): void {
    this.response.status = statusCode;
    res.status(statusCode).json(this.response);
  }

  /**
   * Get response object
   */
  build(): ApiResponse {
    return this.response as ApiResponse;
  }
}

/**
 * Quick response functions - Hàm tiện ích gọi nhanh
 */
export const sendSuccess = (
  res: Response, 
  data?: any, 
  message: string = 'Success',
  statusCode: HttpStatus = HttpStatus.OK
): void => {
  new ResponseBuilder()
    .success(message)
    .data(data)
    .send(res, statusCode);
};

export const sendError = (
  res: Response, 
  message: string = 'Error occurred',
  error?: string,
  statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR
): void => {
  new ResponseBuilder()
    .error(message)
    .errorDetails(error || message)
    .send(res, statusCode);
};

export const sendNotFound = (
  res: Response, 
  message: string = 'Resource not found'
): void => {
  sendError(res, message, undefined, HttpStatus.NOT_FOUND);
};

export const sendBadRequest = (
  res: Response, 
  message: string = 'Bad request',
  error?: string
): void => {
  sendError(res, message, error, HttpStatus.BAD_REQUEST);
};

export const sendUnauthorized = (
  res: Response, 
  message: string = 'Unauthorized'
): void => {
  sendError(res, message, undefined, HttpStatus.UNAUTHORIZED);
};

export const sendForbidden = (
  res: Response, 
  message: string = 'Forbidden'
): void => {
  sendError(res, message, undefined, HttpStatus.FORBIDDEN);
};

/**
 * Paginated response helper
 */
export const sendPaginatedSuccess = (
  res: Response,
  data: any[],
  page: number,
  limit: number,
  total: number,
  message: string = 'Data retrieved successfully'
): void => {
  new ResponseBuilder()
    .success(message)
    .data(data)
    .pagination(page, limit, total)
    .send(res, HttpStatus.OK);
};
