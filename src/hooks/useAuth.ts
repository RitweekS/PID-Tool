"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { tokenStorage } from "@/services/tokenStorage";
import { authService } from "@/services/authService";

interface AuthUser {
    id: string;
    email: string;
    name?: string;
    role?: string;
}

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export function useAuth() {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
    });

    const router = useRouter();

    const checkAuth = useCallback(() => {
        try {
            const authData = tokenStorage.getAuthData();
            if (authData) {
                setAuthState({
                    user: authData.user,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                setAuthState({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            }
        } catch (error) {
            console.error("Error checking auth:", error);
            setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    }, []);

    const login = useCallback((userData: AuthUser, token: string, refreshToken: string, expiresIn: number) => {
        try {
            const expiresAt = Date.now() + (expiresIn * 1000);
            const authData = {
                user: userData,
                token,
                refreshToken,
                expiresAt,
            };

            tokenStorage.setAuthData(authData);

            setAuthState({
                user: userData,
                isAuthenticated: true,
                isLoading: false,
            });

            return true;
        } catch (error) {
            console.error("Error during login:", error);
            return false;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            const authData = tokenStorage.getAuthData();
            
            tokenStorage.clearAuthData();

            setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });

            if (authData?.token) {
                await authService.logout(authData.token);
            }

            router.push("/auth/login");
        } catch (error) {
            console.error("Error during logout:", error);
        }
    }, [router]);

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (tokenStorage.shouldAutoLogout()) {
                logout();
            }
        }, 60000);

        return () => {
            clearInterval(interval);
        };
    }, [logout]);

    return {
        ...authState,
        login,
        logout,
        checkAuth,
    };
}