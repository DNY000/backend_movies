/* eslint-disable no-console */
import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/auth.service.js'
import { UserService } from '../services/user.service.js'
import { HttpStatus } from '../types/common.types.js'

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        status: HttpStatus.UNAUTHORIZED,
        message: 'Access token is required',
      })
      return
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const authService = new AuthService()
    const decoded = authService.verifyToken(token)

    if (!decoded) {
      console.log('Token verification failed:', token.substring(0, 20) + '...')
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        status: HttpStatus.UNAUTHORIZED,
        message: 'Invalid or expired token',
      })
      return
    }

    console.log('Decoded token:', decoded)
    const userService = new UserService()
    const user = await userService.getUserById(decoded.userId)
    console.log(
      'Found user:',
      user
        ? {
            id: user.id || (user as any)._id,
            email: user.email,
            isActive: user.isActive,
            role: user.role,
          }
        : 'null',
    )

    if (!user || !user.isActive) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        status: HttpStatus.UNAUTHORIZED,
        message: 'User not found or inactive',
      })
      return
    }

    // Ensure user object has id field for consistency
    const userWithId = {
      ...user,
      id: user.id || (user as any)._id?.toString(),
    }

    // Add user to request object
    ;(req as any).user = userWithId
    next()
  } catch (error) {
    res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      status: HttpStatus.UNAUTHORIZED,
      message: 'Authentication failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
