import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, signToken } from '@/lib/auth'

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

    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: username }, { email: username }],
      },
      include: {
        siswaProfile: true,
        guruProfile: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Username/Email atau password salah' },
        { status: 401 }
      )
    }

    const isValidPassword = await comparePassword(password, user.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Username/Email atau password salah' },
        { status: 401 }
      )
    }

    let profileId: string | undefined
    let namaLengkap: string | undefined

    if (user.role === 'SISWA' && user.siswaProfile) {
      profileId = user.siswaProfile.id
      namaLengkap = user.siswaProfile.namaLengkap
    } else if (user.role === 'GURU' && user.guruProfile) {
      profileId = user.guruProfile.id
      namaLengkap = user.guruProfile.namaLengkap
    }

    // Sign JWT Token
    const token = await signToken({
      userId: user.id,
      username: user.username,
      role: user.role as 'ADMIN' | 'GURU' | 'SISWA',
      profileId,
      namaLengkap,
    })

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        detail: `User ${user.username} (${user.role}) berhasil login.`,
      },
    })

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      data: {
        userId: user.id,
        username: user.username,
        role: user.role,
        namaLengkap: namaLengkap || user.username,
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
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}
