/**
 * Validation Builder - Hàm gọi lại nhiều lần để xây dựng validation rules
 */
export class ValidationBuilder {
  private rules: Array<(value: any) => string | null> = [];
  private fieldName: string = 'Field';

  /**
   * Set field name for error messages
   */
  field(name: string): ValidationBuilder {
    this.fieldName = name;
    return this;
  }

  /**
   * Required validation
   */
  required(): ValidationBuilder {
    this.rules.push((value: any) => {
      if (value === null || value === undefined || value === '') {
        return `${this.fieldName} is required`;
      }
      return null;
    });
    return this;
  }

  /**
   * String length validation
   */
  length(min?: number, max?: number): ValidationBuilder {
    this.rules.push((value: any) => {
      if (typeof value !== 'string') return null;
      
      if (min !== undefined && value.length < min) {
        return `${this.fieldName} must be at least ${min} characters`;
      }
      
      if (max !== undefined && value.length > max) {
        return `${this.fieldName} must not exceed ${max} characters`;
      }
      
      return null;
    });
    return this;
  }

  /**
   * Email validation
   */
  email(): ValidationBuilder {
    this.rules.push((value: any) => {
      if (typeof value !== 'string') return null;
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return `${this.fieldName} must be a valid email address`;
      }
      
      return null;
    });
    return this;
  }

  /**
   * Number range validation
   */
  range(min?: number, max?: number): ValidationBuilder {
    this.rules.push((value: any) => {
      const num = Number(value);
      if (isNaN(num)) return `${this.fieldName} must be a number`;
      
      if (min !== undefined && num < min) {
        return `${this.fieldName} must be at least ${min}`;
      }
      
      if (max !== undefined && num > max) {
        return `${this.fieldName} must not exceed ${max}`;
      }
      
      return null;
    });
    return this;
  }

  /**
   * Pattern validation
   */
  pattern(regex: RegExp, message?: string): ValidationBuilder {
    this.rules.push((value: any) => {
      if (typeof value !== 'string') return null;
      
      if (!regex.test(value)) {
        return message || `${this.fieldName} format is invalid`;
      }
      
      return null;
    });
    return this;
  }

  /**
   * Custom validation
   */
  custom(validator: (value: any) => string | null): ValidationBuilder {
    this.rules.push(validator);
    return this;
  }

  /**
   * Enum validation
   */
  oneOf(values: any[], message?: string): ValidationBuilder {
    this.rules.push((value: any) => {
      if (!values.includes(value)) {
        return message || `${this.fieldName} must be one of: ${values.join(', ')}`;
      }
      return null;
    });
    return this;
  }

  /**
   * Array validation
   */
  array(minLength?: number, maxLength?: number): ValidationBuilder {
    this.rules.push((value: any) => {
      if (!Array.isArray(value)) {
        return `${this.fieldName} must be an array`;
      }
      
      if (minLength !== undefined && value.length < minLength) {
        return `${this.fieldName} must have at least ${minLength} items`;
      }
      
      if (maxLength !== undefined && value.length > maxLength) {
        return `${this.fieldName} must have at most ${maxLength} items`;
      }
      
      return null;
    });
    return this;
  }

  /**
   * Validate value against all rules
   */
  validate(value: any): string | null {
    for (const rule of this.rules) {
      const error = rule(value);
      if (error) return error;
    }
    return null;
  }

  /**
   * Validate and throw error if invalid
   */
  validateOrThrow(value: any): void {
    const error = this.validate(value);
    if (error) {
      throw new Error(error);
    }
  }
}

/**
 * Schema validation for objects
 */
export class SchemaValidator {
  private schema: Record<string, ValidationBuilder> = {};

  /**
   * Add field validation
   */
  field(name: string, validation: ValidationBuilder): SchemaValidator {
    this.schema[name] = validation;
    return this;
  }

  /**
   * Validate object against schema
   */
  validate(obj: Record<string, any>): Record<string, string> {
    const errors: Record<string, string> = {};
    
    for (const [fieldName, validator] of Object.entries(this.schema)) {
      const error = validator.validate(obj[fieldName]);
      if (error) {
        errors[fieldName] = error;
      }
    }
    
    return errors;
  }

  /**
   * Validate and throw if any errors
   */
  validateOrThrow(obj: Record<string, any>): void {
    const errors = this.validate(obj);
    if (Object.keys(errors).length > 0) {
      const errorMessage = Object.entries(errors)
        .map(([field, error]) => `${field}: ${error}`)
        .join(', ');
      throw new Error(`Validation failed: ${errorMessage}`);
    }
  }

  /**
   * Check if object is valid
   */
  isValid(obj: Record<string, any>): boolean {
    const errors = this.validate(obj);
    return Object.keys(errors).length === 0;
  }
}

/**
 * Quick validation functions
 */
export const validate = {
  /**
   * Create field validation
   */
  field: (name: string) => new ValidationBuilder().field(name),
  
  /**
   * Create schema validation
   */
  schema: () => new SchemaValidator(),
  
  /**
   * Quick email validation
   */
  email: (value: string) => validate.field('Email').email().validate(value),
  
  /**
   * Quick required validation
   */
  required: (value: any, fieldName: string = 'Field') => 
    validate.field(fieldName).required().validate(value),
};
