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
    const siswaId = searchParams.get('siswaId') || session.profileId

    if (session.role === 'SISWA') {
      const details = await prisma.detailAbsensi.findMany({
        where: { siswaId },
        include: {
          sesi: {
            include: {
              kelas: true,
              mapel: true,
              guru: true,
            },
          },
        },
        orderBy: { sesi: { tanggal: 'desc' } },
      })

      const summary = {
        HADIR: details.filter((d) => d.status === 'HADIR').length,
        IZIN: details.filter((d) => d.status === 'IZIN').length,
        SAKIT: details.filter((d) => d.status === 'SAKIT').length,
        ALFA: details.filter((d) => d.status === 'ALFA').length,
      }

      return NextResponse.json({ success: true, data: { details, summary } })
    }

    // Role GURU or ADMIN
    const sesis = await prisma.sesiAbsensi.findMany({
      where: kelasId ? { kelasId } : {},
      include: {
        kelas: true,
        mapel: true,
        details: {
          include: { siswa: true },
        },
      },
      orderBy: { tanggal: 'desc' },
    })

    return NextResponse.json({ success: true, data: sesis })
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
    const { kelasId, mapelId, guruId, pertemuanKe, keterangan, records } = body

    if (!kelasId || !mapelId || !records || !Array.isArray(records)) {
      return NextResponse.json({ success: false, message: 'Data absensi tidak lengkap' }, { status: 400 })
    }

    const newSesi = await prisma.sesiAbsensi.create({
      data: {
        kelasId,
        mapelId,
        guruId: guruId || session.profileId || session.userId,
        pertemuanKe: Number(pertemuanKe) || 1,
        keterangan,
        details: {
          createMany: {
            data: records.map((r: { siswaId: string; status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA'; catatan?: string }) => ({
              siswaId: r.siswaId,
              status: r.status,
              catatan: r.catatan || '',
            })),
          },
        },
      },
      include: {
        details: true,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'INPUT_ABSENSI',
        detail: `Membuat sesi absensi pertemuan ke-${pertemuanKe} untuk kelas ${kelasId}`,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Sesi absensi berhasil disimpan',
      data: newSesi,
    })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message: errMessage }, { status: 500 })
  }
}
