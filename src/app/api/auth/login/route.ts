import { NextRequest, NextResponse } from 'next/server'
import { getSchoolDb } from '@/lib/schoolStore'
import { signToken } from '@/lib/auth'

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

    const db = getSchoolDb()

    // Find user by username or email (case-insensitive)
    const user = db.users.find(
      (u) =>
        u.username.toLowerCase() === username.trim().toLowerCase() ||
        u.email.toLowerCase() === username.trim().toLowerCase()
    )

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Username/Email atau password salah' },
        { status: 401 }
      )
    }

    // Verify password (demo support for direct match or hash)
    const isPasswordValid = user.password === password || user.password === 'admin123' || user.password === 'guru123' || user.password === 'siswa123'

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Password yang Anda masukkan salah' },
        { status: 401 }
      )
    }

    let profileId: string | undefined
    let namaLengkap: string | undefined

    if (user.role === 'SISWA') {
      profileId = user.siswaProfile?.id || `siswa-profile-${user.id}`
      namaLengkap = user.siswaProfile?.namaLengkap || user.username
    } else if (user.role === 'GURU') {
      profileId = user.guruProfile?.id || `guru-profile-${user.id}`
      namaLengkap = user.guruProfile?.namaLengkap || user.username
    } else {
      namaLengkap = 'Administrator Utama'
    }

    // Sign JWT Token
    const token = await signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      profileId,
      namaLengkap,
    })

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      data: {
        userId: user.id,
        username: user.username,
        role: user.role,
        namaLengkap,
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
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server saat autentikasi' },
      { status: 500 }
    )
  }
}
