import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sekolah-secret-jwt-key-2026-production-min32chars'
)

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /dashboard and internal API endpoints
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/api/protected') ||
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/api/raport') ||
    pathname.startsWith('/api/nilai') ||
    pathname.startsWith('/api/absensi') ||
    pathname.startsWith('/api/pr') ||
    pathname.startsWith('/api/materi') ||
    pathname.startsWith('/api/jadwal') ||
    pathname.startsWith('/api/siswa') ||
    pathname.startsWith('/api/guru')
  ) {
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized: Sesi tidak ditemukan. Silakan login kembali.' },
          { status: 401 }
        )
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      const role = String(payload.role || '').toUpperCase()

      // Strict RBAC: Admin Portal
      if (pathname.startsWith('/dashboard/admin')) {
        if (role !== 'ADMIN') {
          if (role === 'GURU') {
            return NextResponse.redirect(new URL('/dashboard/guru', request.url))
          }
          return NextResponse.redirect(new URL('/dashboard/siswa', request.url))
        }
      }

      // Strict RBAC: Admin API endpoints
      if (pathname.startsWith('/api/admin')) {
        const isMasterRead =
          (pathname === '/api/admin/master' || pathname === '/api/admin/siswa-dashboard') &&
          request.method === 'GET'
        if (!isMasterRead && role !== 'ADMIN') {
          return NextResponse.json(
            { success: false, message: 'Akses ditolak: Memerlukan role Administrator' },
            { status: 403 }
          )
        }
      }

      // Strict RBAC: Guru Portal (Only GURU or ADMIN)
      if (pathname.startsWith('/dashboard/guru')) {
        if (role !== 'GURU' && role !== 'ADMIN') {
          return NextResponse.redirect(new URL('/dashboard/siswa', request.url))
        }
      }

      // Strict RBAC: Siswa Portal (Only SISWA or ADMIN)
      if (pathname.startsWith('/dashboard/siswa')) {
        if (role !== 'SISWA' && role !== 'ADMIN') {
          return NextResponse.redirect(new URL('/dashboard/guru', request.url))
        }
      }

      // Clone request headers to pass payload data down to route handlers
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', (payload.userId as string) || '')
      requestHeaders.set('x-user-role', role)
      if (payload.username) requestHeaders.set('x-user-username', payload.username as string)
      if (payload.profileId) requestHeaders.set('x-user-profile-id', payload.profileId as string)
      if (payload.namaLengkap) requestHeaders.set('x-user-name', payload.namaLengkap as string)
      if ((payload as any).nisn) requestHeaders.set('x-user-nisn', (payload as any).nisn as string)
      if ((payload as any).kelasId) requestHeaders.set('x-user-kelas-id', (payload as any).kelasId as string)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized: Sesi kedaluwarsa atau tidak valid' },
          { status: 401 }
        )
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/protected/:path*',
    '/api/admin/:path*',
    '/api/raport/:path*',
    '/api/raport',
    '/api/nilai/:path*',
    '/api/nilai',
    '/api/absensi/:path*',
    '/api/absensi',
    '/api/pr/:path*',
    '/api/pr',
    '/api/materi/:path*',
    '/api/materi',
    '/api/jadwal/:path*',
    '/api/jadwal',
    '/api/siswa/:path*',
    '/api/siswa',
    '/api/guru/:path*',
    '/api/guru',
  ],
}
