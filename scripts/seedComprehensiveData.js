const fs = require('fs');
const path = require('path');

const classes = [
  { id: 'kelas-10-mipa1', namaKelas: 'X MIPA 1', tingkat: '10', waliKelasId: 'guru-profile-01' },
  { id: 'kelas-10-mipa2', namaKelas: 'X MIPA 2', tingkat: '10', waliKelasId: 'guru-profile-02' },
  { id: 'kelas-10-ips1',  namaKelas: 'X IPS 1',  tingkat: '10' },
  { id: 'kelas-10-ips2',  namaKelas: 'X IPS 2',  tingkat: '10' },
  { id: 'kelas-11-mipa1', namaKelas: 'XI MIPA 1', tingkat: '11', waliKelasId: 'guru-profile-01' },
  { id: 'kelas-11-mipa2', namaKelas: 'XI MIPA 2', tingkat: '11', waliKelasId: 'guru-profile-02' },
  { id: 'kelas-11-ips1',  namaKelas: 'XI IPS 1',  tingkat: '11' },
  { id: 'kelas-11-ips2',  namaKelas: 'XI IPS 2',  tingkat: '11' },
  { id: 'kelas-12-mipa1', namaKelas: 'XII MIPA 1', tingkat: '12', waliKelasId: 'guru-profile-01' },
  { id: 'kelas-12-mipa2', namaKelas: 'XII MIPA 2', tingkat: '12', waliKelasId: 'guru-profile-02' },
  { id: 'kelas-12-ips1',  namaKelas: 'XII IPS 1',  tingkat: '12' },
  { id: 'kelas-12-ips2',  namaKelas: 'XII IPS 2',  tingkat: '12' },
];

const mapel = [
  { id: 'mapel-mtk', kodeMapel: 'MTK-W', namaMapel: 'Matematika Wajib', kkm: 75 },
  { id: 'mapel-mtk-minat', kodeMapel: 'MTK-P', namaMapel: 'Matematika Peminatan', kkm: 75 },
  { id: 'mapel-bin', kodeMapel: 'BIN', namaMapel: 'Bahasa Indonesia', kkm: 75 },
  { id: 'mapel-ing', kodeMapel: 'ING', namaMapel: 'Bahasa Inggris', kkm: 75 },
  { id: 'mapel-fis', kodeMapel: 'FIS', namaMapel: 'Fisika', kkm: 75 },
  { id: 'mapel-kim', kodeMapel: 'KIM', namaMapel: 'Kimia', kkm: 75 },
  { id: 'mapel-bio', kodeMapel: 'BIO', namaMapel: 'Biologi', kkm: 75 },
  { id: 'mapel-sej', kodeMapel: 'SEJ', namaMapel: 'Sejarah Indonesia', kkm: 75 },
  { id: 'mapel-sos', kodeMapel: 'SOS', namaMapel: 'Sosiologi', kkm: 75 },
  { id: 'mapel-geo', kodeMapel: 'GEO', namaMapel: 'Geografi', kkm: 75 },
  { id: 'mapel-eko', kodeMapel: 'EKO', namaMapel: 'Ekonomi', kkm: 75 },
  { id: 'mapel-pabp', kodeMapel: 'PABP', namaMapel: 'Pendidikan Agama & Budi Pekerti', kkm: 78 },
  { id: 'mapel-ppkn', kodeMapel: 'PPKN', namaMapel: 'PPKn', kkm: 76 },
  { id: 'mapel-pjok', kodeMapel: 'PJOK', namaMapel: 'PJOK', kkm: 75 },
  { id: 'mapel-seni', kodeMapel: 'SBD', namaMapel: 'Seni Budaya', kkm: 75 },
  { id: 'mapel-pkwu', kodeMapel: 'PKWU', namaMapel: 'Prakarya & Kewirausahaan', kkm: 75 },
  { id: 'mapel-inf', kodeMapel: 'INF', namaMapel: 'Informatika', kkm: 75 },
];

const firstNamesMale = [
  'Ahmad', 'Aditya', 'Bagus', 'Bayu', 'Bima', 'Dimas', 'Dwi', 'Fajar', 'Farhan', 'Galang',
  'Gilang', 'Hafiz', 'Ilham', 'Indra', 'Muhammad', 'Naufal', 'Pratama', 'Raditya', 'Rafi', 'Reza',
  'Rian', 'Rifqi', 'Rizky', 'Satria', 'Taufik', 'Wahyu', 'Yudha', 'Zaky'
];

const lastNamesMale = [
  'Pratama', 'Saputra', 'Kusuma', 'Santoso', 'Hidayat', 'Ramadhan', 'Wijaya', 'Permana', 'Nugroho',
  'Setiawan', 'Firmansyah', 'Wibowo', 'Kurniawan', 'Gunawan', 'Hakim', 'Anwar', 'Putra', 'Maulana'
];

