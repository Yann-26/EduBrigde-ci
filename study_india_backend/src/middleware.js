import { NextResponse } from 'next/server';

const PUBLIC_GET_PATHS = [
    '/api/universities',
    '/api/debug',
    '/api/test',
    '/api/health',
    '/api/dashboard/stats',
    '/api/dashboard/reports',
];

const PUBLIC_POST_PATHS = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/me',              // ADD THIS - will be checked by token inside route
    '/api/applications',
    '/api/documents/upload',
    '/api/payments',
];

export async function middleware(request) {
    const { pathname } = request.nextUrl;
    const method = request.method;

    if (method === 'OPTIONS') {
        return new NextResponse(null, { status: 204 });
    }

    // For auth/me and applications - always pass through, route handles auth
    if (pathname.startsWith('/api/auth/me') ||
        pathname.startsWith('/api/applications') ||
        pathname.startsWith('/api/payments') ||
        pathname.startsWith('/api/users') ||
        pathname.startsWith('/api/notifications') ||
        pathname.startsWith('/api/documents')||
        pathname.startsWith('/api/visa')
    ) {

        // Check for token but don't block - let the route handle it
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (token) {
            try {
                const { verifyToken } = await import('@/lib/auth');
                const decoded = await verifyToken(token);
                if (decoded && !decoded.expired) {
                    const requestHeaders = new Headers(request.headers);
                    requestHeaders.set('x-user-id', decoded.id);
                    return NextResponse.next({ request: { headers: requestHeaders } });
                }
            } catch (e) {
                // Token invalid, pass through anyway
            }
        }
        return NextResponse.next();
    }

    // Allow public GET paths
    if (method === 'GET' && PUBLIC_GET_PATHS.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // Allow public POST paths
    if (method === 'POST' && PUBLIC_POST_PATHS.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    if (!pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};