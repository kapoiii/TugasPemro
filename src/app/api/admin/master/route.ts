import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Memerlukan role ADMIN' },
        { status: 403 }
      )
    }

    const [kelasList, mapelList, guruList] = await Promise.all([
      prisma.kelas.findMany({
        include: {
          waliKelas: {
            select: { id: true, namaLengkap: true, nip: true },
          },
          _count: {
            select: { siswas: true },
          },
        },
        orderBy: { namaKelas: 'asc' },
      }),
      prisma.mataPelajaran.findMany({
        orderBy: { kodeMapel: 'asc' },
      }),
      prisma.guruProfile.findMany({
        select: { id: true, namaLengkap: true, nip: true },
        orderBy: { namaLengkap: 'asc' },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        kelas: kelasList,
        mapel: mapelList,
        guru: guruList,
      },
    })
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
    const { type } = body

    if (type === 'KELAS') {
      const { namaKelas, tingkat, waliKelasId } = body
      if (!namaKelas || !tingkat) {
        return NextResponse.json(
          { success: false, message: 'Nama kelas dan tingkat wajib diisi' },
          { status: 400 }
        )
      }

      const existing = await prisma.kelas.findUnique({ where: { namaKelas } })
      if (existing) {
        return NextResponse.json(
          { success: false, message: 'Kelas dengan nama tersebut sudah ada' },
          { status: 400 }
        )
      }

      const newKelas = await prisma.kelas.create({
        data: {
          namaKelas,
          tingkat,
          waliKelasId: waliKelasId || null,
        },
      })

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: 'CREATE_KELAS',
          detail: `Admin membuat kelas baru: ${namaKelas} (Tingkat ${tingkat})`,
        },
      })

      return NextResponse.json({
        success: true,
        message: `Kelas ${namaKelas} berhasil ditambahkan`,
        data: newKelas,
      })
    }

    if (type === 'MAPEL') {
      const { kodeMapel, namaMapel, kkm } = body
      if (!kodeMapel || !namaMapel) {
        return NextResponse.json(
          { success: false, message: 'Kode mapel dan nama mapel wajib diisi' },
          { status: 400 }
        )
      }

      const existing = await prisma.mataPelajaran.findUnique({ where: { kodeMapel } })
      if (existing) {
        return NextResponse.json(
          { success: false, message: 'Kode mata pelajaran sudah ada' },
          { status: 400 }
        )
      }

      const newMapel = await prisma.mataPelajaran.create({
        data: {
          kodeMapel,
          namaMapel,
          kkm: Number(kkm) || 75.0,
        },
      })

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: 'CREATE_MAPEL',
          detail: `Admin membuat mata pelajaran: ${namaMapel} (${kodeMapel}) KKM ${newMapel.kkm}`,
        },
      })

      return NextResponse.json({
        success: true,
        message: `Mata pelajaran ${namaMapel} berhasil ditambahkan`,
        data: newMapel,
      })
    }

    return NextResponse.json(
      { success: false, message: 'Tipe data master tidak dikenali' },
      { status: 400 }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
