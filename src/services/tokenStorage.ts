import { AuthUser } from './authService';

export interface StoredAuthData {
    user: AuthUser;
    token: string;
    refreshToken: string;
    expiresAt: number;
}

class SecureTokenStorage {
    private readonly AUTH_KEY = 'auth-data';
    private readonly TOKEN_KEY = 'auth-token';

    setAuthData(data: StoredAuthData): void {
        try {
            localStorage.setItem(this.AUTH_KEY, JSON.stringify(data));
            this.setSecureCookie(this.TOKEN_KEY, data.token, data.expiresAt);
        } catch (error) {
            console.error('Failed to store auth data:', error);
            throw new Error('Failed to store authentication data');
        }
    }

    getAuthData(): StoredAuthData | null {
        try {
            const stored = localStorage.getItem(this.AUTH_KEY);
            if (!stored) {
                return null;
            }

            const data: StoredAuthData = JSON.parse(stored);
            
            if (this.isTokenExpired(data.expiresAt)) {
                this.clearAuthData();
                return null;
            }

            return data;
        } catch (error) {
            console.error('Failed to retrieve auth data:', error);
            this.clearAuthData();
            return null;
        }
    }

    clearAuthData(): void {
        try {
            localStorage.removeItem(this.AUTH_KEY);
            this.clearSecureCookie(this.TOKEN_KEY);
        } catch (error) {
            console.error('Failed to clear auth data:', error);
        }
    }

    private isTokenExpired(expiresAt: number): boolean {
        const now = Date.now();
        const buffer = 5 * 60 * 1000;
        return now >= (expiresAt - buffer);
    }

    private setSecureCookie(name: string, value: string, expiresAt: number): void {
        const expires = new Date(expiresAt).toUTCString();
        const cookieOptions = [
            `${name}=${value}`,
            `expires=${expires}`,
            'path=/',
            'SameSite=Strict'
        ].join('; ');

        document.cookie = cookieOptions;
    }

    private clearSecureCookie(name: string): void {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict`;
    }

    shouldAutoLogout(): boolean {
        const data = this.getAuthData();
        return data === null;
    }
}

export const tokenStorage = new SecureTokenStorage();