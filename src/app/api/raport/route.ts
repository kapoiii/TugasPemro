import { NextRequest, NextResponse } from 'next/server'
import { getSchoolDb, saveSchoolDb, RaportData } from '@/lib/schoolStore'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    const { searchParams } = new URL(request.url)
    const siswaId = searchParams.get('siswaId') || (session?.role === 'SISWA' ? session.profileId : undefined)
    const kelasId = searchParams.get('kelasId')
    const db = getSchoolDb()

    // SISWA SPECIFIC CHECK:
    // User request: "karena tanpa izin guru raport siswa tidak bisa kebuka"
    if (session?.role === 'SISWA') {
      const targetSiswaId = session.profileId || siswaId
      const studentRaport = db.raports.find((r) => r.siswaId === targetSiswaId)

      // Tanpa izin guru (status !== 'PUBLISHED'), raport TIDAK BISA DIBUKA
      if (!studentRaport || studentRaport.status !== 'PUBLISHED') {
        return NextResponse.json({
          success: true,
          isPublished: false,
          pembagianRaportDibuka: false,
          tanggalPembagianRaport: db.settings.tanggalPembagianRaport,
          message: 'Raport Belum Diizinkan Dibuka oleh Guru / Wali Kelas. Akses masih terkunci hingga guru memberikan izin publikasi.',
          data: [],
        })
      }

      // If unlocked by teacher (status === 'PUBLISHED'): return student's raport with nilais and details
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
        siswa: studentUser?.siswaProfile
          ? {
              ...studentUser.siswaProfile,
              nilais,
            }
          : undefined,
        kelas: db.kelas.find((k) => k.id === studentRaport.kelasId),
      }

      return NextResponse.json({
        success: true,
        isPublished: true,
        pembagianRaportDibuka: true,
        data: [enrichedRaport],
      })
    }

    // Role GURU or ADMIN: can view all
    let results = db.raports
    if (kelasId) results = results.filter((r) => r.kelasId === kelasId)
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
        siswa: studentUser?.siswaProfile
          ? {
              ...studentUser.siswaProfile,
              nilais,
            }
          : undefined,
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
      return NextResponse.json({ success: false, message: 'Akses ditolak: Memerlukan role GURU atau ADMIN' }, { status: 403 })
    }

    const body = await request.json()
    const db = getSchoolDb()

    // 1. Bulk Update Permission for an Entire Class
    if (body.action === 'BULK_UPDATE_STATUS' && body.kelasId) {
      const { kelasId, status } = body
      const newStatus = status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'
      let updatedCount = 0

      // Find all students in this class
      const classStudents = db.users.filter((u) => u.siswaProfile?.kelasId === kelasId)
      classStudents.forEach((st) => {
        const sId = st.siswaProfile!.id
        const existingIdx = db.raports.findIndex((r) => r.siswaId === sId)
        if (existingIdx !== -1) {
          db.raports[existingIdx].status = newStatus
          db.raports[existingIdx].updatedAt = new Date().toISOString()
        } else {
          db.raports.push({
            id: `raport-${sId}`,
            siswaId: sId,
            kelasId,
            semester: '1 (Ganjil)',
            tahunAjaran: '2025/2026',
            totalHadir: 24,
            totalIzin: 1,
            totalSakit: 0,
            totalAlfa: 0,
            rataRataNilai: 84.5,
            catatanWaliKelas: 'Pertahankan prestasi belajar dan tingkatkan keaktifan.',
            status: newStatus,
            updatedAt: new Date().toISOString(),
          })
        }
        updatedCount++
      })

      db.auditLogs.unshift({
        id: `log-${Date.now()}`,
        userId: session.userId,
        action: 'BULK_RAPORT_STATUS',
        detail: `${session.role} mengubah status izin raport seluruh kelas ${kelasId} menjadi: ${newStatus} (${updatedCount} siswa)`,
        createdAt: new Date().toISOString(),
      })

      saveSchoolDb(db)
      return NextResponse.json({
        success: true,
        message: `Berhasil mengubah izin raport ${updatedCount} siswa kelas ini menjadi ${newStatus === 'PUBLISHED' ? 'Diizinkan / Terbuka' : 'Terkunci'}`,
      })
    }

    // 2. Single Student Raport Update
    const { siswaId, kelasId, semester = '1 (Ganjil)', tahunAjaran = '2025/2026', catatanWaliKelas, status } = body

    if (!siswaId) {
      return NextResponse.json({ success: false, message: 'ID Siswa wajib diisi' }, { status: 400 })
    }

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
    const totalNilai = studentNilais.reduce((sum, n) => sum + (n.nilaiAkhir || 0), 0)
    const rataRataNilai = studentNilais.length > 0 ? Number((totalNilai / studentNilais.length).toFixed(2)) : 82.5

    const existingIndex = db.raports.findIndex((r) => r.siswaId === siswaId)
    const existing = existingIndex !== -1 ? db.raports[existingIndex] : null

    const finalStatus: 'DRAFT' | 'PUBLISHED' =
      status === 'PUBLISHED' || status === 'DRAFT'
        ? status
        : existing
        ? existing.status
        : 'DRAFT'

    const raportItem: RaportData = {
      id: existing ? existing.id : `raport-${Date.now()}`,
      siswaId,
      kelasId: kelasId || existing?.kelasId || 'kelas-10-mipa1',
      semester,
      tahunAjaran,
      totalHadir: had || existing?.totalHadir || 24,
      totalIzin: izin || existing?.totalIzin || 1,
      totalSakit: sakit || existing?.totalSakit || 0,
      totalAlfa: alfa || existing?.totalAlfa || 0,
      rataRataNilai: rataRataNilai || existing?.rataRataNilai || 82.5,
      catatanWaliKelas:
        catatanWaliKelas !== undefined
          ? catatanWaliKelas
          : existing?.catatanWaliKelas || 'Pertahankan prestasi belajar dan aktif dalam kegiatan sekolah.',
      status: finalStatus,
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
      action: 'UPDATE_RAPORT_STATUS',
      detail: `${session.role} memperbarui status raport siswa ${siswaId}: ${finalStatus}`,
      createdAt: new Date().toISOString(),
    })

    saveSchoolDb(db)

    return NextResponse.json({
      success: true,
      message: `Status raport berhasil diperbarui menjadi ${finalStatus === 'PUBLISHED' ? 'Diizinkan / Terbuka' : 'Terkunci'}`,
      data: raportItem,
    })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message: errMessage }, { status: 500 })
  }
}
