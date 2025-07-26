import { mockAuthService } from './mockAuthService';

export interface AuthUser {
    id: string;
    email: string;
    name?: string;
    role?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: AuthUser;
    token: string;
    refreshToken: string;
    expiresIn: number;
}

export class AuthError extends Error {
    public code?: string;
    public statusCode?: number;

    constructor(message: string, code?: string, statusCode?: number) {
        super(message);
        this.name = 'AuthError';
        this.code = code;
        this.statusCode = statusCode;
    }
}

class AuthService {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            return await mockAuthService.login(credentials.email, credentials.password);
        } catch (error) {
            if (error instanceof AuthError) {
                throw error;
            }
            throw new AuthError('Network error occurred during login');
        }
    }

    async logout(token: string): Promise<void> {
        // Mock logout for development
    }
}

export const authService = new AuthService();