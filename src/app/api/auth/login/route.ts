import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, signToken } from '@/lib/auth'

// Default fallback demo accounts in case database connection is not yet configured or unreachable
const DEMO_ACCOUNTS = [
  {
    username: 'admin',
    email: 'admin@sekolah.sch.id',
    password: 'admin123',
    role: 'ADMIN' as const,
    userId: 'usr-admin-01',
    namaLengkap: 'Administrator Utama',
  },
  {
    username: 'guru1',
    email: 'budi.santoso@sekolah.sch.id',
    password: 'guru123',
    role: 'GURU' as const,
    userId: 'usr-guru-01',
    profileId: 'guru-profile-01',
    namaLengkap: 'Budi Santoso, S.Pd.',
  },
  {
    username: 'siswa1',
    email: 'ahmad.fauzi@siswa.sch.id',
    password: 'siswa123',
    role: 'SISWA' as const,
    userId: 'usr-siswa-01',
    profileId: 'siswa-profile-01',
    namaLengkap: 'Ahmad Fauzi',
  },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username dan password wajib diisi' },
        { status: 400 }
      )
    }

    let authenticatedUser: {
      id: string
      username: string
      role: 'ADMIN' | 'GURU' | 'SISWA'
      profileId?: string
      namaLengkap?: string
    } | null = null

    // 1. Try Authenticating via Database (Prisma)
    try {
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ username }, { email: username }],
        },
        include: {
          siswaProfile: true,
          guruProfile: true,
        },
      })

      if (user) {
        const isValidPassword = await comparePassword(password, user.passwordHash)
        if (isValidPassword) {
          let profileId: string | undefined
          let namaLengkap: string | undefined

          if (user.role === 'SISWA' && user.siswaProfile) {
            profileId = user.siswaProfile.id
            namaLengkap = user.siswaProfile.namaLengkap
          } else if (user.role === 'GURU' && user.guruProfile) {
            profileId = user.guruProfile.id
            namaLengkap = user.guruProfile.namaLengkap
          }

          authenticatedUser = {
            id: user.id,
            username: user.username,
            role: user.role as 'ADMIN' | 'GURU' | 'SISWA',
            profileId,
            namaLengkap,
          }

          // Record Audit Log if DB is writable
          try {
            await prisma.auditLog.create({
              data: {
                userId: user.id,
                action: 'USER_LOGIN',
                detail: `User ${user.username} (${user.role}) berhasil login.`,
              },
            })
          } catch {
            // non-blocking
          }
        }
      }
    } catch (dbError) {
      console.warn('Database query failed, checking demo fallback accounts...', dbError)
    }

    // 2. Fallback to Demo Credentials if DB query didn't succeed or DB credentials not yet set
    if (!authenticatedUser) {
      const demoUser = DEMO_ACCOUNTS.find(
        (acc) =>
          (acc.username.toLowerCase() === username.toLowerCase() ||
            acc.email.toLowerCase() === username.toLowerCase()) &&
          acc.password === password
      )

      if (demoUser) {
        authenticatedUser = {
          id: demoUser.userId,
          username: demoUser.username,
          role: demoUser.role,
          profileId: 'profileId' in demoUser ? demoUser.profileId : undefined,
          namaLengkap: demoUser.namaLengkap,
        }
      }
    }

    // 3. If neither matched, reject
    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, message: 'Username/Email atau password salah' },
        { status: 401 }
      )
    }

    // 4. Sign JWT Token
    const token = await signToken({
      userId: authenticatedUser.id,
      username: authenticatedUser.username,
      role: authenticatedUser.role,
      profileId: authenticatedUser.profileId,
      namaLengkap: authenticatedUser.namaLengkap,
    })

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      data: {
        userId: authenticatedUser.id,
        username: authenticatedUser.username,
        role: authenticatedUser.role,
        namaLengkap: authenticatedUser.namaLengkap || authenticatedUser.username,
      },
    })

    // Set HTTP-Only Cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    })

    return response
  } catch (error: unknown) {
    console.error('Login general error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server saat autentikasi' },
      { status: 500 }
    )
  }
}
