import { AuthUser, AuthResponse, AuthError } from './authService';

const mockUsers = [
    {
        id: '1',
        email: 'admin@test.com',
        password: 'password123',
        name: 'Admin User',
        role: 'admin',
    },
    {
        id: '2', 
        email: 'user@test.com',
        password: 'password123',
        name: 'Test User',
        role: 'user',
    },
];

export class MockAuthService {
    private static instance: MockAuthService;
    private validTokens: Set<string> = new Set();

    public static getInstance(): MockAuthService {
        if (!MockAuthService.instance) {
            MockAuthService.instance = new MockAuthService();
        }
        return MockAuthService.instance;
    }

    async login(email: string, password: string): Promise<AuthResponse> {
        await new Promise(resolve => setTimeout(resolve, 500));

        const user = mockUsers.find(u => u.email === email && u.password === password);
        
        if (!user) {
            throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS', 401);
        }

        const authUser: AuthUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        };

        const token = this.generateMockToken(authUser);
        const refreshToken = this.generateMockRefreshToken(authUser);
        
        this.validTokens.add(token);
        this.validTokens.add(refreshToken);

        return {
            user: authUser,
            token,
            refreshToken,
            expiresIn: 3600,
        };
    }

    private generateMockToken(user: AuthUser): string {
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
            sub: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600,
            type: 'access',
        }));
        const signature = btoa('mock-signature-' + Date.now());
        
        return `${header}.${payload}.${signature}`;
    }

    private generateMockRefreshToken(user: AuthUser): string {
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
            sub: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (7 * 24 * 3600),
            type: 'refresh',
        }));
        const signature = btoa('mock-refresh-signature-' + Date.now());
        
        return `${header}.${payload}.${signature}`;
    }
}

export const mockAuthService = MockAuthService.getInstance();