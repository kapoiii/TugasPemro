import { NextRequest, NextResponse } from 'next/server'
import { getSchoolDb, saveSchoolDb, RaportData } from '@/lib/schoolStore'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const siswaId = searchParams.get('siswaId') || (session.role === 'SISWA' ? session.profileId : undefined)
    const db = getSchoolDb()

    // SISWA SPECIFIC CHECK:
    // User request: "melihat hasil raport hanya pada saat pembagian raport"
    if (session.role === 'SISWA') {
      const isDistributionOpen = db.settings.pembagianRaportDibuka
      const studentRaport = db.raports.find((r) => r.siswaId === (siswaId || session.profileId))

      // If distribution is not opened by school admin/wali kelas AND raport is not specifically published
      if (!isDistributionOpen && studentRaport?.status !== 'PUBLISHED') {
        return NextResponse.json({
          success: true,
          isPublished: false,
          pembagianRaportDibuka: false,
          tanggalPembagianRaport: db.settings.tanggalPembagianRaport,
          message: 'Hasil Raport Belum Dibagikan. Raport resmi digital hanya dapat diakses pada jadwal pembagian raport.',
          data: [],
        })
      }

      // If unlocked: return student's raport with nilais and details
      if (studentRaport) {
        const studentUser = db.users.find((u) => u.siswaProfile?.id === studentRaport.siswaId)
        const nilais = db.nilais
          .filter((n) => n.siswaId === studentRaport.siswaId)
          .map((n) => ({
            ...n,
            mapel: db.mapel.find((m) => m.id === n.mapelId),
          }))

        const enrichedRaport = {
          ...studentRaport,
          isPublished: true,
          siswa: studentUser?.siswaProfile ? {
            ...studentUser.siswaProfile,
            nilais,
          } : undefined,
          kelas: db.kelas.find((k) => k.id === studentRaport.kelasId),
        }

        return NextResponse.json({
          success: true,
          isPublished: true,
          pembagianRaportDibuka: true,
          data: [enrichedRaport],
        })
      }

      return NextResponse.json({
        success: true,
        isPublished: false,
        message: 'Data raport belum tersedia untuk akun ini.',
        data: [],
      })
    }

    // Role GURU or ADMIN: can view all
    let results = db.raports
    if (siswaId) results = results.filter((r) => r.siswaId === siswaId)

    const enrichedList = results.map((r) => {
      const studentUser = db.users.find((u) => u.siswaProfile?.id === r.siswaId)
      const nilais = db.nilais
        .filter((n) => n.siswaId === r.siswaId)
        .map((n) => ({
          ...n,
          mapel: db.mapel.find((m) => m.id === n.mapelId),
        }))

      return {
        ...r,
        siswa: studentUser?.siswaProfile ? {
          ...studentUser.siswaProfile,
          nilais,
        } : undefined,
        kelas: db.kelas.find((k) => k.id === r.kelasId),
      }
    })

    return NextResponse.json({
      success: true,
      pembagianRaportDibuka: db.settings.pembagianRaportDibuka,
      tanggalPembagianRaport: db.settings.tanggalPembagianRaport,
      data: enrichedList,
    })
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
    const { siswaId, kelasId, semester = '1 (Ganjil)', tahunAjaran = '2025/2026', catatanWaliKelas, status = 'PUBLISHED' } = body

    if (!siswaId) {
      return NextResponse.json({ success: false, message: 'ID Siswa wajib diisi' }, { status: 400 })
    }

    const db = getSchoolDb()

    // Calculate attendance totals
    let had = 0, izin = 0, sakit = 0, alfa = 0
    db.absensi.forEach((sesi) => {
      sesi.details.forEach((det) => {
        if (det.siswaId === siswaId) {
          if (det.status === 'HADIR') had++
          else if (det.status === 'IZIN') izin++
          else if (det.status === 'SAKIT') sakit++
          else if (det.status === 'ALFA') alfa++
        }
      })
    })

    // Calculate average grade
    const studentNilais = db.nilais.filter((n) => n.siswaId === siswaId)
    const totalNilai = studentNilais.reduce((sum, n) => sum + n.nilaiAkhir, 0)
    const rataRataNilai = studentNilais.length > 0 ? Number((totalNilai / studentNilais.length).toFixed(2)) : 0

    const existingIndex = db.raports.findIndex((r) => r.siswaId === siswaId)

    const raportItem: RaportData = {
      id: existingIndex !== -1 ? db.raports[existingIndex].id : `raport-${Date.now()}`,
      siswaId,
      kelasId: kelasId || 'kelas-10-mipa1',
      semester,
      tahunAjaran,
      totalHadir: had || 18,
      totalIzin: izin || 1,
      totalSakit: sakit || 1,
      totalAlfa: alfa || 0,
      rataRataNilai,
      catatanWaliKelas: catatanWaliKelas || 'Pertahankan prestasi belajar dan aktif dalam kegiatan sekolah.',
      status: status as 'DRAFT' | 'PUBLISHED',
      updatedAt: new Date().toISOString(),
    }

    if (existingIndex !== -1) {
      db.raports[existingIndex] = raportItem
    } else {
      db.raports.push(raportItem)
    }

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: session.userId,
      action: 'GENERATE_RAPORT',
      detail: `${session.role} memperbarui raport siswa ${siswaId}: Status ${status}`,
      createdAt: new Date().toISOString(),
    })

    saveSchoolDb(db)

    return NextResponse.json({
      success: true,
      message: 'Raport digital berhasil disimpan',
      data: raportItem,
    })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message: errMessage }, { status: 500 })
  }
}
