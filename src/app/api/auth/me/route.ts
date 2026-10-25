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
  const user = db.users.find((u) => u.id === session.userId || u.username === session.username)

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

  // Graceful fallback from session
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
              id: session.profileId || 'siswa-profile-01',
              namaLengkap: session.namaLengkap || 'Ahmad Fauzi',
              nisn: '0051234567',
              kelas: { id: 'kelas-10-mipa1', namaKelas: 'X MIPA 1' },
            }
            : undefined,
        guruProfile:
          session.role === 'GURU'
            ? {
              id: session.profileId || 'guru-profile-01',
              namaLengkap: session.namaLengkap || 'Budi Santoso, S.Pd.',
              nip: '198501012010011001',
            }
            : undefined,
      },
    },
  })
}
