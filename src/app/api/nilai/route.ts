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
    const kelasId = searchParams.get('kelasId')
    const mapelId = searchParams.get('mapelId')
    const siswaId = searchParams.get('siswaId') || (session.role === 'SISWA' ? session.profileId : undefined)

    const nilais = await prisma.nilai.findMany({
      where: {
        ...(kelasId && { kelasId }),
        ...(mapelId && { mapelId }),
        ...(siswaId && { siswaId }),
      },
      include: {
        siswa: true,
        mapel: true,
        kelas: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: nilais })
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
    const {
      siswaId,
      mapelId,
      kelasId,
      semester = '1',
      tahunAjaran = '2025/2026',
      nilaiTugas = 0,
      nilaiUts = 0,
      nilaiUas = 0,
      nilaiPraktik = 0,
      nilaiSikap = 0,
      catatan,
    } = body

    if (!siswaId || !mapelId || !kelasId) {
      return NextResponse.json({ success: false, message: 'Data nilai tidak lengkap' }, { status: 400 })
    }

    // Auto-calculate final grade & predicate
    const t = Number(nilaiTugas)
    const uts = Number(nilaiUts)
    const uas = Number(nilaiUas)
    const prk = Number(nilaiPraktik)
    const skp = Number(nilaiSikap)

    const nilaiAkhir = Number((t * 0.2 + uts * 0.25 + uas * 0.3 + prk * 0.15 + skp * 0.1).toFixed(2))

    let predikat = 'D'
    if (nilaiAkhir >= 88) predikat = 'A'
    else if (nilaiAkhir >= 78) predikat = 'B'
    else if (nilaiAkhir >= 68) predikat = 'C'

    const upsertedNilai = await prisma.nilai.upsert({
      where: {
        siswaId_mapelId_semester_tahunAjaran: {
          siswaId,
          mapelId,
          semester,
          tahunAjaran,
        },
      },
      update: {
        nilaiTugas: t,
        nilaiUts: uts,
        nilaiUas: uas,
        nilaiPraktik: prk,
        nilaiSikap: skp,
        nilaiAkhir,
        predikat,
        catatan,
        guruId: session.profileId || session.userId,
      },
      create: {
        siswaId,
        mapelId,
        kelasId,
        guruId: session.profileId || session.userId,
        semester,
        tahunAjaran,
        nilaiTugas: t,
        nilaiUts: uts,
        nilaiUas: uas,
        nilaiPraktik: prk,
        nilaiSikap: skp,
        nilaiAkhir,
        predikat,
        catatan,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'INPUT_NILAI',
        detail: `Menginput nilai mapel ${mapelId} untuk siswa ${siswaId}, Nilai Akhir: ${nilaiAkhir} (${predikat})`,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Nilai siswa berhasil disimpan',
      data: upsertedNilai,
    })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message: errMessage }, { status: 500 })
  }
}
