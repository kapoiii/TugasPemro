import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const nisn = searchParams.get('nisn')

    if (nisn) {
      const pendaftaran = await prisma.pPDB.findUnique({
        where: { nisn },
      })
      if (!pendaftaran) {
        return NextResponse.json({ success: false, message: 'Data pendaftaran tidak ditemukan' }, { status: 404 })
      }
      return NextResponse.json({ success: true, data: pendaftaran })
    }

    // Role verification for listing all PPDB applicants
    const session = await getSession()
    if (!session || (session.role !== 'GURU' && session.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak' }, { status: 403 })
    }

    const listPPDB = await prisma.pPDB.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: listPPDB })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      namaLengkap,
      nisn,
      tempatLahir,
      tanggalLahir,
      jenisKelamin,
      agama,
      alamat,
      namaAyah,
      namaIbu,
      noHp,
      pilihanJurusan,
      berkasIjazahUrl,
      berkasKkUrl,
      berkasAkteUrl,
    } = body

    if (!namaLengkap || !nisn || !tanggalLahir || !noHp || !pilihanJurusan) {
      return NextResponse.json({ success: false, message: 'Field wajib belum diisi' }, { status: 400 })
    }

    // Check duplicate NISN
    const existing = await prisma.pPDB.findUnique({ where: { nisn } })
    if (existing) {
      return NextResponse.json({ success: false, message: 'NISN sudah pernah terdaftar' }, { status: 400 })
    }

    const count = await prisma.pPDB.count()
    const noPendaftaran = `PPDB-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`

    const newPPDB = await prisma.pPDB.create({
      data: {
        noPendaftaran,
        namaLengkap,
        nisn,
        tempatLahir,
        tanggalLahir: new Date(tanggalLahir),
        jenisKelamin,
        agama,
        alamat,
        namaAyah,
        namaIbu,
        noHp,
        pilihanJurusan,
        berkasIjazahUrl,
        berkasKkUrl,
        berkasAkteUrl,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Pendaftaran PPDB berhasil diajukan',
      data: newPPDB,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 })
  }
}
