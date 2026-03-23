import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'prasad-vip-secret-dev');

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip login pages — pass pathname header so layouts can detect login
  if (pathname === '/admin/login' || pathname === '/vip/login') {
    const response = NextResponse.next();
    response.headers.set('x-pathname', pathname);
    return response;
  }

  // Protect admin and vip routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/vip')) {
    const token = req.cookies.get('vip_token')?.value;
    if (!token) {
      const loginUrl = pathname.startsWith('/admin') ? '/admin/login' : '/vip/login';
      return NextResponse.redirect(new URL(loginUrl, req.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);

      // Admin routes require admin role
      if (pathname.startsWith('/admin') && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }

      // Pass user info + pathname via headers for server components
      const response = NextResponse.next();
      response.headers.set('x-user-id', String(payload.user_id));
      response.headers.set('x-user-role', String(payload.role));
      response.headers.set('x-pathname', pathname);
      return response;
    } catch {
      const loginUrl = pathname.startsWith('/admin') ? '/admin/login' : '/vip/login';
      const response = NextResponse.redirect(new URL(loginUrl, req.url));
      response.cookies.set('vip_token', '', { maxAge: 0, path: '/' });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/vip/:path*'],
};
