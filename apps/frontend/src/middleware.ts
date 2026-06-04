import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 前端路由守卫
 *
 * 在 Edge Runtime 中运行，检查 cookie 中的 accessToken。
 * - 受保护路由（dashboard）未登录时重定向到 /login
 * - 已登录用户访问 auth 页面时重定向到首页
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  // 受保护的 Dashboard 路径
  const protectedPaths = ['/api-keys', '/usage', '/settings', '/recharge', '/orders'];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 已登录用户访问 auth 页面时重定向
  const authPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isAuthPage = authPaths.some((p) => pathname.startsWith(p));

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api-keys/:path*',
    '/usage/:path*',
    '/settings/:path*',
    '/recharge/:path*',
    '/orders/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
};
