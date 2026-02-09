export enum UserRole {
  STUDENT = "student",
  COUNSELOR = "counselor",
  ADMIN = "admin",
}

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  emailVerified?: boolean;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
