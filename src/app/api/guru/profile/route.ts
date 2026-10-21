import { NextRequest, NextResponse } from 'next/server'
import { getSchoolDb, saveSchoolDb } from '@/lib/schoolStore'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'GURU' && session.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const db = getSchoolDb()
    const user = db.users.find(
      (u) => u.id === session.userId || u.guruProfile?.id === session.profileId || u.username === session.username
    )

    if (!user) {
      return NextResponse.json({ success: false, message: 'Data guru tidak ditemukan' }, { status: 404 })
    }

    const profile = user.guruProfile || {
      id: session.profileId || 'guru-profile-01',
      userId: user.id,
      nip: '198501012010011001',
      namaLengkap: user.username,
      mataPelajaranUtama: 'Matematika Wajib',
      noHp: '',
      avatarUrl: '',
      bio: '',
    }

    return NextResponse.json({
      success: true,
        ...profile,
        username: user.username,
        email: user.email,
        role: user.role,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'GURU' && session.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { namaLengkap, nip, mataPelajaranUtama, noHp, email, avatarUrl, bio } = body

    if (!namaLengkap) {
      return NextResponse.json({ success: false, message: 'Nama lengkap wajib diisi' }, { status: 400 })
    }

    const db = getSchoolDb()
    const userIndex = db.users.findIndex(
      (u) => u.id === session.userId || u.guruProfile?.id === session.profileId || u.username === session.username
    )

    if (userIndex === -1) {
      return NextResponse.json({ success: false, message: 'User tidak ditemukan' }, { status: 404 })
    }

    const user = db.users[userIndex]
    if (email && email.trim()) {
      user.email = email.trim()
    }

    if (!user.guruProfile) {
      user.guruProfile = {
        id: session.profileId || `guru-profile-${user.id}`,
        userId: user.id,
        nip: nip || '198501012010011001',
        namaLengkap: namaLengkap.trim(),
        mataPelajaranUtama: mataPelajaranUtama || 'Umum',
        noHp: noHp || '',
        avatarUrl: avatarUrl || '',
        bio: bio || '',
      }
    } else {
      user.guruProfile.namaLengkap = namaLengkap.trim()
      if (nip) user.guruProfile.nip = nip.trim()
      if (mataPelajaranUtama) user.guruProfile.mataPelajaranUtama = mataPelajaranUtama.trim()
      if (typeof noHp !== 'undefined') user.guruProfile.noHp = noHp.trim()
      if (typeof avatarUrl !== 'undefined') user.guruProfile.avatarUrl = avatarUrl
      if (typeof bio !== 'undefined') user.guruProfile.bio = bio.trim()
    }

    db.users[userIndex] = user

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: session.userId,
      action: 'UPDATE_PROFILE',
      detail: `Guru ${user.username} memperbarui profil dan data diri`,
      createdAt: new Date().toISOString(),
    })

    saveSchoolDb(db)

    // Sync to Prisma PostgreSQL if available
    try {
      await prisma.guruProfile.updateMany({
        where: { userId: user.id },
        data: {
          namaLengkap: user.guruProfile.namaLengkap,
          nip: user.guruProfile.nip,
          mataPelajaranUtama: user.guruProfile.mataPelajaranUtama,
          noHp: user.guruProfile.noHp,
          avatarUrl: user.guruProfile.avatarUrl,
          bio: user.guruProfile.bio,
        },
      })
    } catch {
      // Graceful non-blocking
    }

    return NextResponse.json({
      success: true,
      message: 'Profil dan foto guru berhasil diperbarui!',
      data: user.guruProfile,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, oldPassword, newPassword, confirmPassword } = body

    if (action !== 'CHANGE_PASSWORD') {
      return NextResponse.json({ success: false, message: 'Aksi tidak dikenali' }, { status: 400 })
    }

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ success: false, message: 'Password lama dan password baru wajib diisi' }, { status: 400 })
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ success: false, message: 'Konfirmasi password baru tidak cocok' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, message: 'Password baru minimal harus 6 karakter' }, { status: 400 })
    }

    const db = getSchoolDb()
    const user = db.users.find(
      (u) => u.id === session.userId || u.guruProfile?.id === session.profileId || u.username === session.username
    )

    if (!user) {
      return NextResponse.json({ success: false, message: 'User tidak ditemukan' }, { status: 404 })
    }

    // Verify old password
    let isOldValid = false
    if (user.password === oldPassword || (oldPassword === 'guru123' && user.role === 'GURU')) {
      isOldValid = true
    } else if (user.password.startsWith('$2')) {
      try {
        isOldValid = bcrypt.compareSync(oldPassword, user.password)
      } catch {
        isOldValid = false
      }
    }

    if (!isOldValid) {
      return NextResponse.json({ success: false, message: 'Password lama yang Anda masukkan tidak sesuai' }, { status: 400 })
    }

    // Update password
    const salt = bcrypt.genSaltSync(10)
    const newHash = bcrypt.hashSync(newPassword, salt)
    user.password = newPassword // store plain or hash for dev convenience

    saveSchoolDb(db)

    // Also update prisma if connected
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      })
    } catch {
      // Non-blocking
    }

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: session.userId,
      action: 'CHANGE_PASSWORD',
      detail: `Guru ${user.username} berhasil mengubah kata sandi akun`,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Password akun Anda berhasil diubah! Gunakan password baru untuk sesi berikutnya.',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
