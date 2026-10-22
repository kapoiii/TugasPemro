import { NextRequest, NextResponse } from 'next/server'
import { getSchoolDb } from '@/lib/schoolStore'
import { fetchAllUsersFromSupabase } from '@/lib/supabaseDb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kelasId = searchParams.get('kelasId')
    const db = getSchoolDb()

    // 1. Fetch live users from Supabase Cloud to ensure newly created students appear instantly
    const supabaseUsers = await fetchAllUsersFromSupabase()

    const userMap = new Map<string, any>()
    db.users.forEach((u) => userMap.set(u.id, u))
    supabaseUsers.forEach((su) => userMap.set(su.id, su))
    const mergedUsers = Array.from(userMap.values())

    let students = mergedUsers
      .filter((u) => u.role === 'SISWA' && u.siswaProfile)
      .map((u) => {
        const k = db.kelas.find((kls) => kls.id === u.siswaProfile?.kelasId)
        const displayPassword =
          u.rawPassword || u.password || `siswa${u.siswaProfile?.nis || '123'}`

        return {
          id: u.siswaProfile!.id,
          userId: u.id,
          namaLengkap: u.siswaProfile!.namaLengkap,
          nis: u.siswaProfile!.nis,
          nisn: u.siswaProfile!.nisn,
          kelasId: u.siswaProfile!.kelasId,
          jenisKelamin: u.siswaProfile!.jenisKelamin || 'L',
          noHp: u.siswaProfile!.noHp || '-',
          alamat: u.siswaProfile!.alamat || '-',
          namaOrangTua: u.siswaProfile!.namaOrangTua || '-',
          password: displayPassword,
          kelas: k ? { id: k.id, namaKelas: k.namaKelas, tingkat: k.tingkat } : undefined,
          user: { username: u.username, email: u.email },
        }
      })

    if (kelasId && kelasId !== 'Semua') {
      students = students.filter((s) => s.kelasId === kelasId)
    }

    return NextResponse.json({
      success: true,
      count: students.length,
      data: students,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
