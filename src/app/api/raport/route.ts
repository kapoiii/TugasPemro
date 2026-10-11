import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const siswaId = searchParams.get('siswaId') || (session.role === 'SISWA' ? session.profileId : undefined)

    const raports = await prisma.raport.findMany({
      where: siswaId ? { siswaId } : {},
      include: {
        siswa: {
          include: {
            nilais: {
              include: { mapel: true },
            },
          },
        },
        kelas: true,
      },
      orderBy: { generatedAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: raports })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message: errMessage }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'GURU' && session.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 })
    }

    const body = await request.json()
    const { siswaId, kelasId, semester = '1', tahunAjaran = '2025/2026', catatanWaliKelas } = body

    if (!siswaId || !kelasId) {
      return NextResponse.json({ success: false, message: 'ID Siswa dan Kelas wajib diisi' }, { status: 400 })
    }

    // Calculate attendance totals
    const absensis = await prisma.detailAbsensi.findMany({
      where: { siswaId },
    })

    const totalHadir = absensis.filter((a) => a.status === 'HADIR').length
    const totalIzin = absensis.filter((a) => a.status === 'IZIN').length
    const totalSakit = absensis.filter((a) => a.status === 'SAKIT').length
    const totalAlfa = absensis.filter((a) => a.status === 'ALFA').length

    // Calculate average grade
    const nilais = await prisma.nilai.findMany({
      where: { siswaId, semester, tahunAjaran },
    })

    const totalNilai = nilais.reduce((sum, n) => sum + n.nilaiAkhir, 0)
    const rataRataNilai = nilais.length > 0 ? Number((totalNilai / nilais.length).toFixed(2)) : 0

    const raport = await prisma.raport.upsert({
      where: {
        siswaId_semester_tahunAjaran: {
          siswaId,
          semester,
          tahunAjaran,
        },
      },
      update: {
        totalHadir,
        totalIzin,
        totalSakit,
        totalAlfa,
        rataRataNilai,
        catatanWaliKelas,
        status: 'PUBLISHED',
      },
      create: {
        siswaId,
        kelasId,
        semester,
        tahunAjaran,
        totalHadir,
        totalIzin,
        totalSakit,
        totalAlfa,
        rataRataNilai,
        catatanWaliKelas,
        status: 'PUBLISHED',
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'GENERATE_RAPORT',
        detail: `Membuat Raport Digital untuk Siswa ${siswaId}, Semester ${semester} ${tahunAjaran}`,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Raport Digital berhasil digenerate & dipublikasi',
      data: raport,
    })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message: errMessage }, { status: 500 })
  }
}
