import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getSchoolDb } from '@/lib/schoolStore'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Tidak terautentikasi' },
      { status: 401 }
    )
  }

  const db = getSchoolDb()
  const user = db.users.find(
    (u) =>
      u.id === session.userId ||
      (session.username && u.username?.toLowerCase() === session.username.toLowerCase()) ||
      (session.profileId && (u.siswaProfile?.id === session.profileId || u.guruProfile?.id === session.profileId)) ||
      (session.nisn && u.siswaProfile?.nisn === session.nisn) ||
      (session.nip && u.guruProfile?.nip === session.nip)
  )

  if (user) {
    let siswaProfile = user.siswaProfile
    if (user.role === 'SISWA' && siswaProfile) {
      const kelas = db.kelas.find((k) => k.id === siswaProfile?.kelasId)
      siswaProfile = {
        ...siswaProfile,
        kelas: kelas ? { id: kelas.id, namaKelas: kelas.namaKelas } : undefined,
      } as typeof siswaProfile & { kelas?: { id: string; namaKelas: string } }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...session,
        profileId: session.profileId || user.siswaProfile?.id || user.guruProfile?.id,
        namaLengkap: user.siswaProfile?.namaLengkap || user.guruProfile?.namaLengkap || session.namaLengkap || user.username,
        details: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          siswaProfile,
          guruProfile: user.guruProfile,
        },
      },
    })
  }

  // Graceful fallback purely constructed from verified session data
  const fallbackKelas = session.kelasId ? db.kelas.find((k) => k.id === session.kelasId) : undefined

  return NextResponse.json({
    success: true,
    data: {
      ...session,
      details: {
        id: session.userId,
        username: session.username,
        role: session.role,
        siswaProfile:
          session.role === 'SISWA'
            ? {
              id: session.profileId || `siswa-profile-${session.userId}`,
              namaLengkap: session.namaLengkap || session.username,
              nisn: session.nisn || '',
              nis: session.nis || '',
              kelasId: session.kelasId || fallbackKelas?.id,
              kelas: {
                id: session.kelasId || fallbackKelas?.id || '',
                namaKelas: session.kelasNama || fallbackKelas?.namaKelas || 'Kelas Terdaftar',
              },
            }
            : undefined,
        guruProfile:
          session.role === 'GURU'
            ? {
              id: session.profileId || `guru-profile-${session.userId}`,
              namaLengkap: session.namaLengkap || session.username,
              nip: session.nip || '',
            }
            : undefined,
      },
    },
  })
}
