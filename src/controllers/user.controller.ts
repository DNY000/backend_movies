import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';
import { sendSuccess, sendError, sendNotFound, sendBadRequest } from '../utils/response.util.js';
import { HttpStatus } from '../types/common.types.js';
import { validate } from '../utils/validation.util.js';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // GET /api/users
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.getAllUsers();
      sendSuccess(res, users, 'Users retrieved successfully');
    } catch (error) {
      sendError(res, 'Error retrieving users', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // GET /api/users/:id
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      
      if (!user) {
        return sendNotFound(res, 'User not found');
      }

      sendSuccess(res, user, 'User retrieved successfully');
    } catch (error) {
      sendError(res, 'Error retrieving user', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // POST /api/users
  // Note: Basic validation handled by validateUserBasic middleware
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      // Advanced validation (business rules) can be done here
      const userData = req.body;
      
      // Example: Check for duplicate usernames if provided
      if (userData.username) {
        const existingUser = await this.userService.getUserByEmail(userData.email);
        if (existingUser) {
          return sendBadRequest(res, 'User with this email already exists');
        }
      }
      
      const newUser = await this.userService.createUser(userData);
      
      sendSuccess(res, newUser, 'User created successfully', HttpStatus.CREATED);
    } catch (error) {
      sendError(res, 'Error creating user', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // PUT /api/users/:id
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedUser = await this.userService.updateUser(id, updateData);
      
      if (!updatedUser) {
        return sendNotFound(res, 'User not found');
      }

      sendSuccess(res, updatedUser, 'User updated successfully');
    } catch (error) {
      sendError(res, 'Error updating user', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // DELETE /api/users/:id
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.userService.deleteUser(id);
      
      if (!deleted) {
        return sendNotFound(res, 'User not found');
      }

      sendSuccess(res, null, 'User deleted successfully');
    } catch (error) {
      sendError(res, 'Error deleting user', error instanceof Error ? error.message : 'Unknown error');
    }
  }
}
