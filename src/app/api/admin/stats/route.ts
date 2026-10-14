import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Memerlukan role ADMIN' },
        { status: 403 }
      )
    }

    const [
      totalUsers,
      totalAdmin,
      totalGuru,
      totalSiswa,
      totalKelas,
      totalMapel,
      ppdbPending,
      ppdbDiterima,
      ppdbDitolak,
      totalSesiAbsensi,
      totalNilai,
      recentLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'GURU' } }),
      prisma.user.count({ where: { role: 'SISWA' } }),
      prisma.kelas.count(),
      prisma.mataPelajaran.count(),
      prisma.pPDB.count({ where: { status: 'PENDING' } }),
      prisma.pPDB.count({ where: { status: 'DITERIMA' } }),
      prisma.pPDB.count({ where: { status: 'DITOLAK' } }),
      prisma.sesiAbsensi.count(),
      prisma.nilai.count(),
      prisma.auditLog.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { username: true, role: true } } },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          admin: totalAdmin,
          guru: totalGuru,
          siswa: totalSiswa,
        },
        academic: {
          kelas: totalKelas,
          mapel: totalMapel,
          sesiAbsensi: totalSesiAbsensi,
          nilai: totalNilai,
        },
        ppdb: {
          pending: ppdbPending,
          diterima: ppdbDiterima,
          ditolak: ppdbDitolak,
          total: ppdbPending + ppdbDiterima + ppdbDitolak,
        },
        recentLogs,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
