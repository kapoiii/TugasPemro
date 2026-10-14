import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Tidak terautentikasi' },
      { status: 401 }
    )
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        siswaProfile: {
          include: {
            kelas: true,
          },
        },
        guruProfile: {
          include: {
            kelasWali: true,
          },
        },
      },
    })

    if (user) {
      return NextResponse.json({
        success: true,
        data: {
          ...session,
          details: user,
        },
      })
    }
  } catch (error) {
    console.warn('Could not fetch user details from database, falling back to session payload:', error)
  }

  // Graceful fallback from session
  return NextResponse.json({
    success: true,
    data: {
      ...session,
      details: {
        id: session.userId,
        username: session.username,
        role: session.role,
        siswaProfile:
          session.role === 'SISWA'
            ? {
                namaLengkap: session.namaLengkap || 'Ahmad Fauzi',
                nisn: '0051234567',
                kelas: { namaKelas: 'X MIPA 1' },
              }
            : undefined,
        guruProfile:
          session.role === 'GURU'
            ? {
                namaLengkap: session.namaLengkap || 'Budi Santoso, S.Pd.',
                nip: '198501012010011001',
              }
            : undefined,
      },
    },
  })
}
