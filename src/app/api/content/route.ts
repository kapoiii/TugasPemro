import { NextRequest, NextResponse } from 'next/server'
import { getSiteContent, saveSiteContent, SiteContent } from '@/lib/siteContent'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const content = getSiteContent()
    return NextResponse.json({ success: true, data: content })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat konten website'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Hanya Administrator yang diizinkan merubah konten website' },
        { status: 403 }
      )
    }

    const body = (await request.json()) as SiteContent
    if (!body || !body.general || !body.fasilitas) {
      return NextResponse.json(
        { success: false, message: 'Format data konten website tidak valid' },
        { status: 400 }
      )
    }

    const saved = saveSiteContent(body)
    if (!saved) {
      return NextResponse.json(
        { success: false, message: 'Gagal menyimpan perubahan ke sistem' },
        { status: 500 }
      )
    }

    // Try logging audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: 'UPDATE_WEBSITE_CONTENT',
          detail: `Admin ${session.username} memperbarui konten & foto website resmi.`,
        },
      })
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      message: 'Konten dan foto website resmi berhasil diperbarui secara instan!',
      data: body,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error saat menyimpan konten'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
