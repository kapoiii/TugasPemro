import bcrypt from 'bcryptjs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://setxdabfnpgcoensaiss.supabase.co'
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNldHhkYWJmbnBnY29lbnNhaXNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTk1NjUwMCwiZXhwIjoyMTA3NTMyNTAwfQ.-OOfoRpavMZu0q7m-4yAOW9oRd3vQ1qN85nBKVB20C4'

function getHeaders() {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
  }
}

export interface SupabaseUserData {
  id: string
  username: string
  email: string
  passwordHash: string
  role: 'ADMIN' | 'GURU' | 'SISWA'
  createdAt: string
  updatedAt: string
  guruProfile?: Array<{
    id: string
    userId: string
    nip: string
    namaLengkap: string
    mataPelajaranUtama?: string
    noHp?: string
  }>
  siswaProfile?: Array<{
    id: string
    userId: string
    nis: string
    nisn: string
    namaLengkap: string
    kelasId: string
    jenisKelamin: string
    alamat?: string
    noHp?: string
  }>
}

/**
 * Fetch all users from Supabase with their associated GuruProfile and SiswaProfile
 */
export async function fetchAllUsersFromSupabase(): Promise<any[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/User?select=id,username,email,passwordHash,role,createdAt,updatedAt,guruProfile:GuruProfile(*),siswaProfile:SiswaProfile(*)`,
      {
        headers: getHeaders(),
        cache: 'no-store',
      }
    )

    if (!res.ok) {
      console.warn('Supabase fetchAllUsers returned status:', res.status)
      return []
    }

    const data = await res.json()
    if (!Array.isArray(data)) return []

    return data.map((u: any) => {
      const gp = Array.isArray(u.guruProfile) && u.guruProfile.length > 0 ? u.guruProfile[0] : u.guruProfile
      const sp = Array.isArray(u.siswaProfile) && u.siswaProfile.length > 0 ? u.siswaProfile[0] : u.siswaProfile

      return {
        id: u.id,
        username: u.username,
        email: u.email,
        password: u.passwordHash,
        role: u.role,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        guruProfile: gp || undefined,
        siswaProfile: sp || undefined,
      }
    })
  } catch (err) {
    console.warn('Failed to fetch users from Supabase:', err)
    return []
  }
}

/**
 * Save / Create User in Supabase directly via REST API
 */
export async function createSupabaseUser(params: {
  id: string
  username: string
  email: string
  plainPassword: string
  role: 'ADMIN' | 'GURU' | 'SISWA'
  namaLengkap?: string
  nip?: string
  nis?: string
  nisn?: string
  kelasId?: string
  jenisKelamin?: 'L' | 'P'
}): Promise<boolean> {
  try {
    const passwordHash = bcrypt.hashSync(params.plainPassword, 10)
    const now = new Date().toISOString()

    // 1. Insert into User table
    const userRes = await fetch(`${SUPABASE_URL}/rest/v1/User?on_conflict=username`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify([
        {
          id: params.id,
          username: params.username,
          email: params.email,
          passwordHash: passwordHash,
          role: params.role,
          createdAt: now,
          updatedAt: now,
        },
      ]),
    })

    if (!userRes.ok) {
      const errText = await userRes.text()
      console.error('Failed to create User in Supabase:', errText)
      return false
    }

    // 2. Insert Profile if Guru or Siswa
    if (params.role === 'GURU') {
      const profileId = `guru-profile-${params.id}`
      await fetch(`${SUPABASE_URL}/rest/v1/GuruProfile?on_conflict=userId`, {
        method: 'POST',
        headers: {
          ...getHeaders(),
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify([
          {
            id: profileId,
            userId: params.id,
            nip: params.nip || `199${Date.now().toString().slice(-10)}`,
            namaLengkap: params.namaLengkap || params.username,
            mataPelajaranUtama: 'Umum',
          },
        ]),
      })
    } else if (params.role === 'SISWA') {
      const profileId = `siswa-profile-${params.id}`
      await fetch(`${SUPABASE_URL}/rest/v1/SiswaProfile?on_conflict=userId`, {
        method: 'POST',
        headers: {
          ...getHeaders(),
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify([
          {
            id: profileId,
            userId: params.id,
            nis: params.nis || `${Date.now().toString().slice(-4)}`,
            nisn: params.nisn || `00${Date.now().toString().slice(-8)}`,
            namaLengkap: params.namaLengkap || params.username,
            kelasId: params.kelasId || 'kelas-10-mipa1',
            jenisKelamin: params.jenisKelamin || 'L',
            alamat: 'Jl. Pendidikan No. 1',
            namaOrangTua: 'Orang Tua Siswa',
            noHp: '081234567890',
          },
        ]),
      })
    }

    return true
  } catch (err) {
    console.error('Error in createSupabaseUser:', err)
    return false
  }
}

/**
 * Update user in Supabase
 */
export async function updateSupabaseUser(
  userId: string,
  updates: { newRole?: 'ADMIN' | 'GURU' | 'SISWA'; newPassword?: string }
): Promise<boolean> {
  try {
    const payload: any = { updatedAt: new Date().toISOString() }
    if (updates.newRole) payload.role = updates.newRole
    if (updates.newPassword && updates.newPassword.trim()) {
      payload.passwordHash = bcrypt.hashSync(updates.newPassword.trim(), 10)
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/User?id=eq.${userId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    })

    return res.ok
  } catch (err) {
    console.error('Error in updateSupabaseUser:', err)
    return false
  }
}

/**
 * Delete user from Supabase
 */
export async function deleteSupabaseUser(userId: string): Promise<boolean> {
  try {
    // Delete profile first
    await fetch(`${SUPABASE_URL}/rest/v1/GuruProfile?userId=eq.${userId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    await fetch(`${SUPABASE_URL}/rest/v1/SiswaProfile?userId=eq.${userId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })

    const res = await fetch(`${SUPABASE_URL}/rest/v1/User?id=eq.${userId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })

    return res.ok
  } catch (err) {
    console.error('Error in deleteSupabaseUser:', err)
    return false
  }
}

