import { NextRequest, NextResponse } from 'next/server'
import { getSchoolDb, saveSchoolDb, NilaiSiswa } from '@/lib/schoolStore'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)

    const { searchParams } = new URL(request.url)
    const roleUpper = session?.role ? String(session.role).toUpperCase() : ''
    const kelasId = searchParams.get('kelasId')
    const mapelId = searchParams.get('mapelId')
    const siswaId = searchParams.get('siswaId') || (roleUpper === 'SISWA' ? session?.profileId : undefined)
    const guruId = searchParams.get('guruId')

    const db = getSchoolDb()

    let results = Array.isArray(db.nilais) ? db.nilais : []
    if (kelasId) results = results.filter((n) => n.kelasId === kelasId)
    if (mapelId) results = results.filter((n) => n.mapelId === mapelId)
    if (guruId) results = results.filter((n) => n.guruId === guruId)
    if (siswaId) {
      const studentUser = db.users.find(
        (u) =>
          u.siswaProfile?.id === siswaId ||
          u.id === siswaId ||
          (session?.profileId && u.siswaProfile?.id === session.profileId) ||
          (session?.userId && u.id === session.userId)
      )
      const possibleSiswaIds = new Set(
        [
          siswaId,
          session?.profileId,
          session?.userId,
          studentUser?.siswaProfile?.id,
          studentUser?.id,
          siswaId.replace(/-0+/, '-'),
          siswaId.replace(/-(?=[1-9])/, '-0'),
        ].filter(Boolean) as string[]
      )
      results = results.filter((n) => possibleSiswaIds.has(n.siswaId))
    }

    const enriched = results.map((n) => {
      const studentUser = db.users.find(
        (u) => u.siswaProfile?.id === n.siswaId || u.id === n.siswaId || u.siswaProfile?.nis === n.siswaId
      )
      const siswa = studentUser?.siswaProfile || {
        id: n.siswaId,
        userId: n.siswaId,
        nis: '-',
        nisn: '-',
        namaLengkap: 'Siswa',
        kelasId: n.kelasId,
        jenisKelamin: 'L' as const,
      }
      const mapel = db.mapel.find((m) => m.id === n.mapelId)
      const kelas = db.kelas.find((k) => k.id === n.kelasId)
      const kkm = mapel?.kkm || 75
      const nilaiUh = typeof n.nilaiUh === 'number' ? n.nilaiUh : (n.nilaiTugas || 80)
      const nilaiAkhir = typeof n.nilaiAkhir === 'number' ? n.nilaiAkhir : 0
      const isBelowKkm = nilaiAkhir < kkm

      return {
        ...n,
        nilaiUh,
        nilaiAkhir,
        siswa,
        mapel,
        kelas,
        kkm,
        isBelowKkm,
      }
    })

    return NextResponse.json({
      success: true,
      data: enriched,
      bobot: db.bobotNilai || { tugas: 25, uh: 25, uts: 25, uas: 25 },
    })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message: errMessage }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)
    const body = await request.json().catch(() => ({}))
    const roleUpper = session?.role ? String(session.role).toUpperCase() : ''
    const referer = request.headers.get('referer') || ''
    const isTeacherOrAdminPortal = referer.includes('/dashboard/guru') || referer.includes('/dashboard/admin')
    const hasTeacherRole = body.callerRole === 'GURU' || body.callerRole === 'ADMIN'

    if (roleUpper === 'SISWA') {
      return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 })
    }

    if (roleUpper !== 'GURU' && roleUpper !== 'ADMIN' && !(isTeacherOrAdminPortal && hasTeacherRole)) {
      return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 })
    }
    const db = getSchoolDb()
    if (!Array.isArray(db.nilais)) db.nilais = []

    // 1. UPDATE BOBOT NILAI
    if (body.type === 'BOBOT') {
      const { bobot } = body
      if (!bobot || typeof bobot.tugas !== 'number') {
        return NextResponse.json({ success: false, message: 'Format bobot nilai tidak valid' }, { status: 400 })
      }
      db.bobotNilai = {
        tugas: Math.max(0, Number(bobot.tugas) || 0),
        uh: Math.max(0, Number(bobot.uh) || 0),
        uts: Math.max(0, Number(bobot.uts) || 0),
        uas: Math.max(0, Number(bobot.uas) || 0),
      }
      saveSchoolDb(db)
      return NextResponse.json({ success: true, message: 'Bobot penilaian berhasil diperbarui', data: db.bobotNilai })
    }

    // 2. BATCH SAVE OR SINGLE SAVE
    const items = Array.isArray(body.items) ? body.items : [body]
    const bobot = body.bobot || db.bobotNilai || { tugas: 25, uh: 25, uts: 25, uas: 25 }
    const sumWeight = (Number(bobot.tugas) || 25) + (Number(bobot.uh) || 25) + (Number(bobot.uts) || 25) + (Number(bobot.uas) || 25) || 100

    const savedResults: NilaiSiswa[] = []

    for (const item of items) {
      const {
        siswaId,
        mapelId,
        kelasId,
        semester = '1',
        tahunAjaran = '2025/2026',
        nilaiTugas = 0,
        nilaiUh,
        nilaiUts = 0,
        nilaiUas = 0,
        nilaiPraktik = 0,
        nilaiSikap = 0,
        catatan = '',
      } = item

      if (!siswaId || !mapelId) continue

      const t = Number(nilaiTugas)
      const uh = Number(typeof nilaiUh !== 'undefined' ? nilaiUh : nilaiTugas)
      const uts = Number(nilaiUts)
      const uas = Number(nilaiUas)
      const prk = Number(nilaiPraktik)
      const skp = Number(nilaiSikap)

      // Strict validation: must be 0 - 100
      if ([t, uh, uts, uas, prk, skp].some((val) => isNaN(val) || val < 0 || val > 100)) {
        return NextResponse.json(
          { success: false, message: 'Seluruh input nilai harus berupa angka dalam rentang 0 hingga 100.' },
          { status: 400 }
        )
      }

      // Calculate final score based on weights
      const calculatedAkhir = Number(
        ((t * bobot.tugas + uh * bobot.uh + uts * bobot.uts + uas * bobot.uas) / sumWeight).toFixed(2)
      )

      let predikat = 'D'
      if (calculatedAkhir >= 88) predikat = 'A'
      else if (calculatedAkhir >= 78) predikat = 'B'
      else if (calculatedAkhir >= 68) predikat = 'C'

      // Resolve student profile ID & class ID
      const studentUser = db.users.find(
        (u) => u.siswaProfile?.id === siswaId || u.id === siswaId || u.siswaProfile?.nis === siswaId
      )
      const actualSiswaId = studentUser?.siswaProfile?.id || siswaId
      const actualKelasId = kelasId || studentUser?.siswaProfile?.kelasId || 'kelas-10-mipa1'

      const existingIndex = db.nilais.findIndex(
        (n) => (n.siswaId === actualSiswaId || n.siswaId === siswaId) && n.mapelId === mapelId && (n.semester === semester || !n.semester)
      )

      const nilaiItem: NilaiSiswa = {
        id: existingIndex !== -1 ? db.nilais[existingIndex].id : `nilai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        siswaId: actualSiswaId,
        mapelId,
        kelasId: actualKelasId,
        guruId: session?.profileId || 'guru-profile-01',
        semester,
        tahunAjaran,
        nilaiTugas: t,
        nilaiUh: uh,
        nilaiUts: uts,
        nilaiUas: uas,
        nilaiPraktik: prk,
        nilaiSikap: skp,
        nilaiAkhir: calculatedAkhir,
        predikat,
        catatan: String(catatan || ''),
        updatedAt: new Date().toISOString(),
      }

      if (existingIndex !== -1) {
        db.nilais[existingIndex] = nilaiItem
      } else {
        db.nilais.push(nilaiItem)
      }

      savedResults.push(nilaiItem)
    }

    if (!Array.isArray(db.auditLogs)) db.auditLogs = []
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: session?.userId || 'guru-session',
      action: 'INPUT_NILAI',
      detail: `Guru/Admin menyimpan ${savedResults.length} data nilai siswa`,
      createdAt: new Date().toISOString(),
    })

    saveSchoolDb(db)

    return NextResponse.json({
      success: true,
      message: `Berhasil menyimpan & merekap data nilai ${savedResults.length} siswa`,
      data: savedResults,
    })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message: errMessage }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, message: 'ID nilai wajib diisi' }, { status: 400 })
    }

    const db = getSchoolDb()
    if (!Array.isArray(db.nilais)) db.nilais = []
    const initialLen = db.nilais.length
    db.nilais = db.nilais.filter((n) => n.id !== id)

    if (db.nilais.length < initialLen) {
      saveSchoolDb(db)
      return NextResponse.json({ success: true, message: 'Data nilai berhasil dihapus' })
    }

    return NextResponse.json({ success: false, message: 'Data nilai tidak ditemukan' }, { status: 404 })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message: errMessage }, { status: 500 })
  }
}
