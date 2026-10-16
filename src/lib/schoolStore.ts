import fs from 'fs'
import path from 'path'

export interface UserAccount {
  id: string
  username: string
  email: string
  password: string // Plaintext for demo or hash
  role: 'ADMIN' | 'GURU' | 'SISWA'
  createdAt: string
  updatedAt: string
  siswaProfile?: SiswaProfile
  guruProfile?: GuruProfile
}

export interface SiswaProfile {
  id: string
  userId: string
  nis: string
  nisn: string
  namaLengkap: string
  kelasId: string
  jenisKelamin: 'L' | 'P'
  tempatLahir?: string
  tanggalLahir?: string
  alamat?: string
  namaOrangTua?: string
  noHp?: string
}

export interface GuruProfile {
  id: string
  userId: string
  nip: string
  namaLengkap: string
  mataPelajaranUtama: string
  noHp?: string
}

export interface Kelas {
  id: string
  namaKelas: string
  tingkat: string // "10", "11", "12"
  waliKelasId?: string
}

export interface MataPelajaran {
  id: string
  kodeMapel: string
  namaMapel: string
  kkm: number
}

export interface JadwalPelajaran {
  id: string
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat'
  jamMulai: string
  jamSelesai: string
  kelasId: string
  mapelId: string
  guruId: string
  ruangan: string
}

export interface DetailAbsensi {
  id: string
  siswaId: string
  status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA'
  catatan?: string
}

export interface SesiAbsensi {
  id: string
  kelasId: string
  mapelId: string
  guruId: string
  tanggal: string
  pertemuanKe: number
  keterangan?: string
  createdAt: string
  details: DetailAbsensi[]
}

export interface NilaiSiswa {
  id: string
  siswaId: string
  mapelId: string
  kelasId: string
  guruId: string
  semester: string
  tahunAjaran: string
  nilaiTugas: number
  nilaiUts: number
  nilaiUas: number
  nilaiPraktik: number
  nilaiSikap: number
  nilaiAkhir: number
  predikat: string
  catatan?: string
  updatedAt: string
}

export interface HomeworkSubmission {
  siswaId: string
  submissionText: string
  fileUrl?: string
  submittedAt: string
  status: 'SUBMITTED' | 'GRADED'
  nilai?: number
  catatanGuru?: string
}

export interface PekerjaanRumah {
  id: string
  judul: string
  deskripsi: string
  mapelId: string
  kelasId: string
  guruId: string
  tenggatWaktu: string
  createdAt: string
  submissions: HomeworkSubmission[]
}

export interface RaportData {
  id: string
  siswaId: string
  kelasId: string
  semester: string
  tahunAjaran: string
  totalHadir: number
  totalIzin: number
  totalSakit: number
  totalAlfa: number
  rataRataNilai: number
  catatanWaliKelas?: string
  status: 'DRAFT' | 'PUBLISHED'
  updatedAt: string
}

export interface SystemSettings {
  pembagianRaportDibuka: boolean
  tanggalPembagianRaport: string
  semesterAktif: string
  tahunAjaranAktif: string
}

export interface AuditLog {
  id: string
  userId?: string
  action: string
  detail: string
  createdAt: string
}

export interface SchoolDatabase {
  users: UserAccount[]
  kelas: Kelas[]
  mapel: MataPelajaran[]
  jadwal: JadwalPelajaran[]
  absensi: SesiAbsensi[]
  nilais: NilaiSiswa[]
  pekerjaanRumah: PekerjaanRumah[]
  raports: RaportData[]
  settings: SystemSettings
  auditLogs: AuditLog[]
}

const DB_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'school-store.json')

