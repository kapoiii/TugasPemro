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

  return NextResponse.json({
    success: true,
    data: {
      ...session,
      details: user,
    },
  })
}
