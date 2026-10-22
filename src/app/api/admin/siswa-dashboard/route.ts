import { NextRequest, NextResponse } from 'next/server'
import { getSchoolDb, saveSchoolDb, NilaiSiswa, RaportData } from '@/lib/schoolStore'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const siswaId = searchParams.get('siswaId')
    const db = getSchoolDb()

    // 1. If no siswaId is requested, return list of all Siswa for selector
    if (!siswaId) {
      const allSiswa = db.users
        .filter((u) => u.role === 'SISWA' && u.siswaProfile)
        .map((u) => {
          const k = db.kelas.find((kls) => kls.id === u.siswaProfile?.kelasId)
          return {
            id: u.siswaProfile!.id,
            userId: u.id,
            namaLengkap: u.siswaProfile!.namaLengkap,
            nis: u.siswaProfile!.nis,
            nisn: u.siswaProfile!.nisn,
            kelasId: u.siswaProfile!.kelasId,
            jenisKelamin: u.siswaProfile!.jenisKelamin || 'L',
            noHp: u.siswaProfile!.noHp || '-',
            kelas: k ? { id: k.id, namaKelas: k.namaKelas, tingkat: k.tingkat } : undefined,
            user: { username: u.username, email: u.email },
          }
        })

      return NextResponse.json({ success: true, data: allSiswa })
    }

    // 2. Return specific siswa details
    const studentUser = db.users.find((u) => u.siswaProfile?.id === siswaId)
    if (!studentUser || !studentUser.siswaProfile) {
      return NextResponse.json({ success: false, message: 'Siswa tidak ditemukan' }, { status: 404 })
    }

    const sp = studentUser.siswaProfile
    const k = db.kelas.find((kls) => kls.id === sp.kelasId)
    const siswaObj = {
      ...sp,
      kelas: k ? { id: k.id, namaKelas: k.namaKelas, tingkat: k.tingkat } : undefined,
      user: { id: studentUser.id, username: studentUser.username, email: studentUser.email },
    }

    // Attendance summary
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

    const studentRaport = db.raports.find((r) => r.siswaId === siswaId)
    const attendanceSummary = {
      HADIR: studentRaport?.totalHadir !== undefined && studentRaport.totalHadir > 0 ? studentRaport.totalHadir : had || 18,
      IZIN: studentRaport?.totalIzin !== undefined ? studentRaport.totalIzin : izin || 1,
      SAKIT: studentRaport?.totalSakit !== undefined ? studentRaport.totalSakit : sakit || 1,
      ALFA: studentRaport?.totalAlfa !== undefined ? studentRaport.totalAlfa : alfa || 0,
    }

    // Grades
    const rawNilais = db.nilais.filter((n) => n.siswaId === siswaId)
    const nilais = rawNilais.map((n) => {
      const mapel = db.mapel.find((m) => m.id === n.mapelId)
      return {
        ...n,
        mapel: mapel ? { id: mapel.id, namaMapel: mapel.namaMapel, kodeMapel: mapel.kodeMapel } : undefined,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        siswa: siswaObj,
        attendanceSummary,
        nilais,
        raport: studentRaport || {
          catatanWaliKelas: 'Pertahankan prestasi belajar dan aktif dalam kegiatan sekolah.',
          status: db.settings.pembagianRaportDibuka ? 'PUBLISHED' : 'DRAFT',
        },
        allMapel: db.mapel,
        allKelas: db.kelas,
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
      namaLengkap,
      nisn,
      nis,
      kelasId,
      alamat,
      noHp,
      attendance,
      grades,
      catatanWaliKelas,
      raportStatus = 'PUBLISHED',
      semester = '1',
      tahunAjaran = '2025/2026',
    } = body

    if (!siswaId) {
      return NextResponse.json({ success: false, message: 'ID Siswa wajib disertakan' }, { status: 400 })
    }

    const db = getSchoolDb()
    const studentUser = db.users.find((u) => u.siswaProfile?.id === siswaId)
    if (!studentUser || !studentUser.siswaProfile) {
      return NextResponse.json({ success: false, message: 'Siswa tidak ditemukan' }, { status: 404 })
    }

    // 1. Update Profile
    if (namaLengkap) studentUser.siswaProfile.namaLengkap = namaLengkap
    if (nisn) studentUser.siswaProfile.nisn = nisn
    if (nis) studentUser.siswaProfile.nis = nis
    if (kelasId) studentUser.siswaProfile.kelasId = kelasId
    if (alamat !== undefined) studentUser.siswaProfile.alamat = alamat
    if (noHp !== undefined) studentUser.siswaProfile.noHp = noHp
    studentUser.updatedAt = new Date().toISOString()

    // 2. Update Grades
    if (grades && Array.isArray(grades)) {
      grades.forEach((g: {
        mapelId: string
        nilaiTugas?: number
        nilaiUts?: number
        nilaiUas?: number
        nilaiPraktik?: number
        nilaiSikap?: number
        nilaiAkhir?: number
        predikat?: string
        catatan?: string
      }) => {
        const t = Number(g.nilaiTugas || 0)
        const uts = Number(g.nilaiUts || 0)
        const uas = Number(g.nilaiUas || 0)
        const prk = Number(g.nilaiPraktik || 0)
        const skp = Number(g.nilaiSikap || 0)
        const finalCalculated = g.nilaiAkhir !== undefined && g.nilaiAkhir > 0
          ? Number(g.nilaiAkhir)
          : Number((t * 0.2 + uts * 0.25 + uas * 0.3 + prk * 0.15 + skp * 0.1).toFixed(2))

        let pred = g.predikat || 'C'
        if (finalCalculated >= 88) pred = 'A'
        else if (finalCalculated >= 78) pred = 'B'
        else if (finalCalculated >= 68) pred = 'C'
        else pred = 'D'

        const existingNilaiIndex = db.nilais.findIndex(
          (n) => n.siswaId === siswaId && n.mapelId === g.mapelId
        )

        const nilaiRecord: NilaiSiswa = {
          id: existingNilaiIndex !== -1 ? db.nilais[existingNilaiIndex].id : `nilai-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          siswaId,
          mapelId: g.mapelId,
          kelasId: studentUser.siswaProfile!.kelasId,
          guruId: 'guru-profile-01',
          semester,
          tahunAjaran,
          nilaiTugas: t,
          nilaiUts: uts,
          nilaiUas: uas,
          nilaiPraktik: prk,
          nilaiSikap: skp,
          nilaiAkhir: finalCalculated,
          predikat: pred,
          catatan: g.catatan || '',
          updatedAt: new Date().toISOString(),
        }

        if (existingNilaiIndex !== -1) {
          db.nilais[existingNilaiIndex] = nilaiRecord
        } else {
          db.nilais.push(nilaiRecord)
        }
      })
    }

    // 3. Update Raport
    const existingRaportIndex = db.raports.findIndex((r) => r.siswaId === siswaId)
    const currentNilais = db.nilais.filter((n) => n.siswaId === siswaId)
    const avg = currentNilais.length > 0
      ? Number((currentNilais.reduce((sum, n) => sum + n.nilaiAkhir, 0) / currentNilais.length).toFixed(2))
      : 85

    const raportRecord: RaportData = {
      id: existingRaportIndex !== -1 ? db.raports[existingRaportIndex].id : `raport-${Date.now()}`,
      siswaId,
      kelasId: studentUser.siswaProfile.kelasId,
      semester,
      tahunAjaran,
      totalHadir: attendance ? Number(attendance.HADIR || 0) : 18,
      totalIzin: attendance ? Number(attendance.IZIN || 0) : 1,
      totalSakit: attendance ? Number(attendance.SAKIT || 0) : 1,
      totalAlfa: attendance ? Number(attendance.ALFA || 0) : 0,
      rataRataNilai: avg,
      catatanWaliKelas: catatanWaliKelas || 'Pertahankan prestasi belajar.',
      status: raportStatus as 'DRAFT' | 'PUBLISHED',
      updatedAt: new Date().toISOString(),
    }

    if (existingRaportIndex !== -1) {
      db.raports[existingRaportIndex] = raportRecord
    } else {
      db.raports.push(raportRecord)
    }

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: session.userId,
      action: 'UPDATE_SISWA_DASHBOARD',
      detail: `Admin mengupdate dashboard siswa: ${studentUser.siswaProfile.namaLengkap}`,
      createdAt: new Date().toISOString(),
    })

    saveSchoolDb(db)

    return NextResponse.json({
      success: true,
      message: `Data dashboard siswa ${studentUser.siswaProfile.namaLengkap} berhasil diperbarui & disimpan`,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
