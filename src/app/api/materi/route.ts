import { NextRequest, NextResponse } from 'next/server'
import { getSchoolDb, saveSchoolDb, MateriItem } from '@/lib/schoolStore'
import { getSession } from '@/lib/auth'

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'mp4', 'zip', 'png', 'jpg', 'jpeg']
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024 // 25 MB

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const kelasId = searchParams.get('kelasId')
    const mapelId = searchParams.get('mapelId')
    const db = getSchoolDb()

    let materis = db.materis || []

    if (kelasId) {
      materis = materis.filter((m) => m.kelasId === kelasId)
    }
    if (mapelId) {
      materis = materis.filter((m) => m.mapelId === mapelId)
    }

    const enriched = materis.map((m) => {
      const kelas = db.kelas.find((k) => k.id === m.kelasId)
      const mapel = db.mapel.find((mpl) => mpl.id === m.mapelId)
      const guru = db.users.find((u) => u.guruProfile?.id === m.guruId)?.guruProfile
      return {
        ...m,
        kelas,
        mapel,
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
    const { judul, deskripsi, fileName, fileUrl, fileType, fileSizeBytes, kelasId, mapelId } = body

    if (!judul || !kelasId || !mapelId || !fileName) {
      return NextResponse.json(
        { success: false, message: 'Judul materi, kelas, mata pelajaran, dan file wajib diisi' },
        { status: 400 }
      )
    }

    // Validate file extension
    const ext = String(fileType || fileName.split('.').pop() || '').toLowerCase().replace('.', '')
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        {
          success: false,
          message: `Format file .${ext} tidak diizinkan. Tipe file yang didukung: ${ALLOWED_EXTENSIONS.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Validate file size (max 25MB)
    const size = Number(fileSizeBytes) || 1024 * 1024
    if (size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          message: `Ukuran file melebihi batas maksimum 25MB (Ukuran file Anda: ${(size / (1024 * 1024)).toFixed(1)}MB)`,
        },
        { status: 400 }
      )
    }

    const db = getSchoolDb()
    const newMateri: MateriItem = {
      id: `mat-${Date.now()}`,
      judul: judul.trim(),
      deskripsi: deskripsi || '',
      fileName: fileName.trim(),
      fileUrl: fileUrl || `/documents/${encodeURIComponent(fileName)}`,
      fileType: ext,
      fileSizeBytes: size,
      kelasId,
      mapelId,
      guruId: session.profileId || 'guru-profile-01',
      createdAt: new Date().toISOString(),
    }

    if (!db.materis) db.materis = []
    db.materis.unshift(newMateri)

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: session.userId,
      action: 'UPLOAD_MATERI',
      detail: `Guru mengunggah materi baru: ${judul} (${newMateri.fileName})`,
      createdAt: new Date().toISOString(),
    })

    saveSchoolDb(db)

    return NextResponse.json({
      success: true,
      message: 'Materi pembelajaran berhasil diunggah',
      data: newMateri,
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
      return NextResponse.json({ success: false, message: 'ID materi diperlukan' }, { status: 400 })
    }

    const db = getSchoolDb()
    const idx = (db.materis || []).findIndex((m) => m.id === id)
    if (idx === -1) {
      return NextResponse.json({ success: false, message: 'Materi tidak ditemukan' }, { status: 404 })
    }

    db.materis.splice(idx, 1)
    saveSchoolDb(db)

    return NextResponse.json({ success: true, message: 'Materi berhasil dihapus' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
