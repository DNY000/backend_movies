import { User } from '../types/user.types.js';
import { UserRepository } from '../database/repositories/user.repository.js';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return await this.userRepository.create(userData);
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User | null> {
    return await this.userRepository.update(id, updateData);
  }

  async deleteUser(id: string): Promise<boolean> {
    return await this.userRepository.delete(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async updateUserProfile(id: string, profileData: Partial<User>): Promise<User | null> {
    return await this.userRepository.updateProfile(id, profileData);
  }

  async updateRefreshToken(userId: string, refreshToken: string, expiresAt: Date): Promise<void> {
    await this.userRepository.updateRefreshToken(userId, refreshToken, expiresAt);
  }

  async getUserByRefreshToken(refreshToken: string): Promise<User | null> {
    return await this.userRepository.findByRefreshToken(refreshToken);
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await this.userRepository.clearRefreshToken(userId);
  }
}
