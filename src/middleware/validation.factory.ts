import { Request, Response, NextFunction } from 'express';
import { SchemaValidator, ValidationBuilder } from '../utils/validation.util.js';
import { sendBadRequest } from '../utils/response.util.js';

/**
 * Validation Factory - Tạo middleware từ validation schema
 */
export class ValidationFactory {
  /**
   * Tạo middleware validation từ schema
   */
  static createSchemaMiddleware(schema: SchemaValidator) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const errors = schema.validate(req.body);
      
      if (Object.keys(errors).length > 0) {
        const errorMessage = Object.entries(errors)
          .map(([field, error]) => `${field}: ${error}`)
          .join(', ');
        
        return sendBadRequest(res, 'Validation failed', errorMessage);
      }
      
      next();
    };
  }

  /**
   * Tạo middleware validation từ field validators
   */
  static createFieldMiddleware(validators: Record<string, ValidationBuilder>) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const errors: Record<string, string> = {};
      
      for (const [fieldName, validator] of Object.entries(validators)) {
        const error = validator.validate(req.body[fieldName]);
        if (error) {
          errors[fieldName] = error;
        }
      }
      
      if (Object.keys(errors).length > 0) {
        const errorMessage = Object.entries(errors)
          .map(([field, error]) => `${field}: ${error}`)
          .join(', ');
        
        return sendBadRequest(res, 'Validation failed', errorMessage);
      }
      
      next();
    };
  }

  /**
   * Tạo middleware validation cho query parameters
   */
  static createQueryMiddleware(validators: Record<string, ValidationBuilder>) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const errors: Record<string, string> = {};
      
      for (const [fieldName, validator] of Object.entries(validators)) {
        const error = validator.validate(req.query[fieldName]);
        if (error) {
          errors[fieldName] = error;
        }
      }
      
      if (Object.keys(errors).length > 0) {
        const errorMessage = Object.entries(errors)
          .map(([field, error]) => `${field}: ${error}`)
          .join(', ');
        
        return sendBadRequest(res, 'Validation failed', errorMessage);
      }
      
      next();
    };
  }

  /**
   * Tạo middleware validation cho params
   */
  static createParamsMiddleware(validators: Record<string, ValidationBuilder>) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const errors: Record<string, string> = {};
      
      for (const [fieldName, validator] of Object.entries(validators)) {
        const error = validator.validate(req.params[fieldName]);
        if (error) {
          errors[fieldName] = error;
        }
      }
      
      if (Object.keys(errors).length > 0) {
        const errorMessage = Object.entries(errors)
          .map(([field, error]) => `${field}: ${error}`)
          .join(', ');
        
        return sendBadRequest(res, 'Validation failed', errorMessage);
      }
      
      next();
    };
  }
}

/**
 * Quick validation middleware creators
 */
export const createValidation = {
  /**
   * Body validation
   */
  body: (validators: Record<string, ValidationBuilder>) => 
    ValidationFactory.createFieldMiddleware(validators),
  
  /**
   * Query validation  
   */
  query: (validators: Record<string, ValidationBuilder>) => 
    ValidationFactory.createQueryMiddleware(validators),
  
  /**
   * Params validation
   */
  params: (validators: Record<string, ValidationBuilder>) => 
    ValidationFactory.createParamsMiddleware(validators),
  
  /**
   * Schema validation
   */
  schema: (schema: SchemaValidator) => 
    ValidationFactory.createSchemaMiddleware(schema),
};