const firstNamesFemale = [
  'Aisyah', 'Anisa', 'Aulia', 'Cantika', 'Citra', 'Dinda', 'Fadilah', 'Gita', 'Hana', 'Indah',
  'Intan', 'Kartika', 'Laras', 'Maya', 'Nabila', 'Nadya', 'Nurul', 'Putri', 'Rahma', 'Rania',
  'Safira', 'Salsabila', 'Salma', 'Siti', 'Syifa', 'Tia', 'Vina', 'Zahra'
];

const lastNamesFemale = [
  'Lestari', 'Putri', 'Anggraini', 'Dewi', 'Wulandari', 'Maharani', 'Safitri', 'Kusumawati', 'Utami',
  'Rahmawati', 'Sari', 'Azzahra', 'Kusuma', 'Handayani', 'Pratiwi', 'Novita'
];

const streets = [
  'Jl. Merdeka No. ', 'Jl. Sudirman No. ', 'Jl. Melati No. ', 'Jl. Mawar No. ', 'Jl. Anggrek No. ',
  'Jl. Gatot Subroto No. ', 'Jl. Diponegoro No. ', 'Jl. Cempaka No. ', 'Jl. Dahlia No. ', 'Jl. Flamboyan No. '
];

const parentNames = [
  'Bambang Supriyanto', 'Rahmat Hidayat', 'H. Hasan Basri', 'Agus Susanto', 'Drs. Hendro Wibowo',
  'Suryadi Pratama', 'Joko Santoso', 'Budi Hartono', 'Irfan Hakim', 'Asep Saepullah', 'Eko Prasetyo'
];

function generateStudentsForClass(kelasId, startIndex, count = 26) {
  const students = [];
  for (let i = 0; i < count; i++) {
    const isMale = i % 2 === 0;
    const fn = isMale
      ? firstNamesMale[i % firstNamesMale.length]
      : firstNamesFemale[i % firstNamesFemale.length];
    const ln = isMale
      ? lastNamesMale[(i * 3) % lastNamesMale.length]
      : lastNamesFemale[(i * 3) % lastNamesFemale.length];
    const namaLengkap = `${fn} ${ln}`;
    const studentIdx = startIndex + i;
    const nis = String(1000 + studentIdx);
    const nisn = `00${50000000 + studentIdx}`;
    const username = `siswa${studentIdx}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase().replace(/[^a-z]/g, '')}${studentIdx}@siswa.sch.id`;
    const street = streets[i % streets.length] + ((i * 7) % 80 + 1);
    const ortu = parentNames[i % parentNames.length];
    const noHp = `08${1200000000 + (studentIdx * 87654) % 89999999}`;

    students.push({
      user: {
        id: `usr-siswa-${studentIdx}`,
        username,
        email,
        password: 'siswa123',
        role: 'SISWA',
        createdAt: '2026-01-01T08:00:00.000Z',
        updatedAt: '2026-01-01T08:00:00.000Z',
        siswaProfile: {
          id: `siswa-profile-${studentIdx}`,
          userId: `usr-siswa-${studentIdx}`,
          nis,
          nisn,
          namaLengkap,
          kelasId,
          jenisKelamin: isMale ? 'L' : 'P',
          tempatLahir: isMale ? 'Jakarta' : 'Bandung',
          tanggalLahir: `2008-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 27) + 1).padStart(2, '0')}`,
          alamat: `${street}, Jakarta`,
          namaOrangTua: ortu,
          noHp,
        }
      }
    });
  }
  return students;
}

// Build complete database
const existingPath = path.join(__dirname, '..', 'src', 'data', 'school-store.json');
let baseDb = {
  settings: {
    pembagianRaportDibuka: false,
    tanggalPembagianRaport: '2026-12-15',
    semesterAktif: '1 (Ganjil)',
    tahunAjaranAktif: '2025/2026',
  },
  kelas: classes,
  mapel: mapel,
  users: [],
  jadwal: [],
  absensi: [],
  nilais: [],
  pekerjaanRumah: [],
  materis: [],
  pengumumanKelas: [],
  catatanBimbingan: [],
  bobotNilai: { tugas: 25, uh: 25, uts: 25, uas: 25 },
  raports: [],
  auditLogs: [],
};

if (fs.existsSync(existingPath)) {
  try {
    const raw = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
    if (raw.settings) baseDb.settings = raw.settings;
    if (raw.bobotNilai) baseDb.bobotNilai = raw.bobotNilai;
    if (raw.auditLogs) baseDb.auditLogs = raw.auditLogs;
  } catch (e) {
    console.warn('Could not read existing file, initializing new baseDb', e);
  }
}

