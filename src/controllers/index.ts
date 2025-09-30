/**
 * Controllers Index
 * 
 * This file exports all controllers for easy importing.
 * Controllers handle HTTP requests and responses.
 */

// Export all controllers (using simple versions to avoid dependency issues)
export * from './movie.controller.simple';
// export * from './user.controller';
// export * from './auth.controller';

// Re-export controller classes for direct instantiation
export { MovieController } from './movie.controller.simple';
// export { UserController } from './user.controller';
// export { AuthController } from './auth.controller';

// Controller factory function for dependency injection
export const createControllers = () => ({
  movieController: new MovieController(),
  // userController: new UserController(),
  // authController: new AuthController(),
});

// Controller registry for easy access
export const controllerRegistry = {
  movie: 'MovieController',
  // user: 'UserController', 
  // auth: 'AuthController',
} as const;

export type ControllerType = keyof typeof controllerRegistry;
