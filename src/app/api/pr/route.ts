import { NextRequest, NextResponse } from 'next/server'
import { getSchoolDb, saveSchoolDb, PekerjaanRumah, HomeworkSubmission } from '@/lib/schoolStore'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
      )
    }

    const db = getSchoolDb()
    let prList = db.pekerjaanRumah

    let studentProfileId = session.role === 'SISWA' ? session.profileId : undefined
    let studentKelasId: string | undefined
    let studentUser = undefined

    if (session.role === 'SISWA') {
      studentUser = db.users.find(
        (u) =>
          u.id === session.userId ||
          (session.username && u.username?.toLowerCase() === session.username.toLowerCase()) ||
          u.siswaProfile?.id === session.profileId ||
          (session.nisn && u.siswaProfile?.nisn === session.nisn)
      )
      studentProfileId = studentUser?.siswaProfile?.id || session.profileId || session.userId
      studentKelasId =
        studentUser?.siswaProfile?.kelasId || (session as any).kelasId || 'kelas-10-ips2'
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
      const submissionsEnriched = pr.submissions.map((sub: any) => {
        const student = db.users.find(
          (u) =>
            u.siswaProfile?.id === sub.siswaId ||
            u.id === sub.siswaId ||
            (sub.nisn && u.siswaProfile?.nisn === sub.nisn)
        )?.siswaProfile
        return {
          ...sub,
          siswaNama: sub.siswaNama || student?.namaLengkap || 'Siswa',
          nisn: sub.nisn || student?.nisn,
          nis: sub.nis || student?.nis,
        }
      })

      // Detailed student submission matrix (who submitted, who has not)
      const submissionRoster = classStudents.map((st) => {
        const matchSub = submissionsEnriched.find(
          (s: any) =>
            s.siswaId === st.id ||
            s.siswaId === st.userId ||
            s.siswaProfileId === st.id ||
            (s.nisn && s.nisn === st.nisn)
        )
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

      // Robust check if logged-in student has submitted
      const studentSubmission = pr.submissions.find((s: any) => {
        if (!studentProfileId && !session.userId && !session.nisn) return false
        return (
          (studentProfileId && s.siswaId === studentProfileId) ||
          (studentProfileId && s.siswaProfileId === studentProfileId) ||
          (session.userId && (s.siswaId === session.userId || s.userId === session.userId)) ||
          (studentUser?.id && (s.siswaId === studentUser.id || s.userId === studentUser.id)) ||
          (studentUser?.siswaProfile?.id &&
            (s.siswaId === studentUser.siswaProfile.id || s.siswaProfileId === studentUser.siswaProfile.id)) ||
          (session.nisn && s.nisn === session.nisn) ||
          (studentUser?.siswaProfile?.nisn && s.nisn === studentUser.siswaProfile.nisn)
        )
      })

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

    return NextResponse.json(
      { success: true, data: enriched },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
    )
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      { success: false, message: errMessage },
      { status: 500, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
      )
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

      let submission = pr.submissions.find((s) => s.siswaId === siswaId || (s as any).siswaProfileId === siswaId)
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

      return NextResponse.json(
        {
          success: true,
          message: 'Nilai dan evaluasi tugas berhasil disimpan',
          data: submission,
        },
        { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
      )
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

      const studentUser = db.users.find(
        (u) =>
          u.id === session.userId ||
          (session.username && u.username?.toLowerCase() === session.username.toLowerCase()) ||
          u.siswaProfile?.id === session.profileId ||
          (session.nisn && u.siswaProfile?.nisn === session.nisn)
      )
      const studentId = studentUser?.siswaProfile?.id || session.profileId || session.userId
      const studentNisn = studentUser?.siswaProfile?.nisn || session.nisn || ''
      const studentNis = studentUser?.siswaProfile?.nis || (session as any).nis || ''
      const studentNama = studentUser?.siswaProfile?.namaLengkap || session.namaLengkap || session.username

      const existingSubmissionIdx = pr.submissions.findIndex(
        (s: any) =>
          s.siswaId === studentId ||
          s.siswaId === session.userId ||
          (studentUser?.id && s.siswaId === studentUser.id) ||
          (studentUser?.siswaProfile?.id && s.siswaId === studentUser.siswaProfile.id) ||
          (studentNisn && s.nisn === studentNisn)
      )

      const submissionData: HomeworkSubmission & { siswaProfileId?: string; userId?: string; nisn?: string; nis?: string; siswaNama?: string } = {
        siswaId: studentId,
        siswaProfileId: studentUser?.siswaProfile?.id || studentId,
        userId: studentUser?.id || session.userId,
        nisn: studentNisn,
        nis: studentNis,
        siswaNama: studentNama,
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
        detail: `Siswa ${studentNama} menginput tugas PR: ${pr.judul}`,
        createdAt: new Date().toISOString(),
      })

      saveSchoolDb(db)

      return NextResponse.json(
        {
          success: true,
          message: 'Pekerjaan rumah berhasil dikumpulkan!',
          data: submissionData,
        },
        { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
      )
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

    return NextResponse.json(
      {
        success: true,
        message: 'Tugas berhasil dibuat dan dibagikan ke siswa',
        data: newPr,
      },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    )
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      { success: false, message: errMessage },
      { status: 500, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession(request)
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

    return NextResponse.json(
      { success: true, message: 'Tugas berhasil dihapus' },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    )
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json(
      { success: false, message: errMessage },
      { status: 500, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    )
  }
}
