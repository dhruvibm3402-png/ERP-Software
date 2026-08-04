import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Paths that do not require authentication
    if (
        pathname.startsWith('/api/v1/auth/login') ||
        pathname.startsWith('/api/v1/auth/register') ||
        pathname.startsWith('/api/v1/auth/refresh') ||
        pathname === '/' ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/register') ||
        pathname.startsWith('/_next')
    ) {
        return NextResponse.next();
    }

    // API protection — require Bearer token
    if (pathname.startsWith('/api/v1/')) {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized, token missing' }, { status: 401 });
        }
    }

    // Add security headers
    const response = NextResponse.next();
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
