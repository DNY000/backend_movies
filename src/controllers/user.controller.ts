import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // GET /api/users
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.getAllUsers();
      res.status(200).json({
        success: true,
        data: users,
        message: 'Users retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving users',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/users/:id
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
        message: 'User retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // POST /api/users
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body;
      const newUser = await this.userService.createUser(userData);
      
      res.status(201).json({
        success: true,
        data: newUser,
        message: 'User created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // PUT /api/users/:id
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedUser = await this.userService.updateUser(id, updateData);
      
      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // DELETE /api/users/:id
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.userService.deleteUser(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
