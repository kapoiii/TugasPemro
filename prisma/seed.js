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

  // 6. Create Initial Audit Log
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SYSTEM_SEED',
      detail: 'Inisialisasi data awal sekolah (Admin, Guru, Siswa, Kelas, Mapel)',
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
