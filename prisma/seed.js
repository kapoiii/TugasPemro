const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // 1. Create Default Classes
  const kelas10 = await prisma.kelas.upsert({
    where: { namaKelas: 'X MIPA 1' },
    update: {},
    create: {
      namaKelas: 'X MIPA 1',
      tingkat: '10',
    },
  })

  const kelas11 = await prisma.kelas.upsert({
    where: { namaKelas: 'XI MIPA 1' },
    update: {},
    create: {
      namaKelas: 'XI MIPA 1',
      tingkat: '11',
    },
  })

  const kelas12 = await prisma.kelas.upsert({
    where: { namaKelas: 'XII MIPA 1' },
    update: {},
    create: {
      namaKelas: 'XII MIPA 1',
      tingkat: '12',
    },
  })

  console.log('✅ Classes created:', kelas10.namaKelas, kelas11.namaKelas, kelas12.namaKelas)

  // 2. Create Default Subjects
  const mapels = [
    { kodeMapel: 'MTK-10', namaMapel: 'Matematika Wajib', kkm: 75.0 },
    { kodeMapel: 'BIN-10', namaMapel: 'Bahasa Indonesia', kkm: 75.0 },
    { kodeMapel: 'ING-10', namaMapel: 'Bahasa Inggris', kkm: 75.0 },
    { kodeMapel: 'FIS-10', namaMapel: 'Fisika', kkm: 75.0 },
    { kodeMapel: 'KIM-10', namaMapel: 'Kimia', kkm: 75.0 },
  ]

  for (const m of mapels) {
    await prisma.mataPelajaran.upsert({
      where: { kodeMapel: m.kodeMapel },
      update: {},
      create: m,
    })
  }
  console.log('✅ Subjects created:', mapels.map((m) => m.kodeMapel).join(', '))

  // 3. Create Superadmin User
  const adminSalt = await bcrypt.genSalt(10)
  const adminPasswordHash = await bcrypt.hash('admin123', adminSalt)

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { role: 'ADMIN', passwordHash: adminPasswordHash },
    create: {
      username: 'admin',
      email: 'admin@sekolah.sch.id',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  })
  console.log('✅ Superadmin created: admin / admin123')

  // 4. Create Guru User
  const guruSalt = await bcrypt.genSalt(10)
  const guruPasswordHash = await bcrypt.hash('guru123', guruSalt)

  const guruUser = await prisma.user.upsert({
    where: { username: 'guru1' },
    update: { role: 'GURU', passwordHash: guruPasswordHash },
    create: {
      username: 'guru1',
      email: 'budi.santoso@sekolah.sch.id',
      passwordHash: guruPasswordHash,
      role: 'GURU',
      guruProfile: {
        create: {
          nip: '198501012010011001',
          namaLengkap: 'Budi Santoso, S.Pd.',
          mataPelajaranUtama: 'Matematika',
          noHp: '081234567890',
        },
      },
    },
    include: { guruProfile: true },
  })

  // Assign guru1 as Wali Kelas for X MIPA 1
  if (guruUser.guruProfile) {
    await prisma.kelas.update({
      where: { id: kelas10.id },
      data: { waliKelasId: guruUser.guruProfile.id },
    })
  }
  console.log('✅ Guru created: guru1 / guru123 (Wali Kelas X MIPA 1)')

  // 5. Create Siswa User
  const siswaSalt = await bcrypt.genSalt(10)
  const siswaPasswordHash = await bcrypt.hash('siswa123', siswaSalt)

  const siswaUser = await prisma.user.upsert({
    where: { username: 'siswa1' },
    update: { role: 'SISWA', passwordHash: siswaPasswordHash },
    create: {
      username: 'siswa1',
      email: 'ahmad.fauzi@siswa.sch.id',
      passwordHash: siswaPasswordHash,
      role: 'SISWA',
      siswaProfile: {
        create: {
          nis: '1001',
          nisn: '0051234567',
          namaLengkap: 'Ahmad Fauzi',
          kelasId: kelas10.id,
          jenisKelamin: 'L',
          tempatLahir: 'Jakarta',
          tanggalLahir: new Date('2008-05-14'),
          alamat: 'Jl. Merdeka No. 45, Jakarta',
          namaOrangTua: 'H. Fauzi',
          noHp: '085712345678',
        },
      },
    },
    include: { siswaProfile: true },
  })
  console.log('✅ Siswa created: siswa1 / siswa123 (NISN: 0051234567, X MIPA 1)')

  // 6. Create More Students for demo
  const siswa2 = await prisma.user.upsert({
    where: { username: 'siswa2' },
    update: { role: 'SISWA', passwordHash: siswaPasswordHash },
    create: {
      username: 'siswa2',
      email: 'siti.aisyah@siswa.sch.id',
      passwordHash: siswaPasswordHash,
      role: 'SISWA',
      siswaProfile: {
        create: {
          nis: '1002',
          nisn: '0051234568',
          namaLengkap: 'Siti Aisyah',
          kelasId: kelas10.id,
          jenisKelamin: 'P',
          tempatLahir: 'Bandung',
          tanggalLahir: new Date('2008-08-20'),
          alamat: 'Jl. Melati No. 12, Jakarta',
          namaOrangTua: 'H. Hasan',
          noHp: '081311223344',
        },
      },
    },
    include: { siswaProfile: true },
  })

  const siswa3 = await prisma.user.upsert({
    where: { username: 'siswa3' },
    update: { role: 'SISWA', passwordHash: siswaPasswordHash },
    create: {
      username: 'siswa3',
      email: 'citra.lestari@siswa.sch.id',
      passwordHash: siswaPasswordHash,
      role: 'SISWA',
      siswaProfile: {
        create: {
          nis: '1003',
          nisn: '0051234569',
          namaLengkap: 'Citra Dewi Lestari',
          kelasId: kelas10.id,
          jenisKelamin: 'P',
          tempatLahir: 'Jakarta',
          tanggalLahir: new Date('2008-11-02'),
          alamat: 'Jl. Anggrek No. 8, Jakarta',
          namaOrangTua: 'Bambang Supriyanto',
          noHp: '081399887766',
        },
      },
    },
    include: { siswaProfile: true },
  })

  // 7. Seed Jadwal Mengajar Guru
  const mapelMtk = await prisma.mataPelajaran.findUnique({ where: { kodeMapel: 'MTK-10' } })
  if (guruUser.guruProfile && mapelMtk) {
    await prisma.jadwal.deleteMany({ where: { guruId: guruUser.guruProfile.id } })
    await prisma.jadwal.createMany({
      data: [
        {
          hari: 'Senin',
          jamMulai: '07:30',
          jamSelesai: '09:00',
          kelasId: kelas10.id,
          mapelId: mapelMtk.id,
          guruId: guruUser.guruProfile.id,
          ruangan: 'Ruang 101',
        },
        {
          hari: 'Senin',
          jamMulai: '10:00',
          jamSelesai: '11:30',
          kelasId: kelas11.id,
          mapelId: mapelMtk.id,
          guruId: guruUser.guruProfile.id,
          ruangan: 'Ruang 202',
        },
        {
          hari: 'Rabu',
          jamMulai: '08:00',
          jamSelesai: '09:30',
          kelasId: kelas10.id,
          mapelId: mapelMtk.id,
          guruId: guruUser.guruProfile.id,
          ruangan: 'Ruang 101',
        },
        {
          hari: 'Kamis',
          jamMulai: '13:00',
          jamSelesai: '14:30',
          kelasId: kelas12.id,
          mapelId: mapelMtk.id,
          guruId: guruUser.guruProfile.id,
          ruangan: 'Lab Matematika',
        },
      ],
    })
    console.log('✅ Jadwal mengajar seeded')

    // 8. Seed Sesi Absensi & Details
    const sesi1 = await prisma.sesiAbsensi.create({
      data: {
        kelasId: kelas10.id,
        mapelId: mapelMtk.id,
        guruId: guruUser.guruProfile.id,
        tanggal: new Date(),
        pertemuanKe: 1,
        keterangan: 'Materi Pengenalan Logaritma',
        details: {
          create: [
            { siswaId: siswaUser.siswaProfile.id, status: 'HADIR' },
            { siswaId: siswa2.siswaProfile.id, status: 'HADIR' },
            { siswaId: siswa3.siswaProfile.id, status: 'IZIN', catatan: 'Keperluan keluarga' },
          ],
        },
      },
    })
    console.log('✅ Presensi sesi 1 created:', sesi1.id)

    // 9. Seed Nilai
    await prisma.nilai.deleteMany({ where: { guruId: guruUser.guruProfile.id } })
    await prisma.nilai.createMany({
      data: [
        {
          siswaId: siswaUser.siswaProfile.id,
          mapelId: mapelMtk.id,
          kelasId: kelas10.id,
          guruId: guruUser.guruProfile.id,
          semester: '1',
          tahunAjaran: '2025/2026',
          nilaiTugas: 88,
          nilaiUh: 85,
          nilaiUts: 82,
          nilaiUas: 90,
          nilaiAkhir: 86.25,
          predikat: 'A',
          catatan: 'Pemahaman konsep sangat baik',
        },
        {
          siswaId: siswa2.siswaProfile.id,
          mapelId: mapelMtk.id,
          kelasId: kelas10.id,
          guruId: guruUser.guruProfile.id,
          semester: '1',
          tahunAjaran: '2025/2026',
          nilaiTugas: 78,
          nilaiUh: 76,
          nilaiUts: 80,
          nilaiUas: 82,
          nilaiAkhir: 79.0,
          predikat: 'B',
          catatan: 'Cukup teliti dalam berhitung',
        },
        {
          siswaId: siswa3.siswaProfile.id,
          mapelId: mapelMtk.id,
          kelasId: kelas10.id,
          guruId: guruUser.guruProfile.id,
          semester: '1',
          tahunAjaran: '2025/2026',
          nilaiTugas: 65,
          nilaiUh: 60,
          nilaiUts: 68,
          nilaiUas: 70,
          nilaiAkhir: 65.75,
          predikat: 'C',
          catatan: 'Perlu latihan tambahan (di bawah KKM)',
        },
      ],
    })
    console.log('✅ Nilai siswa seeded')

    // 10. Seed Tugas & Submissions
    const tugas1 = await prisma.tugas.create({
      data: {
        judul: 'Latihan Soal Logaritma dan Eksponen',
        deskripsi: 'Kerjakan soal latihan bab 2 nomor 1 sampai 15 di buku catatan lalu foto dan kumpulkan.',
        kelasId: kelas10.id,
        mapelId: mapelMtk.id,
        guruId: guruUser.guruProfile.id,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        submissions: {
          create: [
            {
              siswaId: siswaUser.siswaProfile.id,
              catatanSiswa: 'Sudah selesai pak, file terlampir.',
              fileUrl: '/uploads/tugas_logaritma_ahmad.pdf',
              status: 'GRADED',
              nilai: 92,
              catatanGuru: 'Sangat rapi dan cara penyelesaian tepat!',
            },
            {
              siswaId: siswa2.siswaProfile.id,
              catatanSiswa: 'Mengumpulkan tugas matematika bab 2.',
              fileUrl: '/uploads/tugas_logaritma_siti.pdf',
              status: 'SUBMITTED',
            },
          ],
        },
      },
    })
    console.log('✅ Tugas seeded:', tugas1.judul)

    // 11. Seed Materi
    await prisma.materi.createMany({
      data: [
        {
          judul: 'Modul Bab 1: Eksponen & Logaritma Tingkat Lanjut',
          deskripsi: 'Bahan ajar lengkap beserta contoh soal dan pembahasan Olimpiade.',
          fileName: 'Modul_Eksponen_Logaritma_Kelas_X.pdf',
          fileUrl: '/documents/Modul_Eksponen_Logaritma_Kelas_X.pdf',
          fileType: 'pdf',
          fileSizeBytes: 2450000,
          kelasId: kelas10.id,
          mapelId: mapelMtk.id,
          guruId: guruUser.guruProfile.id,
        },
        {
          judul: 'Slide Presentasi: Matriks dan Transformasi Geometri',
          deskripsi: 'Slide PPT untuk pertemuan tatap muka dan belajar mandiri.',
          fileName: 'Slide_Matriks_Geometri.pptx',
          fileUrl: '/documents/Slide_Matriks_Geometri.pptx',
          fileType: 'pptx',
          fileSizeBytes: 4200000,
          kelasId: kelas10.id,
          mapelId: mapelMtk.id,
          guruId: guruUser.guruProfile.id,
        },
      ],
    })
    console.log('✅ Materi pembelajaran seeded')

    // 12. Seed Pengumuman Kelas
    await prisma.pengumumanKelas.createMany({
      data: [
        {
          judul: 'Jadwal Ulangan Harian Bab 2 Logaritma',
          konten: 'Diumumkan kepada seluruh siswa kelas X MIPA 1, ulangan harian matematika akan diadakan hari Senin depan. Mohon persiapkan kalkulator dan alat tulis lengkap.',
          prioritas: 'PENTING',
          kelasId: kelas10.id,
          guruId: guruUser.guruProfile.id,
        },
        {
          judul: 'Persiapan Remedial Ulangan Tengah Semester',
          konten: 'Bagi siswa yang memperoleh nilai di bawah KKM (75), sesi bimbingan remedial diadakan hari Rabu jam 14.30 di Ruang 101.',
          prioritas: 'NORMAL',
          kelasId: kelas10.id,
          guruId: guruUser.guruProfile.id,
        },
      ],
    })
    console.log('✅ Pengumuman kelas seeded')

    // 13. Seed Catatan Bimbingan Siswa
    await prisma.catatanBimbingan.createMany({
      data: [
        {
          siswaId: siswa3.siswaProfile.id,
          guruId: guruUser.guruProfile.id,
          kategori: 'Akademik',
          catatan: 'Kesulitan memahami materi persamaan logaritma, nilai UH pertama 60.',
          tindakan: 'Diberikan jadwal tutor sebaya dengan Ahmad Fauzi dan tambahan latihan mandiri.',
        },
        {
          siswaId: siswaUser.siswaProfile.id,
          guruId: guruUser.guruProfile.id,
          kategori: 'Prestasi',
          catatan: 'Menunjukkan bakat luar biasa dalam menyelesaikan soal matematika menantang.',
          tindakan: 'Direkomendasikan masuk tim seleksi Olimpiade Sains Nasional (OSN) Matematika.',
        },
      ],
    })
    console.log('✅ Catatan bimbingan siswa seeded')
  }

  // 14. Create Initial Audit Log
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SYSTEM_SEED',
      detail: 'Inisialisasi data awal sekolah lengkap (Admin, Guru, Siswa, Kelas, Mapel, Jadwal, Absensi, Nilai, Tugas, Materi, Pengumuman)',
    },
  })

  console.log('🎉 Seeding successfully completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
