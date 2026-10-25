import { NextRequest, NextResponse } from 'next/server'
import { getSchoolDb, saveSchoolDb, PekerjaanRumah, HomeworkSubmission } from '@/lib/schoolStore'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
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

      // All students enrolled in this class
      const classStudents = db.users
        .filter((u) => u.role === 'SISWA' && u.siswaProfile && u.siswaProfile.kelasId === pr.kelasId)
        .map((u) => u.siswaProfile!)

      // Enriched submissions
      const submissionsEnriched = pr.submissions.map((sub) => {
        const student = db.users.find((u) => u.siswaProfile?.id === sub.siswaId)?.siswaProfile
        return {
          ...sub,
          siswaNama: student?.namaLengkap || 'Siswa',
          nisn: student?.nisn,
          nis: student?.nis,
        }
      })

      // Detailed student submission matrix (who submitted, who has not)
      const submissionRoster = classStudents.map((st) => {
        const matchSub = submissionsEnriched.find((s) => s.siswaId === st.id)
        return {
          siswaId: st.id,
          namaLengkap: st.namaLengkap,
          nisn: st.nisn,
          nis: st.nis,
          isSubmitted: !!matchSub,
          submittedAt: matchSub?.submittedAt,
          submissionText: matchSub?.submissionText,
          fileUrl: matchSub?.fileUrl,
          status: matchSub?.status || 'UNSUBMITTED',
          nilai: matchSub?.nilai,
          catatanGuru: matchSub?.catatanGuru,
        }
      })

      const totalSiswa = classStudents.length
      const sudahMengumpulkan = pr.submissions.length
      const belumMengumpulkan = Math.max(0, totalSiswa - sudahMengumpulkan)
      const belumDinilai = pr.submissions.filter((s) => s.status !== 'GRADED').length
      const isOverdue = new Date() > new Date(pr.tenggatWaktu)

      // Check if logged-in student has submitted
      const studentSubmission = studentProfileId
        ? pr.submissions.find((s) => s.siswaId === studentProfileId)
        : undefined

      return {
        ...pr,
        mapel,
        kelas,
        guru,
        totalSiswa,
        sudahMengumpulkan,
        belumMengumpulkan,
        belumDinilai,
        isOverdue,
        submissions: submissionsEnriched,
        submissionRoster,
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
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const db = getSchoolDb()

    // 1. GURU GRADING A SUBMISSION
    if (body.action === 'GRADE_SUBMISSION') {
      if (session.role !== 'GURU' && session.role !== 'ADMIN') {
        return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 })
      }

      const { prId, siswaId, nilai, catatanGuru } = body
      if (!prId || !siswaId) {
        return NextResponse.json({ success: false, message: 'ID tugas dan siswa diperlukan' }, { status: 400 })
      }

      const scoreNum = Number(nilai)
      if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
        return NextResponse.json({ success: false, message: 'Nilai harus dalam rentang 0 - 100' }, { status: 400 })
      }

      const pr = db.pekerjaanRumah.find((p) => p.id === prId)
      if (!pr) {
        return NextResponse.json({ success: false, message: 'Tugas tidak ditemukan' }, { status: 404 })
      }

      let submission = pr.submissions.find((s) => s.siswaId === siswaId)
      if (!submission) {
        // If student hasn't formally uploaded file but teacher wants to assign a grade
        submission = {
          siswaId,
          submissionText: 'Dinilai langsung oleh guru',
          submittedAt: new Date().toISOString(),
          status: 'GRADED',
          nilai: scoreNum,
          catatanGuru: catatanGuru || '',
        }
        pr.submissions.push(submission)
      } else {
        submission.status = 'GRADED'
        submission.nilai = scoreNum
        submission.catatanGuru = catatanGuru || ''
      }

      db.auditLogs.unshift({
        id: `log-${Date.now()}`,
        userId: session.userId,
        action: 'GRADE_HOMEWORK',
        detail: `Guru memberikan nilai ${scoreNum} kepada siswa ${siswaId} untuk tugas ${pr.judul}`,
        createdAt: new Date().toISOString(),
      })

      saveSchoolDb(db)

      return NextResponse.json({
        success: true,
        message: 'Nilai dan evaluasi tugas berhasil disimpan',
        data: submission,
      })
    }

    // 2. SISWA SUBMITTING HOMEWORK
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

      const submissionData: HomeworkSubmission = {
        siswaId: studentId,
        submissionText: submissionText || 'Tugas telah dikerjakan dan diunggah.',
        fileUrl: fileUrl || '',
        submittedAt: new Date().toISOString(),
        status: 'SUBMITTED',
      }

      if (existingSubmissionIdx !== -1) {
        pr.submissions[existingSubmissionIdx] = {
          ...pr.submissions[existingSubmissionIdx],
          ...submissionData,
        }
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

    // 3. GURU OR ADMIN CREATING HOMEWORK
    const { judul, deskripsi, mapelId, kelasId, tenggatWaktu } = body
    if (!judul || !mapelId || !kelasId) {
      return NextResponse.json({ success: false, message: 'Data tugas tidak lengkap' }, { status: 400 })
    }

    const newPr: PekerjaanRumah = {
      id: `pr-${Date.now()}`,
      judul: judul.trim(),
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
      detail: `Guru membuat tugas baru: ${judul} untuk kelas ${kelasId}`,
      createdAt: new Date().toISOString(),
    })

    saveSchoolDb(db)

    return NextResponse.json({
      success: true,
      message: 'Tugas berhasil dibuat dan dibagikan ke siswa',
      data: newPr,
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
      return NextResponse.json({ success: false, message: 'ID tugas diperlukan' }, { status: 400 })
    }

    const db = getSchoolDb()
    const idx = db.pekerjaanRumah.findIndex((p) => p.id === id)
    if (idx === -1) {
      return NextResponse.json({ success: false, message: 'Tugas tidak ditemukan' }, { status: 404 })
    }

    db.pekerjaanRumah.splice(idx, 1)
    saveSchoolDb(db)

    return NextResponse.json({ success: true, message: 'Tugas berhasil dihapus' })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message: errMessage }, { status: 500 })
  }
}
