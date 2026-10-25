import { NextRequest, NextResponse } from 'next/server'
import { getSchoolDb, saveSchoolDb, SesiAbsensi } from '@/lib/schoolStore'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    const { searchParams } = new URL(request.url)
    const kelasId = searchParams.get('kelasId')
    const siswaId = searchParams.get('siswaId') || session?.profileId
    const db = getSchoolDb()

    if (session?.role === 'SISWA') {
      // Find all session details where this student is enrolled
      const detailsList: Array<{
        id: string
        status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA'
        catatan?: string
        sesi: {
          id: string
          tanggal: string
          pertemuanKe: number
          keterangan?: string
          kelas?: { namaKelas: string }
          mapel?: { namaMapel: string }
          guru?: { namaLengkap: string }
        }
      }> = []

      db.absensi.forEach((sesi) => {
        const studentDetail = sesi.details.find((d) => d.siswaId === siswaId)
        if (studentDetail) {
          const k = db.kelas.find((kls) => kls.id === sesi.kelasId)
          const m = db.mapel.find((mpl) => mpl.id === sesi.mapelId)
          const g = db.users.find((u) => u.guruProfile?.id === sesi.guruId)?.guruProfile

          detailsList.push({
            id: studentDetail.id,
            status: studentDetail.status,
            catatan: studentDetail.catatan,
            sesi: {
              id: sesi.id,
              tanggal: sesi.tanggal,
              pertemuanKe: sesi.pertemuanKe,
              keterangan: sesi.keterangan,
              kelas: k ? { namaKelas: k.namaKelas } : undefined,
              mapel: m ? { namaMapel: m.namaMapel } : undefined,
              guru: g ? { namaLengkap: g.namaLengkap } : undefined,
            },
          })
        }
      })

      // Sort by date desc
      detailsList.sort((a, b) => new Date(b.sesi.tanggal).getTime() - new Date(a.sesi.tanggal).getTime())

      const summary = {
        HADIR: detailsList.filter((d) => d.status === 'HADIR').length,
        IZIN: detailsList.filter((d) => d.status === 'IZIN').length,
        SAKIT: detailsList.filter((d) => d.status === 'SAKIT').length,
        ALFA: detailsList.filter((d) => d.status === 'ALFA').length,
      }

      return NextResponse.json({ success: true, data: { details: detailsList, summary } })
    }

    // Role GURU or ADMIN
    let sesis = db.absensi
    if (kelasId) {
      sesis = sesis.filter((s) => s.kelasId === kelasId)
    }

    const bulan = searchParams.get('bulan') // YYYY-MM
    if (bulan) {
      sesis = sesis.filter((s) => s.tanggal.startsWith(bulan))
    }

    const populatedSesis = sesis.map((s) => {
      const k = db.kelas.find((kls) => kls.id === s.kelasId)
      const m = db.mapel.find((mpl) => mpl.id === s.mapelId)
      const g = db.users.find((u) => u.guruProfile?.id === s.guruId)?.guruProfile
      const populatedDetails = s.details.map((d) => {
        const student = db.users.find((u) => u.siswaProfile?.id === d.siswaId)?.siswaProfile
        return {
          ...d,
          siswa: student
            ? { id: student.id, namaLengkap: student.namaLengkap, nis: student.nis, nisn: student.nisn }
            : undefined,
        }
      })

      return {
        ...s,
        kelas: k,
        mapel: m,
        guru: g,
        details: populatedDetails,
      }
    })

    // Compute monthly recap if requested or if kelasId provided
    const targetKelasId = kelasId || (db.kelas[0] ? db.kelas[0].id : undefined)
    const studentsInTargetClass = db.users
      .filter((u) => u.role === 'SISWA' && u.siswaProfile && (!targetKelasId || u.siswaProfile.kelasId === targetKelasId))
      .map((u) => u.siswaProfile!)

    const relevantSessions = targetKelasId ? db.absensi.filter((s) => s.kelasId === targetKelasId) : db.absensi
    const totalSesi = relevantSessions.length

    const rekapSiswa = studentsInTargetClass.map((st) => {
      let hadir = 0
      let izin = 0
      let sakit = 0
      let alfa = 0

      relevantSessions.forEach((sesi) => {
        const d = sesi.details.find((dt) => dt.siswaId === st.id)
        if (d) {
          if (d.status === 'HADIR') hadir++
          else if (d.status === 'IZIN') izin++
          else if (d.status === 'SAKIT') sakit++
          else if (d.status === 'ALFA') alfa++
        }
      })

      const totalRecorded = hadir + izin + sakit + alfa
      const persentase = totalRecorded > 0 ? Number(((hadir / totalRecorded) * 100).toFixed(1)) : 100

      return {
        siswaId: st.id,
        namaLengkap: st.namaLengkap,
        nisn: st.nisn,
        nis: st.nis,
        hadir,
        izin,
        sakit,
        alfa,
        totalSesi: totalRecorded || totalSesi,
        persentase,
        isWarning: persentase < 75,
      }
    })

    return NextResponse.json({
      success: true,
      data: populatedSesis,
      rekap: rekapSiswa,
      totalSesi,
    })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message: errMessage }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)
    const roleUpper = session?.role ? String(session.role).toUpperCase() : ''
    const referer = request.headers.get('referer') || ''
    const isTeacherOrAdminPortal = referer.includes('/dashboard/guru') || referer.includes('/dashboard/admin')

    if (roleUpper === 'SISWA') {
      return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 })
    }

    if (roleUpper !== 'GURU' && roleUpper !== 'ADMIN' && !isTeacherOrAdminPortal) {
      return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 })
    }

    const body = await request.json()
    const { kelasId, mapelId, guruId, tanggal, pertemuanKe, keterangan, records, allowOverwrite, updateSesiId } = body

    if (!kelasId || !mapelId || !records || !Array.isArray(records)) {
      return NextResponse.json({ success: false, message: 'Data absensi tidak lengkap' }, { status: 400 })
    }

    const db = getSchoolDb()
    const targetDate = tanggal || new Date().toISOString().split('T')[0]

    // Check duplicate: prevent double entry for same kelas, mapel, and date
    const existingIndex = db.absensi.findIndex(
      (s) => s.kelasId === kelasId && s.mapelId === mapelId && s.tanggal === targetDate
    )

    if (existingIndex !== -1 && !allowOverwrite && !updateSesiId) {
      return NextResponse.json(
        {
          success: false,
          duplicate: true,
          existingId: db.absensi[existingIndex].id,
          message: `Presensi kelas ini pada tanggal ${targetDate} sudah pernah diinput sebelumnya. Silakan gunakan tombol perbarui data untuk memperbarui presensi.`,
        },
        { status: 409 }
      )
    }

    let savedSesi: SesiAbsensi
    if (existingIndex !== -1 && (allowOverwrite || updateSesiId)) {
      // Overwrite/update existing session
      const existingId = db.absensi[existingIndex].id
      savedSesi = {
        ...db.absensi[existingIndex],
        pertemuanKe: Number(pertemuanKe) || db.absensi[existingIndex].pertemuanKe,
        keterangan: keterangan ?? db.absensi[existingIndex].keterangan,
        details: records.map(
          (r: { siswaId: string; status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA'; catatan?: string }, idx: number) => ({
            id: `detail-${existingId}-${idx}`,
            siswaId: r.siswaId,
            status: r.status,
            catatan: r.catatan || '',
          })
        ),
      }
      db.absensi[existingIndex] = savedSesi
    } else {
      const newSesiId = `sesi-${Date.now()}`
      savedSesi = {
        id: newSesiId,
        kelasId,
        mapelId,
        guruId: guruId || session?.profileId || 'guru-profile-01',
        tanggal: targetDate,
        pertemuanKe: Number(pertemuanKe) || (db.absensi.filter((s) => s.kelasId === kelasId && s.mapelId === mapelId).length + 1),
        keterangan: keterangan || '',
        createdAt: new Date().toISOString(),
        details: records.map(
          (r: { siswaId: string; status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA'; catatan?: string }, idx: number) => ({
            id: `detail-${newSesiId}-${idx}`,
            siswaId: r.siswaId,
            status: r.status,
            catatan: r.catatan || '',
          })
        ),
      }
      db.absensi.unshift(savedSesi)
    }

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: session?.userId || guruId || 'guru-session',
      action: 'INPUT_ABSENSI',
      detail: `${roleUpper || 'GURU'} menyimpan absensi pertemuan ke-${savedSesi.pertemuanKe} kelas ${kelasId} (${targetDate})`,
      createdAt: new Date().toISOString(),
    })

    saveSchoolDb(db)

    return NextResponse.json({
      success: true,
      message: 'Presensi siswa berhasil disimpan ke sistem',
      data: savedSesi,
    })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message: errMessage }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'GURU' && session.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, message: 'ID sesi absensi diperlukan' }, { status: 400 })
    }

    const db = getSchoolDb()
    const idx = db.absensi.findIndex((s) => s.id === id)
    if (idx === -1) {
      return NextResponse.json({ success: false, message: 'Sesi absensi tidak ditemukan' }, { status: 404 })
    }

    db.absensi.splice(idx, 1)
    saveSchoolDb(db)

    return NextResponse.json({ success: true, message: 'Sesi absensi berhasil dihapus' })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message: errMessage }, { status: 500 })
  }
}