/**
 * Find user in Supabase for authentication check
 */
export async function findUserInSupabase(keyword: string): Promise<any | null> {
  try {
    const clean = keyword.trim().toLowerCase()
    
    // 1. Check by username or email
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/User?or=(username.ilike.${clean},email.ilike.${clean})&select=*,guruProfile:GuruProfile(*),siswaProfile:SiswaProfile(*)`,
      {
        headers: getHeaders(),
        cache: 'no-store',
      }
    )

    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        const u = data[0]
        const gp = Array.isArray(u.guruProfile) && u.guruProfile.length > 0 ? u.guruProfile[0] : u.guruProfile
        const sp = Array.isArray(u.siswaProfile) && u.siswaProfile.length > 0 ? u.siswaProfile[0] : u.siswaProfile
        return {
          ...u,
          guruProfile: gp || undefined,
          siswaProfile: sp || undefined,
        }
      }
    }

    // 2. Check by NIP in GuruProfile
    const resGuru = await fetch(
      `${SUPABASE_URL}/rest/v1/GuruProfile?nip=eq.${clean}&select=*,user:User(*)`,
      {
        headers: getHeaders(),
        cache: 'no-store',
      }
    )
    if (resGuru.ok) {
      const dataGuru = await resGuru.json()
      if (Array.isArray(dataGuru) && dataGuru.length > 0 && dataGuru[0].user) {
        return {
          ...dataGuru[0].user,
          guruProfile: dataGuru[0],
        }
      }
    }

    // 3. Check by NISN or NIS in SiswaProfile
    const resSiswa = await fetch(
      `${SUPABASE_URL}/rest/v1/SiswaProfile?or=(nisn.eq.${clean},nis.eq.${clean})&select=*,user:User(*)`,
      {
        headers: getHeaders(),
        cache: 'no-store',
      }
    )
    if (resSiswa.ok) {
      const dataSiswa = await resSiswa.json()
      if (Array.isArray(dataSiswa) && dataSiswa.length > 0 && dataSiswa[0].user) {
        return {
          ...dataSiswa[0].user,
          siswaProfile: dataSiswa[0],
        }
      }
    }

    return null
  } catch (err) {
    console.error('Error finding user in Supabase:', err)
    return null
  }
}
