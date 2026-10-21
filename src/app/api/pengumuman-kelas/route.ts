import { NextRequest, NextResponse } from 'next/server'
import { getSchoolDb, saveSchoolDb, PengumumanKelasItem } from '@/lib/schoolStore'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const kelasId = searchParams.get('kelasId')
    const db = getSchoolDb()

    let items = db.pengumumanKelas || []

    if (kelasId && kelasId !== 'ALL') {
      items = items.filter((p) => p.kelasId === kelasId || p.kelasId === 'ALL' || !p.kelasId)
    }

    const enriched = items.map((p) => {
      const kelas = p.kelasId === 'ALL' || !p.kelasId ? { namaKelas: 'Semua Kelas' } : db.kelas.find((k) => k.id === p.kelasId)
      const guru = db.users.find((u) => u.guruProfile?.id === p.guruId)?.guruProfile
      return {
        ...p,
        kelas,
        guru,
      }
    })

    return NextResponse.json({ success: true, data: enriched })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'GURU' && session.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 })
    }

    const body = await request.json()
    const { judul, konten, prioritas = 'NORMAL', kelasId = 'ALL' } = body

    if (!judul || !konten) {
      return NextResponse.json(
        { success: false, message: 'Judul dan isi pengumuman wajib diisi' },
        { status: 400 }
      )
    }

    const db = getSchoolDb()
    const newPengumuman: PengumumanKelasItem = {
      id: `peng-${Date.now()}`,
      judul: judul.trim(),
      konten: konten.trim(),
      prioritas: prioritas as 'NORMAL' | 'PENTING' | 'MENDESAK',
      kelasId: kelasId || 'ALL',
      guruId: session.profileId || 'guru-profile-01',
      createdAt: new Date().toISOString(),
    }

    if (!db.pengumumanKelas) db.pengumumanKelas = []
    db.pengumumanKelas.unshift(newPengumuman)

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: session.userId,
      action: 'CREATE_PENGUMUMAN_KELAS',
      detail: `Guru membuat pengumuman: ${judul} (${newPengumuman.prioritas})`,
      createdAt: new Date().toISOString(),
    })

    saveSchoolDb(db)

    return NextResponse.json({
      success: true,
      message: 'Pengumuman kelas berhasil dipublikasikan',
      data: newPengumuman,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
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
      return NextResponse.json({ success: false, message: 'ID pengumuman diperlukan' }, { status: 400 })
    }

    const db = getSchoolDb()
    const idx = (db.pengumumanKelas || []).findIndex((p) => p.id === id)
    if (idx === -1) {
      return NextResponse.json({ success: false, message: 'Pengumuman tidak ditemukan' }, { status: 404 })
    }

    db.pengumumanKelas.splice(idx, 1)
    saveSchoolDb(db)

    return NextResponse.json({ success: true, message: 'Pengumuman berhasil dihapus' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
