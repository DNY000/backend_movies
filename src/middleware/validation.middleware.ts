import { Request, Response, NextFunction } from 'express';

// Validation for movie data
export const validateMovie = (req: Request, res: Response, next: NextFunction): void => {
  const { title, description, genre, director, year, duration, rating } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    res.status(400).json({
      success: false,
      message: 'Title is required and must be a non-empty string'
    });
    return;
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    res.status(400).json({
      success: false,
      message: 'Description is required and must be a non-empty string'
    });
    return;
  }

  if (!genre || !Array.isArray(genre) || genre.length === 0) {
    res.status(400).json({
      success: false,
      message: 'Genre is required and must be a non-empty array'
    });
    return;
  }

  if (!director || typeof director !== 'string' || director.trim().length === 0) {
    res.status(400).json({
      success: false,
      message: 'Director is required and must be a non-empty string'
    });
    return;
  }

  if (!year || typeof year !== 'number' || year < 1900 || year > new Date().getFullYear() + 5) {
    res.status(400).json({
      success: false,
      message: 'Year is required and must be a valid year'
    });
    return;
  }

  if (!duration || typeof duration !== 'number' || duration <= 0) {
    res.status(400).json({
      success: false,
      message: 'Duration is required and must be a positive number'
    });
    return;
  }

  if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 10)) {
    res.status(400).json({
      success: false,
      message: 'Rating must be a number between 0 and 10'
    });
    return;
  }

  next();
};

// Validation for login data
export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({
      success: false,
      message: 'Valid email is required'
    });
    return;
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400).json({
      success: false,
      message: 'Password is required and must be at least 6 characters'
    });
    return;
  }

  next();
};

// Validation for registration data
export const validateRegister = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password, name } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({
      success: false,
      message: 'Valid email is required'
    });
    return;
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400).json({
      success: false,
      message: 'Password is required and must be at least 6 characters'
    });
    return;
  }

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({
      success: false,
      message: 'Name is required and must be a non-empty string'
    });
    return;
  }

  next();
};

// Validation for booking creation
export const validateCreateBooking = (req: Request, res: Response, next: NextFunction): void => {
  const { userId, showtimeId, seatIds, promotionCode } = req.body;
  if (!userId || typeof userId !== 'string') {
    res.status(400).json({ success: false, message: 'userId is required' });
    return;
  }
  if (!showtimeId || typeof showtimeId !== 'string') {
    res.status(400).json({ success: false, message: 'showtimeId is required' });
    return;
  }
  if (!Array.isArray(seatIds) || seatIds.length === 0 || !seatIds.every((s: any) => typeof s === 'string')) {
    res.status(400).json({ success: false, message: 'seatIds must be a non-empty string array' });
    return;
  }
  if (promotionCode && typeof promotionCode !== 'string') {
    res.status(400).json({ success: false, message: 'promotionCode must be a string' });
    return;
  }
  next();
};

// Validation for payment capture
export const validateCapturePayment = (req: Request, res: Response, next: NextFunction): void => {
  const { bookingId, userId, amount, method } = req.body;
  if (!bookingId || typeof bookingId !== 'string') {
    res.status(400).json({ success: false, message: 'bookingId is required' });
    return;
  }
  if (!userId || typeof userId !== 'string') {
    res.status(400).json({ success: false, message: 'userId is required' });
    return;
  }
  if (typeof amount !== 'number' || amount <= 0) {
    res.status(400).json({ success: false, message: 'amount must be a positive number' });
    return;
  }
  if (!method || typeof method !== 'string') {
    res.status(400).json({ success: false, message: 'method is required' });
    return;
  }
  next();
};