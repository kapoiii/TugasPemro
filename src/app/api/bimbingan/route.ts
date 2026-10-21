import { NextRequest, NextResponse } from 'next/server'
import { getSchoolDb, saveSchoolDb, CatatanBimbinganItem } from '@/lib/schoolStore'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const siswaId = searchParams.get('siswaId')
    const db = getSchoolDb()

    let items = db.catatanBimbingan || []
    if (siswaId) {
      items = items.filter((b) => b.siswaId === siswaId)
    }

    const enriched = items.map((b) => {
      const studentUser = db.users.find((u) => u.siswaProfile?.id === b.siswaId)
      const siswa = studentUser?.siswaProfile
      const kelas = db.kelas.find((k) => k.id === siswa?.kelasId)
      const guru = db.users.find((u) => u.guruProfile?.id === b.guruId)?.guruProfile
      return {
        ...b,
        siswa: siswa ? { ...siswa, kelas } : undefined,
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
    const { siswaId, kategori = 'Akademik', catatan, tindakan, tanggal } = body

    if (!siswaId || !catatan) {
      return NextResponse.json(
        { success: false, message: 'Siswa dan catatan bimbingan wajib diisi' },
        { status: 400 }
      )
    }

    const db = getSchoolDb()
    const newBimbingan: CatatanBimbinganItem = {
      id: `bim-${Date.now()}`,
      siswaId,
      guruId: session.profileId || 'guru-profile-01',
      kategori: (kategori as 'Akademik' | 'Kedisiplinan' | 'Prestasi' | 'Konseling') || 'Akademik',
      catatan: catatan.trim(),
      tindakan: tindakan ? tindakan.trim() : '',
      tanggal: tanggal || new Date().toISOString().split('T')[0],
    }

    if (!db.catatanBimbingan) db.catatanBimbingan = []
    db.catatanBimbingan.unshift(newBimbingan)

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: session.userId,
      action: 'ADD_BIMBINGAN',
      detail: `Guru menambahkan catatan bimbingan untuk siswa ${siswaId} (${newBimbingan.kategori})`,
      createdAt: new Date().toISOString(),
    })

    saveSchoolDb(db)

    return NextResponse.json({
      success: true,
      message: 'Catatan bimbingan siswa berhasil disimpan',
      data: newBimbingan,
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
      return NextResponse.json({ success: false, message: 'ID catatan diperlukan' }, { status: 400 })
    }

    const db = getSchoolDb()
    const idx = (db.catatanBimbingan || []).findIndex((b) => b.id === id)
    if (idx === -1) {
      return NextResponse.json({ success: false, message: 'Catatan tidak ditemukan' }, { status: 404 })
    }

    db.catatanBimbingan.splice(idx, 1)
    saveSchoolDb(db)

    return NextResponse.json({ success: true, message: 'Catatan bimbingan berhasil dihapus' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
