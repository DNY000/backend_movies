import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { sendSuccess, sendError, sendBadRequest, sendUnauthorized } from '../utils/response.util.js';
import { HttpStatus } from '../types/common.types.js';
import { validate } from '../utils/validation.util.js';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // POST /api/auth/register
  // Note: Basic validation handled by validateRegister middleware
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Advanced validation (business rules) can be done here if needed
      // Basic validation (email, password, name) is handled by middleware
      
      const userData = req.body;
      const result = await this.authService.register(userData);
      
      // Set refresh token as HttpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
      
      // Send only access token and user data to client
      sendSuccess(res, {
        user: result.user,
        accessToken: result.accessToken
      }, 'User registered successfully', HttpStatus.CREATED);
    } catch (error) {
      sendError(res, 'Registration failed', error instanceof Error ? error.message : 'Unknown error', HttpStatus.BAD_REQUEST);
    }
  }

  // POST /api/auth/login
  // Note: Basic validation handled by validateLogin middleware
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Basic validation (email, password) is handled by middleware
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      
      // Set refresh token as HttpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
      
      // Send only access token and user data to client
      sendSuccess(res, {
        user: result.user,
        accessToken: result.accessToken
      }, 'Login successful');
    } catch (error) {
      sendUnauthorized(res, 'Login failed');
    }
  }

  // POST /api/auth/logout
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (userId) {
        await this.authService.logout(userId);
      }
      
      // Clear refresh token cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      sendSuccess(res, null, 'Logout successful');
    } catch (error) {
      sendError(res, 'Logout failed', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // POST /api/auth/refresh
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      // Get refresh token from HttpOnly cookie
      const refreshToken = req.cookies?.refreshToken;
      
      if (!refreshToken) {
        return sendUnauthorized(res, 'Refresh token not found');
      }

      const result = await this.authService.refreshAccessToken(refreshToken);
      
      if (!result) {
        // Clear invalid refresh token cookie
        res.clearCookie('refreshToken', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        return sendUnauthorized(res, 'Invalid or expired refresh token');
      }

      // Set new refresh token as HttpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      // Send only new access token to client
      sendSuccess(res, {
        accessToken: result.accessToken
      }, 'Access token refreshed successfully');
    } catch (error) {
      sendError(res, 'Token refresh failed', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // GET /api/auth/me
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      // Get user profile from token
      const userId = (req as any).user?.id;
      const user = await this.authService.getProfile(userId);
      
      sendSuccess(res, user, 'Profile retrieved successfully');
    } catch (error) {
      sendError(res, 'Error retrieving profile', error instanceof Error ? error.message : 'Unknown error');
    }
  }
}
