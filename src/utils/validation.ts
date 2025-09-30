export class ValidationHelper {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPassword(password: string): boolean {
    // At least 6 characters, contains at least one letter and one number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
    return passwordRegex.test(password);
  }

  static isValidObjectId(id: string): boolean {
    // MongoDB ObjectId pattern
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
  }

  static isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  static sanitizeString(str: string): string {
    return str.trim().replace(/[<>]/g, '');
  }

  static isValidYear(year: number): boolean {
    const currentYear = new Date().getFullYear();
    return year >= 1900 && year <= currentYear + 5;
  }

  static isValidRating(rating: number): boolean {
    return rating >= 0 && rating <= 10;
  }

  static isValidDuration(duration: number): boolean {
    return duration > 0 && duration <= 600; // Max 10 hours
  }
}
