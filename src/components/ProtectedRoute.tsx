"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "./AuthProvider";

interface ProtectedRouteProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuthContext();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            const currentPath = window.location.pathname;
            const redirectUrl = `/auth/login?redirect=${encodeURIComponent(
                currentPath
            )}`;
            router.push(redirectUrl);
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            fallback || (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-lg">Loading...</div>
                </div>
            )
        );
    }

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return null;
}