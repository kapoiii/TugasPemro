import { NextRequest, NextResponse } from 'next/server'
import { getSchoolDb, saveSchoolDb, SesiAbsensi } from '@/lib/schoolStore'
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
    const db = getSchoolDb()

    if (session.role === 'SISWA') {
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

    const populatedSesis = sesis.map((s) => {
      const k = db.kelas.find((kls) => kls.id === s.kelasId)
      const m = db.mapel.find((mpl) => mpl.id === s.mapelId)
      const g = db.users.find((u) => u.guruProfile?.id === s.guruId)?.guruProfile
      const populatedDetails = s.details.map((d) => {
        const student = db.users.find((u) => u.siswaProfile?.id === d.siswaId)?.siswaProfile
        return {
          ...d,
          siswa: student ? { id: student.id, namaLengkap: student.namaLengkap, nis: student.nis } : undefined,
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

    return NextResponse.json({ success: true, data: populatedSesis })
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
    const { kelasId, mapelId, guruId, tanggal, pertemuanKe, keterangan, records } = body

    if (!kelasId || !mapelId || !records || !Array.isArray(records)) {
      return NextResponse.json({ success: false, message: 'Data absensi tidak lengkap' }, { status: 400 })
    }

    const db = getSchoolDb()

    const newSesiId = `sesi-${Date.now()}`
    const newSesi: SesiAbsensi = {
      id: newSesiId,
      kelasId,
      mapelId,
      guruId: guruId || session.profileId || 'guru-profile-01',
      tanggal: tanggal || new Date().toISOString().split('T')[0],
      pertemuanKe: Number(pertemuanKe) || (db.absensi.filter((s) => s.kelasId === kelasId && s.mapelId === mapelId).length + 1),
      keterangan: keterangan || '',
      createdAt: new Date().toISOString(),
      details: records.map((r: { siswaId: string; status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA'; catatan?: string }, idx: number) => ({
        id: `detail-${newSesiId}-${idx}`,
        siswaId: r.siswaId,
        status: r.status,
        catatan: r.catatan || '',
      })),
    }

    db.absensi.unshift(newSesi)

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: session.userId,
      action: 'INPUT_ABSENSI',
      detail: `${session.role} menginput absensi pertemuan ke-${newSesi.pertemuanKe} kelas ${kelasId}`,
      createdAt: new Date().toISOString(),
    })

    saveSchoolDb(db)

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
