export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: UserDTO;
}

export interface UserDTO {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
}

export enum UserRole {
    ADMIN = "ROLE_ADMIN",
    USER = "ROLE_USER",
}