// Standard Staff / Guru / Admin Users
const staffUsers = [
  {
    id: 'usr-admin-01',
    username: 'admin',
    email: 'admin@sekolah.sch.id',
    password: 'admin123',
    role: 'ADMIN',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'usr-guru-01',
    username: 'guru1',
    email: 'budi.santoso@sekolah.sch.id',
    password: 'guru123',
    role: 'GURU',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
    guruProfile: {
      id: 'guru-profile-01',
      userId: 'usr-guru-01',
      nip: '198501012010011001',
      namaLengkap: 'Budi Santoso, S.Pd.',
      mataPelajaranUtama: 'Matematika Wajib',
      noHp: '081234567890',
      avatarUrl: '',
      bio: 'Guru Pengampu Mata Pelajaran Matematika Wajib & Pembina Tim Olimpiade Sains',
    },
  },
  {
    id: 'usr-guru-02',
    username: 'guru2',
    email: 'ratna.dewi@sekolah.sch.id',
    password: 'guru123',
    role: 'GURU',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
    guruProfile: {
      id: 'guru-profile-02',
      userId: 'usr-guru-02',
      nip: '198705122011012002',
      namaLengkap: 'Ratna Dewi, S.Pd., M.Hum.',
      mataPelajaranUtama: 'Bahasa Indonesia',
      noHp: '081234567891',
      avatarUrl: '',
      bio: 'Guru Pengampu Mata Pelajaran Bahasa Indonesia & Pembina Karya Ilmiah Remaja',
    },
  },
  {
    id: 'usr-guru-03',
    username: 'guru3',
    email: 'hendra.wijaya@sekolah.sch.id',
    password: 'guru123',
    role: 'GURU',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
    guruProfile: {
      id: 'guru-profile-03',
      userId: 'usr-guru-03',
      nip: '198903152012021003',
      namaLengkap: 'Drs. Hendra Wijaya, M.Si.',
      mataPelajaranUtama: 'Fisika',
      noHp: '081234567892',
      avatarUrl: '',
      bio: 'Guru Pengampu Fisika & Kepala Laboratorium IPA Terpadu',
    },
  },
];

const allUsers = [...staffUsers];
const allNilais = [];
const allRaports = [];

let studentCounter = 1;

// Generate 26-28 students per class
classes.forEach((cls) => {
  const studentsCount = 26; // minimal 25 orang per kelas!
  const generated = generateStudentsForClass(cls.id, studentCounter, studentsCount);
  studentCounter += studentsCount;

  generated.forEach((g, idx) => {
    allUsers.push(g.user);
    const sp = g.user.siswaProfile;

    // Generate realistic grades for key subjects
    const keyMapels = ['mapel-mtk', 'mapel-bin', 'mapel-ing', 'mapel-fis', 'mapel-kim', 'mapel-bio', 'mapel-ppkn'];
    let studentSumNilai = 0;
    
    keyMapels.forEach((mId) => {
      // Base score variance between 75 and 96
      const baseGrade = 78 + ((idx * 3 + mId.charCodeAt(6)) % 19);
      const uh = Math.min(100, Math.max(70, baseGrade - 2 + (idx % 5)));
      const uts = Math.min(100, Math.max(70, baseGrade + (idx % 3)));
      const uas = Math.min(100, Math.max(70, baseGrade + 1 - (idx % 4)));
      const tugas = Math.min(100, Math.max(75, baseGrade + 3));
      const prak = Math.min(100, Math.max(75, baseGrade + 2));
      const akhir = Math.round((tugas * 0.25) + (uh * 0.25) + (uts * 0.25) + (uas * 0.25));
      const predikat = akhir >= 90 ? 'A' : akhir >= 80 ? 'B' : akhir >= 75 ? 'C' : 'D';

      studentSumNilai += akhir;
      allNilais.push({
        id: `nilai-${sp.id}-${mId}`,
        siswaId: sp.id,
        mapelId: mId,
        kelasId: cls.id,
        guruId: 'guru-profile-01',
        semester: '1 (Ganjil)',
        tahunAjaran: '2025/2026',
        nilaiTugas: tugas,
        nilaiUh: uh,
        nilaiUts: uts,
        nilaiUas: uas,
        nilaiPraktik: prak,
        nilaiSikap: 88,
        nilaiAkhir: akhir,
        predikat,
        catatan: akhir >= 85 ? 'Sangat menguasai materi dengan baik' : 'Cukup baik, pertahankan konsistensi belajar',
        updatedAt: '2026-10-20T10:00:00.000Z',
      });
    });

    const avgNilai = Number((studentSumNilai / keyMapels.length).toFixed(2));
    const hadir = 24 - (idx % 3 === 0 ? 1 : 0);
    const izin = idx % 5 === 0 ? 1 : 0;
    const sakit = idx % 7 === 0 ? 1 : 0;
    const alfa = idx % 13 === 0 ? 1 : 0;

    // Raport: by default DRAFT (locked/belum diizinkan), wali kelas can toggle to PUBLISHED
    allRaports.push({
      id: `raport-${sp.id}`,
      siswaId: sp.id,
      kelasId: cls.id,
      semester: '1 (Ganjil)',
      tahunAjaran: '2025/2026',
      totalHadir: hadir,
      totalIzin: izin,
      totalSakit: sakit,
      totalAlfa: alfa,
      rataRataNilai: avgNilai,
      catatanWaliKelas: avgNilai >= 85
        ? 'Pertahankan prestasi belajar yang memuaskan dan terus berprestasi!'
        : 'Tingkatkan fokus dan keaktifan pada kegiatan pembelajaran di kelas.',
      status: 'DRAFT', // Raport terkunci tanpa izin guru!
      updatedAt: '2026-10-20T10:00:00.000Z',
    });
  });
});

