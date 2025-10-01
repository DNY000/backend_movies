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
    role?: UserRole;
  }): Promise<{ user: User; accessToken: string; refreshToken: string }> {
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
      role: userData.role || UserRole.USER,
      isActive: true
    });

    console.log('Created user object:', newUser);
    console.log('User ID:', newUser.id);
    console.log('User _id:', (newUser as any)._id);

    // Generate tokens
    const userId = newUser.id || (newUser as any)._id?.toString();
    console.log('Using userId for token:', userId);
    const accessToken = this.generateAccessToken(userId);
    const refreshToken = await this.generateRefreshToken(userId);

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

    console.log('Login user object:', user);
    console.log('Login User ID:', user.id);
    console.log('Login User _id:', (user as any)._id);

    // Generate tokens
    const userId = user.id || (user as any)._id?.toString();
    console.log('Using userId for login token:', userId);
    const accessToken = this.generateAccessToken(userId);
    const refreshToken = await this.generateRefreshToken(userId);

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
    const payload = { userId, type: 'access' };
    console.log('Generating token with payload:', payload);
    const token = jwt.sign(
      payload,
      this.jwtSecret,
      { expiresIn: '15m' } // Short-lived access token - NOT stored in DB
    );
    console.log('Generated token:', token.substring(0, 50) + '...');
    return token;
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days - stored in DB

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
    const userId = user.id || (user as any)._id?.toString();
    const newAccessToken = this.generateAccessToken(userId);
    const newRefreshToken = await this.generateRefreshToken(userId);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  verifyToken(token: string): { userId: string } | null {
    try {
      console.log('Verifying token with secret:', this.jwtSecret.substring(0, 10) + '...');
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      console.log('Token decoded successfully:', decoded);
      
      // Check if userId exists in the decoded token
      if (!decoded.userId) {
        console.log('ERROR: userId not found in decoded token');
        return null;
      }
      
      return { userId: decoded.userId };
    } catch (error) {
      console.log('Token verification error:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  async logout(userId: string): Promise<void> {
    // Clear refresh token from database
    await this.userService.clearRefreshToken(userId);
  }
}
