import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    const isPublicPath = path === '/login' || path === '/signup' || path === '/verifyemail'
    const token = request.cookies.get('token')?.value || ''

    // Redirect logged-in users away from public paths
    if (isPublicPath && token) {
        return NextResponse.redirect(new URL('/dashboard', request.nextUrl))
    }

    // Protect all non-public paths (including dashboard)
    if (!isPublicPath && !token) {
        return NextResponse.redirect(new URL('/login', request.nextUrl))
    }
}

export const config = {
    matcher: [
        
        '/dashboard', 
        '/analytics', // Added this line
        '/profile',
        '/login',
        '/signup',
        '/verifyemail',
        '/skin',
        '/readqr',
    ]
}