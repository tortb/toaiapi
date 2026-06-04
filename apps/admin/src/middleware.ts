import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Admin 路由守卫
 *
 * 在 Edge Runtime 中运行，检查 cookie 中的 accessToken。
 * - Admin 路由未登录时重定向到 /login
 * - 已登录管理员访问 /login 时重定向到 /
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin-accessToken')?.value;
  const { pathname } = request.nextUrl;

  // 已登录管理员访问登录页时重定向到仪表盘
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Admin 路由需要登录（/login 除外）
  if (pathname !== '/login' && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
