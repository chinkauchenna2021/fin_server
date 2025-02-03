import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../core/repositories/UserRepository';
import { UserRole } from '@prisma/client';

const userRepository = new UserRepository();
const saltRounds = 10;

export class UserController {
  /**
   * Get all users (Admin only)
   */
  static async getUsers(req: Request, res: Response) {
    try {
      const users = await userRepository.findAll();
      if (!users) return res.status(404).json({ error: 'No users found' });
      
      // Sanitize sensitive data
      const sanitizedUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: user.createdAt
      }));
      
      res.json(sanitizedUsers);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(req: Request, res: Response) {
    try {
      const user = await userRepository.findById(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });

      // Authorization check
      if (user.id !== req.userId && req.userRole !== UserRole.ADMIN) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      // Sanitize response
      const sanitizedUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: user.createdAt
      };

      res.json(sanitizedUser);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }

  /**
   * Update user details
   */
  static async updateUser(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      
      // Authorization check
      if (userId !== req.userId && req.userRole !== UserRole.ADMIN) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      const updateData: Partial<{
        firstName: string;
        lastName: string;
        phone: string;
        password: string;
        role: UserRole;
      }> = req.body;

      // Handle password update
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, saltRounds);
      }

      // Prevent role change for non-admins
      if (updateData.role && req.userRole !== UserRole.ADMIN) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      const updatedUser = await userRepository.update(userId, updateData);
      if (!updatedUser) return res.status(404).json({ error: 'User not found' });

      // Sanitize response
      const sanitizedUser = {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt
      };

      res.json(sanitizedUser);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(400).json({ error: 'Failed to update user' });
    }
  }

  /**
   * Delete user (Admin only)
   */
  static async deleteUser(req: Request, res: Response) {
    try {
      // Authorization check
      if (req.userRole !== UserRole.ADMIN) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      const success = await userRepository.delete(req.params.id);
      if (!success) return res.status(404).json({ error: 'User not found' });
      
      res.status(204).send();
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
}