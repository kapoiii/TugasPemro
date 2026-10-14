import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, hashPassword } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Memerlukan role ADMIN' },
        { status: 403 }
      )
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        siswaProfile: {
          select: {
            id: true,
            nis: true,
            nisn: true,
            namaLengkap: true,
            kelas: { select: { namaKelas: true } },
          },
        },
        guruProfile: {
          select: {
            id: true,
            nip: true,
            namaLengkap: true,
            mataPelajaranUtama: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: users })
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

    // Check duplicate username or email
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Username atau Email sudah terdaftar' },
        { status: 400 }
      )
    }

    const passwordHash = await hashPassword(password)

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role,
        ...(role === 'GURU' && {
          guruProfile: {
            create: {
              nip: nip || `NIP-${Date.now().toString().slice(-6)}`,
              namaLengkap: namaLengkap || username,
            },
          },
        }),
        ...(role === 'SISWA' && {
          siswaProfile: {
            create: {
              nis: nis || `NIS-${Date.now().toString().slice(-6)}`,
              nisn: nisn || `00${Date.now().toString().slice(-8)}`,
              namaLengkap: namaLengkap || username,
              jenisKelamin,
              kelasId: kelasId || null,
            },
          },
        }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'CREATE_USER',
        detail: `Admin membuat user baru: ${username} (Role: ${role})`,
      },
    })

    return NextResponse.json({
      success: true,
      message: `User ${username} berhasil dibuat`,
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

    const targetUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    const updateData: { passwordHash?: string; role?: 'ADMIN' | 'GURU' | 'SISWA' } = {}

    if (newPassword && newPassword.trim().length >= 6) {
      updateData.passwordHash = await hashPassword(newPassword)
    }

    if (newRole && ['ADMIN', 'GURU', 'SISWA'].includes(newRole)) {
      updateData.role = newRole
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, username: true, role: true, updatedAt: true },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'UPDATE_USER',
        detail: `Admin mengupdate user ${targetUser.username}: ${
          newPassword ? '[Reset Password] ' : ''
        }${newRole ? `[Ubah Role ke ${newRole}]` : ''}`,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Data user ${updated.username} berhasil diperbarui`,
      data: updated,
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

    const userToDelete = await prisma.user.findUnique({ where: { id: userId } })
    if (!userToDelete) {
      return NextResponse.json(
        { success: false, message: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    await prisma.user.delete({ where: { id: userId } })

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'DELETE_USER',
        detail: `Admin menghapus user ${userToDelete.username} (${userToDelete.role})`,
      },
    })

    return NextResponse.json({
      success: true,
      message: `User ${userToDelete.username} berhasil dihapus`,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
