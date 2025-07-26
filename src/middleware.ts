import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isValidToken(token: string): boolean {
    if (!token || token === 'mock-jwt-token-for-demo') {
        return false;
    }
    
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return false;
        }
        
        const payload = JSON.parse(atob(parts[1]));
        const now = Math.floor(Date.now() / 1000);
        
        return payload.exp && payload.exp > now;
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const authToken = request.cookies.get("auth-token")?.value;
    const isAuthenticated = authToken && isValidToken(authToken);

    const isLoginPage = pathname.startsWith("/auth/login");
    const isCanvasPage = pathname.startsWith("/canvas");
    const isRootPage = pathname === "/";

    if ((isCanvasPage || isRootPage) && !isAuthenticated) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (isLoginPage && isAuthenticated) {
        const redirectTo = request.nextUrl.searchParams.get("redirect");
        const targetUrl = redirectTo || "/";
        return NextResponse.redirect(new URL(targetUrl, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|public|api).*)", "/"],
};