import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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
  }): Promise<{ user: User; token: string }> {
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

    // Generate JWT token
    const token = this.generateToken(newUser.id);

    return {
      user: newUser,
      token,
    };
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
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

    // Generate JWT token
    const token = this.generateToken(user.id);

    return {
      user,
      token,
    };
  }

  async getProfile(userId: string): Promise<User | null> {
    return await this.userService.getUserById(userId);
  }

  private generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      this.jwtSecret,
      { expiresIn: '24h' }
    );
  }

  verifyToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, this.jwtSecret) as { userId: string };
    } catch (error) {
      return null;
    }
  }
}
