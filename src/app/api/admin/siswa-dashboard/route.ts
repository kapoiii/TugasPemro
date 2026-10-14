import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Memerlukan role ADMIN' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const siswaId = searchParams.get('siswaId')

    // 1. If no siswaId is requested, return list of all Siswa for selector
    if (!siswaId) {
      const allSiswa = await prisma.siswaProfile.findMany({
        include: {
          user: { select: { username: true, email: true } },
          kelas: { select: { id: true, namaKelas: true, tingkat: true } },
        },
        orderBy: { namaLengkap: 'asc' },
      })

      return NextResponse.json({ success: true, data: allSiswa })
    }

    // 2. If specific siswaId is requested, return full dashboard data
    const siswa = await prisma.siswaProfile.findUnique({
      where: { id: siswaId },
      include: {
        user: { select: { id: true, username: true, email: true } },
        kelas: true,
      },
    })

    if (!siswa) {
      return NextResponse.json({ success: false, message: 'Siswa tidak ditemukan' }, { status: 404 })
    }

    // Get attendance details & summary
    const absensiDetails = await prisma.detailAbsensi.findMany({
      where: { siswaId },
      include: { sesi: { include: { mapel: true } } },
      orderBy: { sesi: { tanggal: 'desc' } },
    })

    // Get all grades for this student
    const nilais = await prisma.nilai.findMany({
      where: { siswaId },
      include: { mapel: true },
      orderBy: { createdAt: 'desc' },
    })

    // Get raport for this student
    const raport = await prisma.raport.findFirst({
      where: { siswaId },
      orderBy: { generatedAt: 'desc' },
    })

    // Get all subjects and classes for admin dropdown selectors
    const [allMapel, allKelas] = await Promise.all([
      prisma.mataPelajaran.findMany({ orderBy: { namaMapel: 'asc' } }),
      prisma.kelas.findMany({ orderBy: { namaKelas: 'asc' } }),
    ])

    // Calculate attendance summary
    const detailCount = {
      HADIR: absensiDetails.filter((d) => d.status === 'HADIR').length,
      IZIN: absensiDetails.filter((d) => d.status === 'IZIN').length,
      SAKIT: absensiDetails.filter((d) => d.status === 'SAKIT').length,
      ALFA: absensiDetails.filter((d) => d.status === 'ALFA').length,
    }

    const attendanceSummary = {
      HADIR: raport?.totalHadir !== undefined && raport?.totalHadir > 0 ? raport.totalHadir : detailCount.HADIR,
      IZIN: raport?.totalIzin !== undefined && raport?.totalIzin > 0 ? raport.totalIzin : detailCount.IZIN,
      SAKIT: raport?.totalSakit !== undefined && raport?.totalSakit > 0 ? raport.totalSakit : detailCount.SAKIT,
      ALFA: raport?.totalAlfa !== undefined && raport?.totalAlfa > 0 ? raport.totalAlfa : detailCount.ALFA,
    }

    return NextResponse.json({
      success: true,
      data: {
        siswa,
        attendanceSummary,
        nilais,
        raport,
        allMapel,
        allKelas,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Memerlukan role ADMIN' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      siswaId,
      // 1. Profile fields
      namaLengkap,
      nisn,
      nis,
      kelasId,
      alamat,
      noHp,
      // 2. Attendance fields (Direct Override by Admin)
      attendance,
      // 3. Grades array
      grades,
      // 4. Raport fields
      catatanWaliKelas,
      raportStatus = 'PUBLISHED',
      semester = '1',
      tahunAjaran = '2025/2026',
    } = body

    if (!siswaId) {
      return NextResponse.json({ success: false, message: 'ID Siswa wajib disertakan' }, { status: 400 })
    }

    const targetSiswa = await prisma.siswaProfile.findUnique({ where: { id: siswaId } })
    if (!targetSiswa) {
      return NextResponse.json({ success: false, message: 'Siswa tidak ditemukan' }, { status: 404 })
    }

    // 1. Update Siswa Profile
    await prisma.siswaProfile.update({
      where: { id: siswaId },
      data: {
        ...(namaLengkap && { namaLengkap }),
        ...(nisn && { nisn }),
        ...(nis && { nis }),
        ...(kelasId && { kelasId }),
        ...(alamat !== undefined && { alamat }),
        ...(noHp !== undefined && { noHp }),
      },
    })

    // 2. Update Grades if provided
    if (grades && Array.isArray(grades)) {
      for (const g of grades) {
        if (!g.mapelId) continue
        const t = Number(g.nilaiTugas || 0)
        const uts = Number(g.nilaiUts || 0)
        const uas = Number(g.nilaiUas || 0)
        const prk = Number(g.nilaiPraktik || 0)
        const skp = Number(g.nilaiSikap || 0)

        const finalScore = Number((t * 0.2 + uts * 0.25 + uas * 0.3 + prk * 0.15 + skp * 0.1).toFixed(2))
        let predikat = 'D'
        if (finalScore >= 88) predikat = 'A'
        else if (finalScore >= 78) predikat = 'B'
        else if (finalScore >= 68) predikat = 'C'

        await prisma.nilai.upsert({
          where: {
            siswaId_mapelId_semester_tahunAjaran: {
              siswaId,
              mapelId: g.mapelId,
              semester: g.semester || semester,
              tahunAjaran: g.tahunAjaran || tahunAjaran,
            },
          },
          update: {
            nilaiTugas: t,
            nilaiUts: uts,
            nilaiUas: uas,
            nilaiPraktik: prk,
            nilaiSikap: skp,
            nilaiAkhir: finalScore,
            predikat,
            catatan: g.catatan || '',
            guruId: session.userId,
          },
          create: {
            siswaId,
            mapelId: g.mapelId,
            kelasId: kelasId || targetSiswa.kelasId || '',
            guruId: session.userId,
            semester: g.semester || semester,
            tahunAjaran: g.tahunAjaran || tahunAjaran,
            nilaiTugas: t,
            nilaiUts: uts,
            nilaiUas: uas,
            nilaiPraktik: prk,
            nilaiSikap: skp,
            nilaiAkhir: finalScore,
            predikat,
            catatan: g.catatan || '',
          },
        })
      }
    }

    // 3. Calculate latest average grade
    const currentNilais = await prisma.nilai.findMany({
      where: { siswaId, semester, tahunAjaran },
    })
    const totalNilai = currentNilais.reduce((sum, n) => sum + n.nilaiAkhir, 0)
    const rataRataNilai = currentNilais.length > 0 ? Number((totalNilai / currentNilais.length).toFixed(2)) : 0

    // 4. Update or Upsert Raport & Attendance for Student
    const totalHadir = Number(attendance?.HADIR ?? 18)
    const totalIzin = Number(attendance?.IZIN ?? 0)
    const totalSakit = Number(attendance?.SAKIT ?? 0)
    const totalAlfa = Number(attendance?.ALFA ?? 0)

    const updatedRaport = await prisma.raport.upsert({
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
        ...(catatanWaliKelas !== undefined && { catatanWaliKelas }),
        status: raportStatus === 'DRAFT' ? 'DRAFT' : 'PUBLISHED',
      },
      create: {
        siswaId,
        kelasId: kelasId || targetSiswa.kelasId || '',
        semester,
        tahunAjaran,
        totalHadir,
        totalIzin,
        totalSakit,
        totalAlfa,
        rataRataNilai,
        catatanWaliKelas: catatanWaliKelas || 'Pertahankan prestasi dan tetap semangat belajar.',
        status: raportStatus === 'DRAFT' ? 'DRAFT' : 'PUBLISHED',
      },
    })

    // 5. Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'ADMIN_UPDATE_SISWA_DASHBOARD',
        detail: `Admin mengelola tampilan dashboard siswa: ${targetSiswa.namaLengkap} (Rata-rata: ${rataRataNilai}, Kehadiran: ${totalHadir}H/${totalIzin}I/${totalSakit}S/${totalAlfa}A)`,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Seluruh komponen dashboard siswa "${targetSiswa.namaLengkap}" berhasil diperbarui!`,
      data: {
        siswaId,
        rataRataNilai,
        raport: updatedRaport,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
