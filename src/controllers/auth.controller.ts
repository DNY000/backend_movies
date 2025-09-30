import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // POST /api/auth/register
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body;
      const result = await this.authService.register(userData);
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'User registered successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Registration failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // POST /api/auth/login
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Login successful'
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Login failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // POST /api/auth/logout
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Implementation for logout (invalidate token, etc.)
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/auth/me
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      // Get user profile from token
      const userId = (req as any).user?.id;
      const user = await this.authService.getProfile(userId);
      
      res.status(200).json({
        success: true,
        data: user,
        message: 'Profile retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
