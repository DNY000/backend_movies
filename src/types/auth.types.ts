export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  username?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    username?: string;
    avatar?: string;
    role: string;
  };
  token: string;
}

export interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}