// Initial Default Seed Data
const DEFAULT_DATABASE: SchoolDatabase = {
  settings: {
    pembagianRaportDibuka: false, // Default: belum saatnya pembagian raport, locked for students until opened
    tanggalPembagianRaport: '2026-12-15',
    semesterAktif: '1 (Ganjil)',
    tahunAjaranAktif: '2025/2026',
  },
  kelas: [
    { id: 'kelas-10-mipa1', namaKelas: 'X MIPA 1', tingkat: '10', waliKelasId: 'guru-profile-01' },
    { id: 'kelas-10-mipa2', namaKelas: 'X MIPA 2', tingkat: '10' },
    { id: 'kelas-11-mipa1', namaKelas: 'XI MIPA 1', tingkat: '11' },
    { id: 'kelas-12-mipa1', namaKelas: 'XII MIPA 1', tingkat: '12' },
  ],
  mapel: [
    { id: 'mapel-mtk', kodeMapel: 'MTK-10', namaMapel: 'Matematika Wajib', kkm: 75 },
    { id: 'mapel-bin', kodeMapel: 'BIN-10', namaMapel: 'Bahasa Indonesia', kkm: 75 },
    { id: 'mapel-ing', kodeMapel: 'ING-10', namaMapel: 'Bahasa Inggris', kkm: 75 },
    { id: 'mapel-fis', kodeMapel: 'FIS-10', namaMapel: 'Fisika', kkm: 75 },
    { id: 'mapel-kim', kodeMapel: 'KIM-10', namaMapel: 'Kimia', kkm: 75 },
    { id: 'mapel-bio', kodeMapel: 'BIO-10', namaMapel: 'Biologi', kkm: 75 },
    { id: 'mapel-inf', kodeMapel: 'INF-10', namaMapel: 'Informatika', kkm: 75 },
  ],
  users: [
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
      },
    },
    {
      id: 'usr-siswa-01',
      username: 'siswa1',
      email: 'ahmad.fauzi@siswa.sch.id',
      password: 'siswa123',
      role: 'SISWA',
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-01-01T08:00:00.000Z',
      siswaProfile: {
        id: 'siswa-profile-01',
        userId: 'usr-siswa-01',
        nis: '1001',
        nisn: '0051234567',
        namaLengkap: 'Ahmad Fauzi',
        kelasId: 'kelas-10-mipa1',
        jenisKelamin: 'L',
        tempatLahir: 'Jakarta',
        tanggalLahir: '2008-05-14',
        alamat: 'Jl. Merdeka No. 45, Jakarta Selatan',
        namaOrangTua: 'Rahmat Hidayat',
        noHp: '081298765432',
      },
    },
    {
      id: 'usr-siswa-02',
      username: 'siswa2',
      email: 'siti.aisyah@siswa.sch.id',
      password: 'siswa123',
      role: 'SISWA',
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-01-01T08:00:00.000Z',
      siswaProfile: {
        id: 'siswa-profile-02',
        userId: 'usr-siswa-02',
        nis: '1002',
        nisn: '0051234568',
        namaLengkap: 'Siti Aisyah',
        kelasId: 'kelas-10-mipa1',
        jenisKelamin: 'P',
        tempatLahir: 'Bandung',
        tanggalLahir: '2008-08-20',
        alamat: 'Jl. Melati No. 12, Jakarta Selatan',
        namaOrangTua: 'H. Hasan',
        noHp: '081311223344',
      },
    },
    {
      id: 'usr-siswa-03',
      username: 'siswa3',
      email: 'citra.lestari@siswa.sch.id',
      password: 'siswa123',
      role: 'SISWA',
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-01-01T08:00:00.000Z',
      siswaProfile: {
        id: 'siswa-profile-03',
        userId: 'usr-siswa-03',
        nis: '1003',
        nisn: '0051234569',
        namaLengkap: 'Citra Dewi Lestari',
        kelasId: 'kelas-10-mipa1',
        jenisKelamin: 'P',
        tempatLahir: 'Jakarta',
        tanggalLahir: '2008-11-02',
        alamat: 'Jl. Anggrek No. 8, Jakarta Selatan',
        namaOrangTua: 'Bambang Supriyanto',
        noHp: '081399887766',
      },
    },
  ],
  jadwal: [
    {
      id: 'jadwal-01',
      hari: 'Senin',
      jamMulai: '07:30',
      jamSelesai: '09:00',
      kelasId: 'kelas-10-mipa1',
      mapelId: 'mapel-mtk',
      guruId: 'guru-profile-01',
      ruangan: 'Ruang 101',
    },
    {
      id: 'jadwal-02',
      hari: 'Senin',
      jamMulai: '09:15',
      jamSelesai: '10:45',
      kelasId: 'kelas-10-mipa1',
      mapelId: 'mapel-bin',
      guruId: 'guru-profile-02',
      ruangan: 'Ruang 101',
    },
    {
      id: 'jadwal-03',
      hari: 'Senin',
      jamMulai: '11:00',
      jamSelesai: '12:30',
      kelasId: 'kelas-11-mipa1',
      mapelId: 'mapel-mtk',
      guruId: 'guru-profile-01',
      ruangan: 'Ruang 201',
    },
    {
      id: 'jadwal-04',
      hari: 'Selasa',
      jamMulai: '07:30',
      jamSelesai: '09:00',
      kelasId: 'kelas-10-mipa1',
      mapelId: 'mapel-fis',
      guruId: 'guru-profile-01',
      ruangan: 'Lab Fisika',
    },
    {
      id: 'jadwal-05',
      hari: 'Selasa',
      jamMulai: '09:15',
      jamSelesai: '10:45',
      kelasId: 'kelas-10-mipa1',
      mapelId: 'mapel-ing',
      guruId: 'guru-profile-02',
      ruangan: 'Ruang 101',
    },
    {
      id: 'jadwal-06',
      hari: 'Rabu',
      jamMulai: '07:30',
      jamSelesai: '09:00',
      kelasId: 'kelas-10-mipa1',
      mapelId: 'mapel-kim',
      guruId: 'guru-profile-01',
      ruangan: 'Lab Kimia',
    },
    {
      id: 'jadwal-07',
      hari: 'Rabu',
      jamMulai: '09:15',
      jamSelesai: '10:45',
      kelasId: 'kelas-10-mipa1',
      mapelId: 'mapel-bio',
      guruId: 'guru-profile-02',
      ruangan: 'Lab Biologi',
    },
    {
      id: 'jadwal-08',
      hari: 'Kamis',
      jamMulai: '07:30',
      jamSelesai: '09:00',
      kelasId: 'kelas-10-mipa1',
      mapelId: 'mapel-inf',
      guruId: 'guru-profile-01',
      ruangan: 'Lab Komputer',
    },
    {
      id: 'jadwal-09',
      hari: 'Kamis',
      jamMulai: '09:15',
      jamSelesai: '10:45',
      kelasId: 'kelas-10-mipa1',
      mapelId: 'mapel-mtk',
      guruId: 'guru-profile-01',
      ruangan: 'Ruang 101',
    },
    {
      id: 'jadwal-10',
      hari: 'Jumat',
      jamMulai: '07:30',
      jamSelesai: '09:00',
      kelasId: 'kelas-10-mipa1',
      mapelId: 'mapel-bin',
      guruId: 'guru-profile-02',
      ruangan: 'Ruang 101',
    },
  ],
  absensi: [
    {
      id: 'sesi-01',
      kelasId: 'kelas-10-mipa1',
      mapelId: 'mapel-mtk',
      guruId: 'guru-profile-01',
      tanggal: '2026-10-12',
      pertemuanKe: 1,
      keterangan: 'Materi Persamaan dan Pertidaksamaan Nilai Mutlak',
      createdAt: '2026-10-12T08:00:00.000Z',
      details: [
        { id: 'abs-01-1', siswaId: 'siswa-profile-01', status: 'HADIR', catatan: 'Tepat waktu' },
        { id: 'abs-01-2', siswaId: 'siswa-profile-02', status: 'HADIR', catatan: 'Tepat waktu' },
        { id: 'abs-01-3', siswaId: 'siswa-profile-03', status: 'IZIN', catatan: 'Surat izin keluarga' },
      ],
    },
    {
      id: 'sesi-02',
      kelasId: 'kelas-10-mipa1',
      mapelId: 'mapel-mtk',
      guruId: 'guru-profile-01',
      tanggal: '2026-10-15',
      pertemuanKe: 2,
      keterangan: 'Latihan Soal Aljabar Linear',
      createdAt: '2026-10-15T08:00:00.000Z',
      details: [
        { id: 'abs-02-1', siswaId: 'siswa-profile-01', status: 'HADIR', catatan: 'Aktif bertanya' },
        { id: 'abs-02-2', siswaId: 'siswa-profile-02', status: 'HADIR', catatan: 'Tepat waktu' },
        { id: 'abs-02-3', siswaId: 'siswa-profile-03', status: 'HADIR', catatan: 'Tepat waktu' },
      ],
    },
  ],
  nilais: [
    {
      id: 'nilai-01',
      siswaId: 'siswa-profile-01',
      mapelId: 'mapel-mtk',
      kelasId: 'kelas-10-mipa1',
      guruId: 'guru-profile-01',
      semester: '1',
      tahunAjaran: '2025/2026',
      nilaiTugas: 88,
      nilaiUts: 86,
      nilaiUas: 90,
      nilaiPraktik: 85,
      nilaiSikap: 90,
      nilaiAkhir: 87.85,
      predikat: 'A',
      catatan: 'Kemampuan analisis matematika sangat baik.',
      updatedAt: '2026-10-15T10:00:00.000Z',
    },
    {
      id: 'nilai-02',
      siswaId: 'siswa-profile-01',
      mapelId: 'mapel-bin',
      kelasId: 'kelas-10-mipa1',
      guruId: 'guru-profile-02',
      semester: '1',
      tahunAjaran: '2025/2026',
      nilaiTugas: 90,
      nilaiUts: 92,
      nilaiUas: 88,
      nilaiPraktik: 90,
      nilaiSikap: 95,
      nilaiAkhir: 90.4,
      predikat: 'A',
      catatan: 'Tata bahasa dan penulisan esai sangat runtut.',
      updatedAt: '2026-10-15T10:00:00.000Z',
    },
    {
      id: 'nilai-03',
      siswaId: 'siswa-profile-01',
      mapelId: 'mapel-fis',
      kelasId: 'kelas-10-mipa1',
      guruId: 'guru-profile-01',
      semester: '1',
      tahunAjaran: '2025/2026',
      nilaiTugas: 82,
      nilaiUts: 80,
      nilaiUas: 85,
      nilaiPraktik: 88,
      nilaiSikap: 85,
      nilaiAkhir: 83.6,
      predikat: 'B',
      catatan: 'Praktikum fisika terlaksana dengan baik.',
      updatedAt: '2026-10-15T10:00:00.000Z',
    },
    {
      id: 'nilai-04',
      siswaId: 'siswa-profile-01',
      mapelId: 'mapel-ing',
      kelasId: 'kelas-10-mipa1',
      guruId: 'guru-profile-02',
      semester: '1',
      tahunAjaran: '2025/2026',
      nilaiTugas: 85,
      nilaiUts: 88,
      nilaiUas: 84,
      nilaiPraktik: 85,
      nilaiSikap: 90,
      nilaiAkhir: 86.15,
      predikat: 'B',
      catatan: 'Kosakata bahasa Inggris kaya dan komunikatif.',
      updatedAt: '2026-10-15T10:00:00.000Z',
    },
    {
      id: 'nilai-05',
      siswaId: 'siswa-profile-02',
      mapelId: 'mapel-mtk',
      kelasId: 'kelas-10-mipa1',
      guruId: 'guru-profile-01',
      semester: '1',
      tahunAjaran: '2025/2026',
      nilaiTugas: 85,
      nilaiUts: 85,
      nilaiUas: 88,
      nilaiPraktik: 85,
      nilaiSikap: 90,
      nilaiAkhir: 86.4,
      predikat: 'B',
      catatan: 'Baik dan tekun dalam menyelesaikan tugas.',
      updatedAt: '2026-10-15T10:00:00.000Z',
    },
  ],
  pekerjaanRumah: [
    {
      id: 'pr-01',
      judul: 'Tugas Latihan Aljabar Bab 2 (Halaman 45 No. 1-10)',
      deskripsi: 'Kerjakan soal latihan nomor 1 sampai 10 di buku latihan matematika. Tuliskan langkah pengerjaan dengan jelas, lalu foto atau upload rangkuman jawaban di sini.',
      mapelId: 'mapel-mtk',
      kelasId: 'kelas-10-mipa1',
      guruId: 'guru-profile-01',
      tenggatWaktu: '2026-10-25T23:59:00.000Z',
      createdAt: '2026-10-14T09:00:00.000Z',
      submissions: [
        {
          siswaId: 'siswa-profile-01',
          submissionText: 'Tugas latihan aljabar bab 2 sudah dikerjakan lengkap dari nomor 1 sampai 10 di lembar lampiran.',
          fileUrl: 'https://drive.google.com/contoh-tugas-aljabar-ahmad-fauzi.pdf',
          submittedAt: '2026-10-15T14:30:00.000Z',
          status: 'SUBMITTED',
          nilai: 90,
          catatanGuru: 'Pengerjaan rapi dan pembuktian rumus tepat.',
        },
      ],
    },
    {
      id: 'pr-02',
      judul: 'Resensi Novel Sastra Indonesia Kontemporer',
      deskripsi: 'Buatlah esai resensi 500 kata mengenai salah satu novel sastra Indonesia pilihan. Analisis unsur intrinsik dan amanat cerita.',
      mapelId: 'mapel-bin',
      kelasId: 'kelas-10-mipa1',
      guruId: 'guru-profile-02',
      tenggatWaktu: '2026-10-30T23:59:00.000Z',
      createdAt: '2026-10-15T10:00:00.000Z',
      submissions: [],
    },
  ],
  raports: [
    {
      id: 'raport-01',
      siswaId: 'siswa-profile-01',
      kelasId: 'kelas-10-mipa1',
      semester: '1 (Ganjil)',
      tahunAjaran: '2025/2026',
      totalHadir: 18,
      totalIzin: 1,
      totalSakit: 1,
      totalAlfa: 0,
      rataRataNilai: 87.0,
      catatanWaliKelas: 'Pertahankan prestasi belajar dan terus aktif dalam ekstrakurikuler sains.',
      status: 'DRAFT', // Will be viewed as locked unless admin or settings opens pembagian raport!
      updatedAt: '2026-10-15T12:00:00.000Z',
    },
  ],
  auditLogs: [
    {
      id: 'log-01',
      userId: 'usr-admin-01',
      action: 'SYSTEM_INIT',
      detail: 'Inisialisasi sistem database sekolah terpadu.',
      createdAt: new Date().toISOString(),
    },
  ],
}

// In-memory cache
let inMemoryDb: SchoolDatabase | null = null

export function getSchoolDb(): SchoolDatabase {
  if (inMemoryDb) return inMemoryDb

  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const fileData = fs.readFileSync(DB_FILE_PATH, 'utf-8')
      inMemoryDb = JSON.parse(fileData)
      return inMemoryDb!
    }
  } catch (err) {
    console.warn('Failed to read school-store.json from disk, initializing default:', err)
  }

  // Initialize file if not found
  inMemoryDb = JSON.parse(JSON.stringify(DEFAULT_DATABASE))
  saveSchoolDb(inMemoryDb!)
  return inMemoryDb!
}

export function saveSchoolDb(db: SchoolDatabase): boolean {
  try {
    inMemoryDb = db
    const dir = path.dirname(DB_FILE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8')
    return true
  } catch (err) {
    console.error('Failed to save school-store.json to disk:', err)
    return false
  }
}
