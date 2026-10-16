import { NextRequest, NextResponse } from 'next/server'
import { getSchoolDb, saveSchoolDb, PekerjaanRumah } from '@/lib/schoolStore'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const db = getSchoolDb()
    const studentProfileId = session.role === 'SISWA' ? session.profileId || 'siswa-profile-01' : undefined

    let prList = db.pekerjaanRumah

    if (session.role === 'SISWA') {
      const studentUser = db.users.find((u) => u.siswaProfile?.id === studentProfileId)
      const studentKelasId = studentUser?.siswaProfile?.kelasId || 'kelas-10-mipa1'
      prList = prList.filter((p) => p.kelasId === studentKelasId)
    }

    const enriched = prList.map((pr) => {
      const mapel = db.mapel.find((m) => m.id === pr.mapelId)
      const kelas = db.kelas.find((k) => k.id === pr.kelasId)
      const guru = db.users.find((u) => u.guruProfile?.id === pr.guruId)?.guruProfile

      // Check if logged-in student has submitted
      const studentSubmission = studentProfileId
        ? pr.submissions.find((s) => s.siswaId === studentProfileId)
        : undefined

      return {
        ...pr,
        mapel,
        kelas,
        guru,
        isSubmitted: !!studentSubmission,
        mySubmission: studentSubmission,
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
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const db = getSchoolDb()

    // 1. SISWA SUBMITTING HOMEWORK (Menginput Pekerjaan Rumah)
    if (session.role === 'SISWA') {
      const { prId, submissionText, fileUrl } = body
      if (!prId) {
        return NextResponse.json({ success: false, message: 'ID Pekerjaan Rumah diperlukan' }, { status: 400 })
      }

      const pr = db.pekerjaanRumah.find((p) => p.id === prId)
      if (!pr) {
        return NextResponse.json({ success: false, message: 'Tugas PR tidak ditemukan' }, { status: 404 })
      }

      const studentId = session.profileId || 'siswa-profile-01'
      const existingSubmissionIdx = pr.submissions.findIndex((s) => s.siswaId === studentId)

      const submissionData = {
        siswaId: studentId,
        submissionText: submissionText || 'Tugas telah dikerjakan dan diunggah.',
        fileUrl: fileUrl || '',
        submittedAt: new Date().toISOString(),
        status: 'SUBMITTED' as const,
      }

      if (existingSubmissionIdx !== -1) {
        pr.submissions[existingSubmissionIdx] = submissionData
      } else {
        pr.submissions.push(submissionData)
      }

      db.auditLogs.unshift({
        id: `log-${Date.now()}`,
        userId: session.userId,
        action: 'SUBMIT_HOMEWORK',
        detail: `Siswa ${session.namaLengkap || session.username} menginput tugas PR: ${pr.judul}`,
        createdAt: new Date().toISOString(),
      })

      saveSchoolDb(db)

      return NextResponse.json({
        success: true,
        message: 'Pekerjaan rumah berhasil dikumpulkan!',
        data: submissionData,
      })
    }

    // 2. GURU OR ADMIN CREATING HOMEWORK
    const { judul, deskripsi, mapelId, kelasId, tenggatWaktu } = body
    if (!judul || !mapelId || !kelasId) {
      return NextResponse.json({ success: false, message: 'Data tugas PR tidak lengkap' }, { status: 400 })
    }

    const newPr: PekerjaanRumah = {
      id: `pr-${Date.now()}`,
      judul,
      deskripsi: deskripsi || '',
      mapelId,
      kelasId,
      guruId: session.profileId || 'guru-profile-01',
      tenggatWaktu: tenggatWaktu || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      submissions: [],
    }

    db.pekerjaanRumah.unshift(newPr)

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: session.userId,
      action: 'CREATE_HOMEWORK',
      detail: `Guru membuat tugas PR baru: ${judul} untuk kelas ${kelasId}`,
      createdAt: new Date().toISOString(),
    })

    saveSchoolDb(db)

    return NextResponse.json({
      success: true,
      message: 'Tugas pekerjaan rumah berhasil ditambahkan',
      data: newPr,
    })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message: errMessage }, { status: 500 })
  }
}
