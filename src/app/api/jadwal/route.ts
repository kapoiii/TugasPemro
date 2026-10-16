import { NextRequest, NextResponse } from 'next/server'
import { getSchoolDb, saveSchoolDb, JadwalPelajaran } from '@/lib/schoolStore'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const hari = searchParams.get('hari')
    const db = getSchoolDb()

    let schedules = db.jadwal

    if (session.role === 'GURU') {
      const guruId = session.profileId || 'guru-profile-01'
      schedules = schedules.filter((j) => j.guruId === guruId)
    } else if (session.role === 'SISWA') {
      // Find student's class
      const studentUser = db.users.find((u) => u.id === session.userId || u.siswaProfile?.id === session.profileId)
      const studentKelasId = studentUser?.siswaProfile?.kelasId || 'kelas-10-mipa1'
      schedules = schedules.filter((j) => j.kelasId === studentKelasId)
    }

    if (hari && hari !== 'Semua') {
      schedules = schedules.filter((j) => j.hari.toLowerCase() === hari.toLowerCase())
    }

    // Populate with kelas, mapel, guru
    const populated = schedules.map((j) => {
      const k = db.kelas.find((kls) => kls.id === j.kelasId)
      const m = db.mapel.find((mpl) => mpl.id === j.mapelId)
      const g = db.users.find((u) => u.guruProfile?.id === j.guruId)?.guruProfile
      return {
        ...j,
        kelas: k,
        mapel: m,
        guru: g,
      }
    })

    // Sort by day order and start time
    const dayOrder: Record<string, number> = { Senin: 1, Selasa: 2, Rabu: 3, Kamis: 4, Jumat: 5, Sabtu: 6 }
    populated.sort((a, b) => {
      const orderA = dayOrder[a.hari] || 99
      const orderB = dayOrder[b.hari] || 99
      if (orderA !== orderB) return orderA - orderB
      return a.jamMulai.localeCompare(b.jamMulai)
    })

    return NextResponse.json({ success: true, data: populated })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message: errMessage }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'ADMIN' && session.role !== 'GURU')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 })
    }

    const body = await request.json()
    const { hari, jamMulai, jamSelesai, kelasId, mapelId, guruId, ruangan } = body

    if (!hari || !jamMulai || !jamSelesai || !kelasId || !mapelId) {
      return NextResponse.json({ success: false, message: 'Data jadwal tidak lengkap' }, { status: 400 })
    }

    const db = getSchoolDb()

    const newJadwal: JadwalPelajaran = {
      id: `jadwal-${Date.now()}`,
      hari,
      jamMulai,
      jamSelesai,
      kelasId,
      mapelId,
      guruId: guruId || session.profileId || 'guru-profile-01',
      ruangan: ruangan || 'Ruang Kelas',
    }

    db.jadwal.push(newJadwal)
    saveSchoolDb(db)

    return NextResponse.json({
      success: true,
      message: 'Jadwal pelajaran berhasil ditambahkan',
      data: newJadwal,
    })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message: errMessage }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID jadwal diperlukan' }, { status: 400 })
    }

    const db = getSchoolDb()
    const idx = db.jadwal.findIndex((j) => j.id === id)
    if (idx === -1) {
      return NextResponse.json({ success: false, message: 'Jadwal tidak ditemukan' }, { status: 404 })
    }

    db.jadwal.splice(idx, 1)
    saveSchoolDb(db)

    return NextResponse.json({ success: true, message: 'Jadwal berhasil dihapus' })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message: errMessage }, { status: 500 })
  }
}