// Create complete Jadwal Pelajaran for classes
const jadwals = [
  { id: 'jadwal-01', hari: 'Senin', jamMulai: '07:30', jamSelesai: '09:00', kelasId: 'kelas-10-mipa1', mapelId: 'mapel-mtk', guruId: 'guru-profile-01', ruangan: 'Ruang 101' },
  { id: 'jadwal-02', hari: 'Senin', jamMulai: '09:15', jamSelesai: '10:45', kelasId: 'kelas-10-mipa1', mapelId: 'mapel-bin', guruId: 'guru-profile-02', ruangan: 'Ruang 101' },
  { id: 'jadwal-03', hari: 'Senin', jamMulai: '11:00', jamSelesai: '12:30', kelasId: 'kelas-11-mipa1', mapelId: 'mapel-mtk', guruId: 'guru-profile-01', ruangan: 'Ruang 201' },
  { id: 'jadwal-04', hari: 'Selasa', jamMulai: '07:30', jamSelesai: '09:00', kelasId: 'kelas-10-mipa1', mapelId: 'mapel-fis', guruId: 'guru-profile-03', ruangan: 'Lab Fisika' },
  { id: 'jadwal-05', hari: 'Selasa', jamMulai: '09:15', jamSelesai: '10:45', kelasId: 'kelas-10-mipa1', mapelId: 'mapel-ing', guruId: 'guru-profile-02', ruangan: 'Ruang 101' },
  { id: 'jadwal-06', hari: 'Rabu', jamMulai: '07:30', jamSelesai: '09:00', kelasId: 'kelas-10-mipa1', mapelId: 'mapel-kim', guruId: 'guru-profile-01', ruangan: 'Lab Kimia' },
  { id: 'jadwal-07', hari: 'Rabu', jamMulai: '09:15', jamSelesai: '10:45', kelasId: 'kelas-10-mipa1', mapelId: 'mapel-bio', guruId: 'guru-profile-02', ruangan: 'Lab Biologi' },
  { id: 'jadwal-08', hari: 'Kamis', jamMulai: '07:30', jamSelesai: '09:00', kelasId: 'kelas-10-mipa2', mapelId: 'mapel-mtk', guruId: 'guru-profile-01', ruangan: 'Ruang 102' },
  { id: 'jadwal-09', hari: 'Kamis', jamMulai: '09:15', jamSelesai: '10:45', kelasId: 'kelas-12-mipa1', mapelId: 'mapel-mtk', guruId: 'guru-profile-01', ruangan: 'Ruang 301' },
  { id: 'jadwal-10', hari: 'Jumat', jamMulai: '07:30', jamSelesai: '09:00', kelasId: 'kelas-10-mipa1', mapelId: 'mapel-pabp', guruId: 'guru-profile-02', ruangan: 'Ruang 101' },
];

baseDb.kelas = classes;
baseDb.mapel = mapel;
baseDb.users = allUsers;
baseDb.jadwal = jadwals;
baseDb.nilais = allNilais;
baseDb.raports = allRaports;

// Make sure directory exists
fs.mkdirSync(path.dirname(existingPath), { recursive: true });
fs.writeFileSync(existingPath, JSON.stringify(baseDb, null, 2), 'utf8');

console.log(`Generated successfully!`);
console.log(`- Classes: ${classes.length}`);
console.log(`- Subjects: ${mapel.length}`);
console.log(`- Total Users: ${allUsers.length} (Students: ${allUsers.filter(u => u.role === 'SISWA').length})`);
console.log(`- Total Nilai Rows: ${allNilais.length}`);
console.log(`- Total Raports: ${allRaports.length}`);
