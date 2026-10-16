import { NextRequest, NextResponse } from 'next/server'
import { getSchoolDb, saveSchoolDb, UserAccount } from '@/lib/schoolStore'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Memerlukan role ADMIN' },
        { status: 403 }
      )
    }

    const db = getSchoolDb()

    const usersWithDetails = db.users.map((u) => {
      let siswaProfile = u.siswaProfile
      if (siswaProfile) {
        const k = db.kelas.find((kls) => kls.id === siswaProfile?.kelasId)
        siswaProfile = {
          ...siswaProfile,
          kelas: k ? { id: k.id, namaKelas: k.namaKelas } : undefined,
        } as typeof siswaProfile & { kelas?: { id: string; namaKelas: string } }
      }

      return {
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        siswaProfile,
        guruProfile: u.guruProfile,
      }
    })

    return NextResponse.json({ success: true, data: usersWithDetails })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Memerlukan role ADMIN' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      username,
      email,
      password,
      role = 'GURU',
      namaLengkap,
      nip,
      nis,
      nisn,
      kelasId,
      jenisKelamin = 'L',
    } = body

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Username, email, dan password wajib diisi' },
        { status: 400 }
      )
    }

    const cleanUsername = String(username).trim()
    const cleanEmail = String(email).trim()
    const cleanPassword = String(password).trim()
    const cleanRole = (['ADMIN', 'GURU', 'SISWA'].includes(role) ? role : 'GURU') as 'ADMIN' | 'GURU' | 'SISWA'

    const db = getSchoolDb()

    // Check duplicate username or email
    const existing = db.users.find(
      (u) =>
        u.username.toLowerCase() === cleanUsername.toLowerCase() ||
        u.email.toLowerCase() === cleanEmail.toLowerCase()
    )

    if (existing) {
      return NextResponse.json(
        { success: false, message: `Username "${cleanUsername}" atau Email "${cleanEmail}" sudah terdaftar` },
        { status: 400 }
      )
    }

    const newUserId = `usr-${Date.now()}`
    const nowStr = new Date().toISOString()

    const newUser: UserAccount = {
      id: newUserId,
      username: cleanUsername,
      email: cleanEmail,
      password: cleanPassword,
      role: cleanRole,
      createdAt: nowStr,
      updatedAt: nowStr,
    }

    if (cleanRole === 'GURU') {
      newUser.guruProfile = {
        id: `guru-profile-${newUserId}`,
        userId: newUserId,
        nip: nip ? String(nip).trim() : `199${Date.now().toString().slice(-10)}`,
        namaLengkap: namaLengkap ? String(namaLengkap).trim() : cleanUsername,
        mataPelajaranUtama: 'Umum',
      }
    } else if (cleanRole === 'SISWA') {
      newUser.siswaProfile = {
        id: `siswa-profile-${newUserId}`,
        userId: newUserId,
        nis: nis ? String(nis).trim() : `${Date.now().toString().slice(-4)}`,
        nisn: nisn ? String(nisn).trim() : `00${Date.now().toString().slice(-8)}`,
        namaLengkap: namaLengkap ? String(namaLengkap).trim() : cleanUsername,
        kelasId: kelasId || 'kelas-10-mipa1',
        jenisKelamin: jenisKelamin === 'P' ? 'P' : 'L',
      }
    }

    // Save immediately to persistent store
    db.users.push(newUser)
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: session.userId,
      action: 'CREATE_USER',
      detail: `Admin membuat user baru: ${cleanUsername} (${cleanRole} - ${namaLengkap || cleanUsername})`,
      createdAt: nowStr,
    })

    saveSchoolDb(db)

    // Optional background sync to Prisma database if connected
    try {
      const passwordHash = bcrypt.hashSync(cleanPassword, 10)
      await prisma.user.create({
        data: {
          id: newUserId,
          username: cleanUsername,
          email: cleanEmail,
          passwordHash: passwordHash,
          role: cleanRole,
          ...(cleanRole === 'GURU' && newUser.guruProfile
            ? {
                guruProfile: {
                  create: {
                    nip: newUser.guruProfile.nip,
                    namaLengkap: newUser.guruProfile.namaLengkap,
                    mataPelajaranUtama: newUser.guruProfile.mataPelajaranUtama,
                  },
                },
              }
            : cleanRole === 'SISWA' && newUser.siswaProfile
            ? {
                siswaProfile: {
                  create: {
                    nis: newUser.siswaProfile.nis,
                    nisn: newUser.siswaProfile.nisn,
                    namaLengkap: newUser.siswaProfile.namaLengkap,
                    kelasId: newUser.siswaProfile.kelasId,
                    jenisKelamin: newUser.siswaProfile.jenisKelamin,
                  },
                },
              }
            : {}),
        },
      })
    } catch {
      // Prisma sync is best-effort fallback
    }

    return NextResponse.json({
      success: true,
      message: `Akun ${cleanUsername} (${cleanRole}) berhasil disimpan ke database dan langsung dapat digunakan untuk login!`,
      data: newUser,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Memerlukan role ADMIN' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, newPassword, newRole } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID wajib disertakan' },
        { status: 400 }
      )
    }

    const db = getSchoolDb()
    const target = db.users.find((u) => u.id === userId)
    if (!target) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    if (newPassword && String(newPassword).trim().length >= 4) {
      target.password = String(newPassword).trim()
    }

    if (newRole && ['ADMIN', 'GURU', 'SISWA'].includes(newRole)) {
      target.role = newRole
    }

    target.updatedAt = new Date().toISOString()

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: session.userId,
      action: 'UPDATE_USER',
      detail: `Admin memperbarui user ${target.username}: ${newPassword ? '[Reset Password] ' : ''}${newRole ? `[Ubah Role: ${newRole}]` : ''}`,
      createdAt: new Date().toISOString(),
    })

    saveSchoolDb(db)

    // Optional Prisma sync
    try {
      const updateData: { role?: 'ADMIN' | 'GURU' | 'SISWA'; passwordHash?: string } = {}
      if (newRole) updateData.role = newRole
      if (newPassword) updateData.passwordHash = bcrypt.hashSync(String(newPassword).trim(), 10)
      await prisma.user.update({
        where: { id: userId },
        data: updateData,
      })
    } catch {
      // Prisma sync is best-effort fallback
    }

    return NextResponse.json({
      success: true,
      message: `Data user ${target.username} berhasil diperbarui di database`,
      data: target,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Memerlukan role ADMIN' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID wajib disertakan' },
        { status: 400 }
      )
    }

    if (userId === session.userId) {
      return NextResponse.json(
        { success: false, message: 'Anda tidak dapat menghapus akun Anda sendiri' },
        { status: 400 }
      )
    }

    const db = getSchoolDb()
    const userIndex = db.users.findIndex((u) => u.id === userId)
    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    const deletedUser = db.users.splice(userIndex, 1)[0]

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: session.userId,
      action: 'DELETE_USER',
      detail: `Admin menghapus user ${deletedUser.username} (${deletedUser.role})`,
      createdAt: new Date().toISOString(),
    })

    saveSchoolDb(db)

    // Optional Prisma sync
    try {
      await prisma.user.delete({ where: { id: userId } })
    } catch {
      // Prisma sync is best-effort fallback
    }

    return NextResponse.json({
      success: true,
      message: `User ${deletedUser.username} berhasil dihapus dari database`,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
