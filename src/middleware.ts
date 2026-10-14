import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sekolah-secret-jwt-key-2026-production-min32chars'
)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /dashboard and API endpoints
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/protected') || pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ success: false, message: 'Unauthorized: Token tidak ditemukan' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      const role = payload.role as string

      // Route RBAC Check
      // 1. Strict protection for Admin path
      if (pathname.startsWith('/dashboard/admin')) {
        if (role !== 'ADMIN') {
          // Non-admin trying to access admin dashboard
          if (role === 'GURU') {
            return NextResponse.redirect(new URL('/dashboard/guru', request.url))
          }
          return NextResponse.redirect(new URL('/dashboard/siswa', request.url))
        }
      }

      // 2. Strict protection for Admin API endpoints
      if (pathname.startsWith('/api/admin')) {
        if (role !== 'ADMIN') {
          return NextResponse.json({ success: false, message: 'Akses ditolak: Memerlukan role ADMIN' }, { status: 403 })
        }
      }

      // 3. Protection for Guru path
      if (pathname.startsWith('/dashboard/guru') && role !== 'GURU' && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/siswa', request.url))
      }

      // 4. Protection for Siswa path
      if (pathname.startsWith('/dashboard/siswa') && role !== 'SISWA' && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/guru', request.url))
      }

      // Clone request headers to pass payload data
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', payload.userId as string)
      requestHeaders.set('x-user-role', role)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ success: false, message: 'Unauthorized: Token invalid' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*', '/api/admin/:path*'],
}
