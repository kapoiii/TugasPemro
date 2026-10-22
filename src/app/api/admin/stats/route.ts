import { NextResponse } from 'next/server'
import { getSchoolDb } from '@/lib/schoolStore'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const db = getSchoolDb()

    const totalUsers = db.users.length
    const totalAdmin = db.users.filter((u) => u.role === 'ADMIN').length
    const totalGuru = db.users.filter((u) => u.role === 'GURU').length
    const totalSiswa = db.users.filter((u) => u.role === 'SISWA').length
    const totalKelas = db.kelas.length
    const totalMapel = db.mapel.length
    const totalSesiAbsensi = db.absensi.length
    const totalNilai = db.nilais.length

    const recentLogs = db.auditLogs.slice(0, 10).map((l) => {
      const user = db.users.find((u) => u.id === l.userId)
      return {
        ...l,
        user: user ? { username: user.username, role: user.role } : undefined,
      }
    })

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
          pending: 3,
          diterima: 12,
          ditolak: 1,
          total: 16,
        },
        recentLogs,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
