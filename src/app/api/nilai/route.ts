import { NextRequest, NextResponse } from 'next/server'
import { getSchoolDb, saveSchoolDb, NilaiSiswa } from '@/lib/schoolStore'
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

    const db = getSchoolDb()

    let results = db.nilais
    if (kelasId) results = results.filter((n) => n.kelasId === kelasId)
    if (mapelId) results = results.filter((n) => n.mapelId === mapelId)
    if (siswaId) results = results.filter((n) => n.siswaId === siswaId)

    const enriched = results.map((n) => {
      const siswa = db.users.find((u) => u.siswaProfile?.id === n.siswaId)?.siswaProfile
      const mapel = db.mapel.find((m) => m.id === n.mapelId)
      const kelas = db.kelas.find((k) => k.id === n.kelasId)
      return {
        ...n,
        siswa,
        mapel,
        kelas,
      }
    })

    return NextResponse.json({ success: true, data: enriched })
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

    if (!siswaId || !mapelId) {
      return NextResponse.json({ success: false, message: 'Data nilai tidak lengkap' }, { status: 400 })
    }

    const db = getSchoolDb()

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

    const existingIndex = db.nilais.findIndex(
      (n) => n.siswaId === siswaId && n.mapelId === mapelId && n.semester === semester
    )

    let actualKelasId = kelasId
    if (!actualKelasId) {
      const studentUser = db.users.find((u) => u.siswaProfile?.id === siswaId)
      actualKelasId = studentUser?.siswaProfile?.kelasId || 'kelas-10-mipa1'
    }

    const nilaiItem: NilaiSiswa = {
      id: existingIndex !== -1 ? db.nilais[existingIndex].id : `nilai-${Date.now()}`,
      siswaId,
      mapelId,
      kelasId: actualKelasId,
      guruId: session.profileId || 'guru-profile-01',
      semester,
      tahunAjaran,
      nilaiTugas: t,
      nilaiUts: uts,
      nilaiUas: uas,
      nilaiPraktik: prk,
      nilaiSikap: skp,
      nilaiAkhir,
      predikat,
      catatan: catatan || '',
      updatedAt: new Date().toISOString(),
    }

    if (existingIndex !== -1) {
      db.nilais[existingIndex] = nilaiItem
    } else {
      db.nilais.push(nilaiItem)
    }

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: session.userId,
      action: 'INPUT_NILAI',
      detail: `Guru/Admin menginput/merubah nilai mapel ${mapelId} siswa ${siswaId}: Akhir=${nilaiAkhir} (${predikat})`,
      createdAt: new Date().toISOString(),
    })

    saveSchoolDb(db)

    return NextResponse.json({
      success: true,
      message: 'Nilai siswa berhasil disimpan & diperbarui',
      data: nilaiItem,
    })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message: errMessage }, { status: 500 })
  }
}
