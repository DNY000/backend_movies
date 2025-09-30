export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  username?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  username?: string;
  avatar?: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  username?: string;
  avatar?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  username?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
