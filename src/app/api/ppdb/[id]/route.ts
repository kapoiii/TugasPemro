import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'GURU' && session.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, catatan } = body

    if (!['PENDING', 'DITERIMA', 'DITOLAK'].includes(status)) {
      return NextResponse.json({ success: false, message: 'Status tidak valid' }, { status: 400 })
    }

    const updated = await prisma.pPDB.update({
      where: { id },
      data: {
        status,
        catatan,
        verifierId: session.userId,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'VERIFIKASI_PPDB',
        detail: `Mengubah status PPDB ${updated.noPendaftaran} (${updated.namaLengkap}) menjadi ${status}`,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Status pendaftaran berhasil diubah menjadi ${status}`,
      data: updated,
    })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message: errMessage }, { status: 500 })
  }
}
