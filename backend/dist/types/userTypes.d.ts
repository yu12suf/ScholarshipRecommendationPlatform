export declare enum UserRole {
    STUDENT = "student",
    COUNSELOR = "counselor",
    ADMIN = "admin"
}
export interface User {
    id: number;
    name: string;
    email: string;
    password?: string;
    googleId?: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateUserDto {
    name: string;
    email: string;
    password?: string;
    googleId?: string;
    role?: UserRole;
}
export interface UpdateUserDto {
    name?: string;
    email?: string;
    role?: UserRole;
    isActive?: boolean;
    googleId?: string;
}
export interface UserResponse {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=userTypes.d.ts.map