import { NextRequest, NextResponse } from 'next/server'
import { getSchoolDb, saveSchoolDb, Kelas, MataPelajaran, JadwalPelajaran } from '@/lib/schoolStore'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak' },
        { status: 403 }
      )
    }

    const db = getSchoolDb()

    // Enrich kelas with count of students and wali kelas info
    const kelasList = db.kelas.map((k) => {
      const waliUser = db.users.find((u) => u.guruProfile?.id === k.waliKelasId)
      const countSiswa = db.users.filter((u) => u.siswaProfile?.kelasId === k.id).length
      return {
        ...k,
        waliKelas: waliUser?.guruProfile ? { id: waliUser.guruProfile.id, namaLengkap: waliUser.guruProfile.namaLengkap, nip: waliUser.guruProfile.nip } : undefined,
        _count: { siswas: countSiswa },
      }
    })

    const guruList = db.users
      .filter((u) => u.role === 'GURU' && u.guruProfile)
      .map((u) => ({
        id: u.guruProfile!.id,
        namaLengkap: u.guruProfile!.namaLengkap,
        nip: u.guruProfile!.nip,
      }))

    return NextResponse.json({
      success: true,
      data: {
        kelas: kelasList,
        mapel: db.mapel,
        guru: guruList,
        jadwal: db.jadwal,
        settings: db.settings,
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
    const db = getSchoolDb()

    if (type === 'KELAS') {
      const { namaKelas, tingkat, waliKelasId } = body
      if (!namaKelas || !tingkat) {
        return NextResponse.json(
          { success: false, message: 'Nama kelas dan tingkat wajib diisi' },
          { status: 400 }
        )
      }

      const existing = db.kelas.find((k) => k.namaKelas.toLowerCase() === namaKelas.trim().toLowerCase())
      if (existing) {
        return NextResponse.json(
          { success: false, message: 'Kelas dengan nama tersebut sudah ada' },
          { status: 400 }
        )
      }

      const newKelas: Kelas = {
        id: `kelas-${Date.now()}`,
        namaKelas: namaKelas.trim(),
        tingkat: String(tingkat).trim(),
        waliKelasId: waliKelasId || undefined,
      }

      db.kelas.push(newKelas)
      db.auditLogs.unshift({
        id: `log-${Date.now()}`,
        userId: session.userId,
        action: 'CREATE_KELAS',
        detail: `Admin membuat kelas: ${namaKelas} (Tingkat ${tingkat})`,
        createdAt: new Date().toISOString(),
      })

      saveSchoolDb(db)

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

      const existing = db.mapel.find((m) => m.kodeMapel.toLowerCase() === kodeMapel.trim().toLowerCase())
      if (existing) {
        return NextResponse.json(
          { success: false, message: 'Kode mata pelajaran sudah ada' },
          { status: 400 }
        )
      }

      const newMapel: MataPelajaran = {
        id: `mapel-${Date.now()}`,
        kodeMapel: kodeMapel.trim().toUpperCase(),
        namaMapel: namaMapel.trim(),
        kkm: Number(kkm) || 75.0,
      }

      db.mapel.push(newMapel)
      db.auditLogs.unshift({
        id: `log-${Date.now()}`,
        userId: session.userId,
        action: 'CREATE_MAPEL',
        detail: `Admin membuat mata pelajaran: ${namaMapel} (${newMapel.kodeMapel}) KKM ${newMapel.kkm}`,
        createdAt: new Date().toISOString(),
      })

      saveSchoolDb(db)

      return NextResponse.json({
        success: true,
        message: `Mata pelajaran ${namaMapel} berhasil ditambahkan`,
        data: newMapel,
      })
    }

    if (type === 'JADWAL') {
      const { hari, jamMulai, jamSelesai, kelasId, mapelId, guruId, ruangan } = body
      if (!hari || !jamMulai || !jamSelesai || !kelasId || !mapelId) {
        return NextResponse.json(
          { success: false, message: 'Data jadwal pelajaran belum lengkap' },
          { status: 400 }
        )
      }

      const newJadwal: JadwalPelajaran = {
        id: `jadwal-${Date.now()}`,
        hari,
        jamMulai,
        jamSelesai,
        kelasId,
        mapelId,
        guruId: guruId || 'guru-profile-01',
        ruangan: ruangan || 'Ruang Kelas',
      }

      db.jadwal.push(newJadwal)
      db.auditLogs.unshift({
        id: `log-${Date.now()}`,
        userId: session.userId,
        action: 'CREATE_JADWAL',
        detail: `Admin membuat jadwal: ${hari} (${jamMulai}-${jamSelesai}) ${newJadwal.ruangan}`,
        createdAt: new Date().toISOString(),
      })

      saveSchoolDb(db)

      return NextResponse.json({
        success: true,
        message: `Jadwal berhasil ditambahkan`,
        data: newJadwal,
      })
    }

    if (type === 'SETTINGS') {
      const { pembagianRaportDibuka, tanggalPembagianRaport } = body
      if (typeof pembagianRaportDibuka === 'boolean') {
        db.settings.pembagianRaportDibuka = pembagianRaportDibuka
      }
      if (tanggalPembagianRaport) {
        db.settings.tanggalPembagianRaport = tanggalPembagianRaport
      }

      db.auditLogs.unshift({
        id: `log-${Date.now()}`,
        userId: session.userId,
        action: 'UPDATE_SETTINGS',
        detail: `Admin mengubah pengaturan raport: Pembagian Raport Dibuka = ${db.settings.pembagianRaportDibuka}`,
        createdAt: new Date().toISOString(),
      })

      saveSchoolDb(db)

      return NextResponse.json({
        success: true,
        message: `Pengaturan berhasil disimpan`,
        data: db.settings,
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
