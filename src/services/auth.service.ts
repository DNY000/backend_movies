import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, UserRole } from '../types/user.types.js';
import { UserService } from './user.service.js';

export class AuthService {
  private userService: UserService;
  private jwtSecret: string;

  constructor() {
    this.userService = new UserService();
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    username?: string;
  }): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // Check if user already exists
    const existingUser = await this.userService.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const newUser = await this.userService.createUser({
      ...userData,
      password: hashedPassword,
      role: UserRole.USER,
      isActive: false
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(newUser.id);
    const refreshToken = await this.generateRefreshToken(newUser.id);

    return {
      user: newUser,
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // Find user by email
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async getProfile(userId: string): Promise<User | null> {
    return await this.userService.getUserById(userId);
  }

  private generateAccessToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'access' },
      this.jwtSecret,
      { expiresIn: '15m' } // Short-lived access token
    );
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Save refresh token to database
    await this.userService.updateRefreshToken(userId, refreshToken, expiresAt);
    
    return refreshToken;
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
    const user = await this.userService.getUserByRefreshToken(refreshToken);
    
    if (!user || !user.refreshTokenExpiresAt || user.refreshTokenExpiresAt < new Date()) {
      return null;
    }

    // Generate new tokens
    const newAccessToken = this.generateAccessToken(user.id);
    const newRefreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  verifyToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, this.jwtSecret) as { userId: string };
    } catch (error) {
      return null;
    }
  }

  async logout(userId: string): Promise<void> {
    // Clear refresh token from database
    await this.userService.clearRefreshToken(userId);
  }
}
