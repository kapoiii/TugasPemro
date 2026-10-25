import fs from 'fs'
import path from 'path'

export interface UserAccount {
  id: string
  username: string
  email: string
  password: string // Plaintext for demo or hash
  rawPassword?: string
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
  avatarUrl?: string
  bio?: string
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
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu'
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

export interface BobotNilai {
  tugas: number
  uh: number
  uts: number
  uas: number
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
  nilaiUh?: number // Ulangan Harian
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

export interface MateriItem {
  id: string
  judul: string
  deskripsi?: string
  fileName: string
  fileUrl: string
  fileType: string // pdf, docx, pptx, mp4, zip, image
  fileSizeBytes: number
  kelasId: string
  mapelId: string
  guruId: string
  createdAt: string
}

export interface PengumumanKelasItem {
  id: string
  judul: string
  konten: string
  prioritas: 'NORMAL' | 'PENTING' | 'MENDESAK'
  kelasId: string // 'ALL' or specific kelasId
  guruId: string
  createdAt: string
}

export interface CatatanBimbinganItem {
  id: string
  siswaId: string
  guruId: string
  kategori: 'Akademik' | 'Kedisiplinan' | 'Prestasi' | 'Konseling'
  catatan: string
  tindakan?: string
  tanggal: string
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
  materis: MateriItem[]
  pengumumanKelas: PengumumanKelasItem[]
  catatanBimbingan: CatatanBimbinganItem[]
  bobotNilai: BobotNilai
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
    { id: 'kelas-10-mipa2', namaKelas: 'X MIPA 2', tingkat: '10', waliKelasId: 'guru-profile-02' },
    { id: 'kelas-10-ips1', namaKelas: 'X IPS 1', tingkat: '10' },
    { id: 'kelas-10-ips2', namaKelas: 'X IPS 2', tingkat: '10' },
    { id: 'kelas-11-mipa1', namaKelas: 'XI MIPA 1', tingkat: '11', waliKelasId: 'guru-profile-01' },
    { id: 'kelas-11-mipa2', namaKelas: 'XI MIPA 2', tingkat: '11', waliKelasId: 'guru-profile-02' },
    { id: 'kelas-11-ips1', namaKelas: 'XI IPS 1', tingkat: '11' },
    { id: 'kelas-11-ips2', namaKelas: 'XI IPS 2', tingkat: '11' },
    { id: 'kelas-12-mipa1', namaKelas: 'XII MIPA 1', tingkat: '12', waliKelasId: 'guru-profile-01' },
    { id: 'kelas-12-mipa2', namaKelas: 'XII MIPA 2', tingkat: '12', waliKelasId: 'guru-profile-02' },
    { id: 'kelas-12-ips1', namaKelas: 'XII IPS 1', tingkat: '12' },
    { id: 'kelas-12-ips2', namaKelas: 'XII IPS 2', tingkat: '12' },
  ],
  mapel: [
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
  materis: [
    {
      id: 'mat-01',
      judul: 'Modul Bab 1: Eksponen & Logaritma Tingkat Lanjut',
      deskripsi: 'Bahan ajar lengkap konsep logaritma, sifat-sifat dasar, dan pembahasan soal OSN.',
      fileName: 'Modul_Eksponen_Logaritma_Kelas_X.pdf',
      fileUrl: '/documents/Modul_Eksponen_Logaritma_Kelas_X.pdf',
      fileType: 'pdf',
      fileSizeBytes: 2450000,
      kelasId: 'kelas-10-mipa1',
      mapelId: 'mapel-mtk',
      guruId: 'guru-profile-01',
      createdAt: '2026-10-10T08:00:00.000Z',
    },
    {
      id: 'mat-02',
      judul: 'Slide Presentasi: Matriks dan Transformasi Geometri',
      deskripsi: 'Slide presentasi interaktif format PPTX untuk pembelajaran visual di kelas.',
      fileName: 'Slide_Matriks_Geometri.pptx',
      fileUrl: '/documents/Slide_Matriks_Geometri.pptx',
      fileType: 'pptx',
      fileSizeBytes: 4200000,
      kelasId: 'kelas-10-mipa1',
      mapelId: 'mapel-mtk',
      guruId: 'guru-profile-01',
      createdAt: '2026-10-12T10:30:00.000Z',
    },
    {
      id: 'mat-03',
      judul: 'Video Tutorial: Penyelesaian Sistem Persamaan Linear Tiga Variabel',
      deskripsi: 'Video rekaman simulasi metode eliminasi Gauss dan substitusi praktis.',
      fileName: 'Video_Tutorial_SPLTV.mp4',
      fileUrl: '/documents/Video_Tutorial_SPLTV.mp4',
      fileType: 'mp4',
      fileSizeBytes: 8900000,
      kelasId: 'kelas-10-mipa2',
      mapelId: 'mapel-mtk',
      guruId: 'guru-profile-01',
      createdAt: '2026-10-14T14:00:00.000Z',
    },
  ],
  pengumumanKelas: [
    {
      id: 'peng-01',
      judul: 'Jadwal Ulangan Harian (UH) Bab 2 Logaritma',
      konten: 'Diumumkan kepada seluruh siswa kelas X MIPA 1, ulangan harian matematika bab 2 akan diselenggarakan hari Senin mendatang pukul 07.30 WIB. Siapkan alat tulis dan kalkulator standar.',
      prioritas: 'PENTING',
      kelasId: 'kelas-10-mipa1',
      guruId: 'guru-profile-01',
      createdAt: '2026-10-18T08:00:00.000Z',
    },
    {
      id: 'peng-02',
      judul: 'Sesi Remedial dan Pengayaan Matematika Wajib',
      konten: 'Bagi siswa yang memperoleh nilai di bawah KKM (75) pada materi eksponen, bimbingan remedial dan klinik PR diadakan setiap Rabu jam 14.30 di Ruang 101.',
      prioritas: 'NORMAL',
      kelasId: 'ALL',
      guruId: 'guru-profile-01',
      createdAt: '2026-10-17T09:30:00.000Z',
    },
    {
      id: 'peng-03',
      judul: 'PENTING: Batas Akhir Pengumpulan Tugas Aljabar',
      konten: 'Tenggat waktu pengumpulan tugas aljabar bab 2 adalah 25 Oktober 2026 pukul 23:59 WIB. Keterlambatan tanpa keterangan izin akan dikenakan pengurangan poin.',
      prioritas: 'MENDESAK',
      kelasId: 'kelas-10-mipa1',
      guruId: 'guru-profile-01',
      createdAt: '2026-10-19T07:15:00.000Z',
    },
  ],
  catatanBimbingan: [
    {
      id: 'bim-01',
      siswaId: 'siswa-profile-03',
      guruId: 'guru-profile-01',
      kategori: 'Akademik',
      catatan: 'Siswa mengalami kesulitan memahami konsep logaritma dan nilai ulangan di bawah KKM (64). Sering absen karena sakit.',
      tindakan: 'Diberikan jadwal tutor sebaya dengan Ahmad Fauzi dan modul ringkasan matematika khusus.',
      tanggal: '2026-10-16',
    },
    {
      id: 'bim-02',
      siswaId: 'siswa-profile-01',
      guruId: 'guru-profile-01',
      kategori: 'Prestasi',
      catatan: 'Siswa menunjukkan antusiasme dan bakat matematika tinggi, selalu aktif bertanya dan nilai di atas 88.',
      tindakan: 'Direkomendasikan bergabung ke Tim Pembinaan Olimpiade Sains Nasional (OSN) Matematika sekolah.',
      tanggal: '2026-10-17',
    },
  ],
  bobotNilai: {
    tugas: 25,
    uh: 25,
    uts: 25,
    uas: 25,
  },
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

export function getDbFilePath(): string {
  const possiblePaths = [
    path.join(process.cwd(), 'src', 'data', 'school-store.json'),
    path.join(process.cwd(), 'sekolah', 'src', 'data', 'school-store.json'),
    path.join(__dirname, '..', 'data', 'school-store.json'),
    path.join(__dirname, '..', '..', 'data', 'school-store.json'),
    path.join(__dirname, '..', '..', 'src', 'data', 'school-store.json'),
  ]
  for (const p of possiblePaths) {
    if (fs.existsSync(/*turbopackIgnore: true*/ p)) {
      return p
    }
  }
  return path.join(process.cwd(), 'src', 'data', 'school-store.json')
}

// Student Name Generators for Seeding Fallbacks
const FIRST_NAMES_MALE = [
  'Ahmad', 'Aditya', 'Bagus', 'Bayu', 'Bima', 'Dimas', 'Dwi', 'Fajar', 'Farhan', 'Galang',
  'Gilang', 'Hafiz', 'Ilham', 'Indra', 'Muhammad', 'Naufal', 'Pratama', 'Raditya', 'Rafi', 'Reza',
  'Rian', 'Rifqi', 'Rizky', 'Satria', 'Taufik', 'Wahyu', 'Yudha', 'Zaky', 'Aldiansyah', 'Alif',
  'Arya', 'Arga', 'Danu', 'Doni', 'Fahri', 'Faisal', 'Fauzan', 'Genta', 'Hakim', 'Hendra',
  'Ihsan', 'Irfan', 'Kevin', 'Lukman', 'Maulana', 'Pandu', 'Randy', 'Rendy', 'Reyhan', 'Ridho',
  'Rio', 'Syahrul', 'Tegar', 'Tommy', 'Yoga', 'Yusuf', 'Zainal', 'Zidan', 'Faris', 'Danial'
]
const LAST_NAMES_MALE = [
  'Pratama', 'Saputra', 'Kusuma', 'Santoso', 'Hidayat', 'Ramadhan', 'Wijaya', 'Permana', 'Nugroho',
  'Setiawan', 'Firmansyah', 'Wibowo', 'Kurniawan', 'Gunawan', 'Hakim', 'Anwar', 'Putra', 'Maulana',
  'Susanto', 'Wibisono', 'Suhendra', 'Baskoro', 'Wardhana', 'Siregar', 'Nasution', 'Lubis', 'Tanjung',
  'Batubara', 'Pohan', 'Harahap', 'Pasaribu', 'Simanjuntak', 'Hutapea', 'Panjaitan', 'Sihombing',
  'Sitompul', 'Samosir', 'Sinaga', 'Manurung', 'Marpaung', 'Sitorus', 'Tampubolon', 'Sitanggang'
]
const FIRST_NAMES_FEMALE = [
  'Aisyah', 'Anisa', 'Aulia', 'Cantika', 'Citra', 'Dinda', 'Fadilah', 'Gita', 'Hana', 'Indah',
  'Intan', 'Kartika', 'Laras', 'Maya', 'Nabila', 'Nadya', 'Nurul', 'Putri', 'Rahma', 'Rania',
  'Safira', 'Salsabila', 'Salma', 'Siti', 'Syifa', 'Tia', 'Vina', 'Zahra', 'Adelia', 'Amanda',
  'Annisa', 'Bella', 'Chelsea', 'Clarissa', 'Della', 'Desi', 'Dian', 'Elsa', 'Fitri', 'Febri',
  'Ghaida', 'Jessica', 'Karina', 'Keisha', 'Keysha', 'Lestari', 'Melani', 'Mutia', 'Nadia', 'Nayla',
  'Olivia', 'Raisa', 'Sabrina', 'Salsa', 'Sheila', 'Tiara', 'Widya', 'Wulan', 'Yasmin', 'Zaskia'
]
const LAST_NAMES_FEMALE = [
  'Lestari', 'Putri', 'Anggraini', 'Dewi', 'Wulandari', 'Maharani', 'Safitri', 'Kusumawati', 'Utami',
  'Rahmawati', 'Sari', 'Azzahra', 'Handayani', 'Pratiwi', 'Novita', 'Susanti', 'Wulandari', 'Puspita',
  'Kusuma', 'Siregar', 'Nasution', 'Lubis', 'Tanjung', 'Batubara', 'Pohan', 'Harahap', 'Pasaribu',
  'Simanjuntak', 'Hutapea', 'Panjaitan', 'Sihombing', 'Sitompul', 'Samosir', 'Sinaga', 'Manurung'
]

function ensureMinimumStudentsPerClass(db: SchoolDatabase): boolean {
  let modified = false
  if (!Array.isArray(db.users)) db.users = []
  if (!Array.isArray(db.nilais)) db.nilais = []
  if (!Array.isArray(db.raports)) db.raports = []

  const targetCountPerClass = 26
  const usedNames = new Set(
    db.users
      .filter((u) => u.siswaProfile?.namaLengkap)
      .map((u) => u.siswaProfile!.namaLengkap.toLowerCase().trim())
  )

  db.kelas.forEach((kls, kIdx) => {
    const existingStudentsInClass = db.users.filter(
      (u) => u.role === 'SISWA' && u.siswaProfile?.kelasId === kls.id
    )

    if (existingStudentsInClass.length < 25) {
      modified = true
      const needed = targetCountPerClass - existingStudentsInClass.length

      for (let i = 0; i < needed; i++) {
        const studentIndex = existingStudentsInClass.length + i + 1
        const isMale = studentIndex % 2 === 1
        const firstArr = isMale ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE
        const lastArr = isMale ? LAST_NAMES_MALE : LAST_NAMES_FEMALE

        let fn = firstArr[(kIdx * 7 + studentIndex) % firstArr.length]
        let ln = lastArr[(kIdx * 5 + studentIndex * 3) % lastArr.length]
        let namaLengkap = `${fn} ${ln}`
        let attempts = 0
        while (usedNames.has(namaLengkap.toLowerCase().trim()) && attempts < 100) {
          attempts++
          fn = firstArr[(kIdx * 7 + studentIndex + attempts) % firstArr.length]
          ln = lastArr[(kIdx * 5 + studentIndex * 3 + attempts) % lastArr.length]
          namaLengkap = `${fn} ${ln}`
        }
        usedNames.add(namaLengkap.toLowerCase().trim())

        const gradeLevel = kls.tingkat || '10'
        const cohortYear = gradeLevel === '10' ? '26' : gradeLevel === '11' ? '25' : '24'
        const classCode = String(kIdx + 1).padStart(2, '0')
        const rollCode = String(studentIndex).padStart(2, '0')

        const nis = `${cohortYear}${classCode}${rollCode}`
        const nisn = `00${cohortYear}${classCode}${rollCode}9`
        const userId = `usr-gen-${kls.id}-${studentIndex}`
        const profileId = `prof-gen-${kls.id}-${studentIndex}`

        const newUser: UserAccount = {
          id: userId,
          username: `siswa_${nis}`,
          email: `${fn.toLowerCase()}.${ln.toLowerCase()}_${cohortYear}@siswa.sch.id`.replace(/\s+/g, ''),
          password: 'siswa' + nis,
          role: 'SISWA',
          createdAt: '2026-07-15T08:00:00.000Z',
          updatedAt: '2026-10-20T10:00:00.000Z',
          siswaProfile: {
            id: profileId,
            userId,
            nis,
            nisn,
            namaLengkap,
            kelasId: kls.id,
            jenisKelamin: isMale ? 'L' : 'P',
            tempatLahir: isMale ? 'Jakarta' : 'Bandung',
            tanggalLahir: `200${gradeLevel === '10' ? '8' : gradeLevel === '11' ? '7' : '6'}-0${(studentIndex % 9) + 1}-15`,
            alamat: `Jl. Pendidikan No. ${studentIndex * 3}, Jakarta`,
            namaOrangTua: `Bpk/Ibu ${ln}`,
            noHp: `0812${String(kIdx + 1).padStart(2, '0')}${String(studentIndex).padStart(2, '0')}8899`,
          },
        }

        db.users.push(newUser)

        // Seed initial Nilai for each subject
        db.mapel.forEach((m) => {
          const t = 75 + ((studentIndex * 3 + m.kkm) % 23)
          const uh = 75 + ((studentIndex * 2 + m.kkm + 5) % 22)
          const uts = 74 + ((studentIndex * 4 + m.kkm + 2) % 24)
          const uas = 76 + ((studentIndex * 5 + m.kkm + 1) % 23)
          const akhir = Number(((t * 0.2 + uh * 0.2 + uts * 0.3 + uas * 0.3)).toFixed(1))

          let predikat = 'B'
          if (akhir >= 88) predikat = 'A'
          else if (akhir >= 78) predikat = 'B'
          else if (akhir >= 68) predikat = 'C'
          else predikat = 'D'

          db.nilais.push({
            id: `nil-gen-${kls.id}-${profileId}-${m.id}`,
            siswaId: profileId,
            mapelId: m.id,
            kelasId: kls.id,
            guruId: 'guru-profile-01',
            semester: '1 (Ganjil)',
            tahunAjaran: '2025/2026',
            nilaiTugas: t,
            nilaiUh: uh,
            nilaiUts: uts,
            nilaiUas: uas,
            nilaiPraktik: 85,
            nilaiSikap: 90,
            nilaiAkhir: akhir,
            predikat,
            catatan: akhir >= 85 ? 'Sangat menguasai kompetensi dasar.' : 'Cukup baik, pertahankan motivasi belajar.',
            updatedAt: '2026-10-20T10:00:00.000Z',
          })
        })

        // Seed Raport
        db.raports.push({
          id: `rap-gen-${profileId}`,
          siswaId: profileId,
          kelasId: kls.id,
          semester: '1 (Ganjil)',
          tahunAjaran: '2025/2026',
          totalHadir: 18,
          totalIzin: 1,
          totalSakit: 1,
          totalAlfa: 0,
          rataRataNilai: 84.5,
          catatanWaliKelas: 'Tingkatkan prestasi belajar dan terus aktif dalam kegiatan sekolah.',
          status: 'DRAFT', // Locked by default until teacher opens it
          updatedAt: '2026-10-20T10:00:00.000Z',
        })
      }
    }
  })

  return modified
}

// Persistent File Database
export function getSchoolDb(): SchoolDatabase {
  try {
    const resolvedPath = getDbFilePath()
    if (fs.existsSync(/*turbopackIgnore: true*/ resolvedPath)) {
      const fileData = fs.readFileSync(/*turbopackIgnore: true*/ resolvedPath, 'utf-8')
      if (fileData && fileData.trim().length > 0) {
        const parsed = JSON.parse(fileData) as SchoolDatabase
        let needsSync = false

        if (!parsed.materis) {
          parsed.materis = DEFAULT_DATABASE.materis
          needsSync = true
        }
        if (!parsed.pengumumanKelas) {
          parsed.pengumumanKelas = DEFAULT_DATABASE.pengumumanKelas
          needsSync = true
        }
        if (!parsed.catatanBimbingan) {
          parsed.catatanBimbingan = DEFAULT_DATABASE.catatanBimbingan
          needsSync = true
        }
        if (!parsed.pekerjaanRumah || parsed.pekerjaanRumah.length === 0) {
          parsed.pekerjaanRumah = DEFAULT_DATABASE.pekerjaanRumah
          needsSync = true
        }
        if (!parsed.bobotNilai) {
          parsed.bobotNilai = DEFAULT_DATABASE.bobotNilai
          needsSync = true
        }

        // Ensure nilais have nilaiUh field
        if (Array.isArray(parsed.nilais)) {
          parsed.nilais.forEach((n) => {
            if (typeof n.nilaiUh === 'undefined') {
              n.nilaiUh = n.nilaiTugas || 80
              needsSync = true
            }
          })
        }

        // Ensure every class has at least 25 students (seeds to 26 students)
        if (ensureMinimumStudentsPerClass(parsed)) {
          needsSync = true
        }

        if (needsSync) {
          saveSchoolDb(parsed)
        }
        return parsed
      }
    }
  } catch (err) {
    console.warn('Failed to read school-store.json from disk, falling back to default:', err)
  }

  // Initialize file with default data if missing or empty
  const defaultCopy: SchoolDatabase = JSON.parse(JSON.stringify(DEFAULT_DATABASE))
  ensureMinimumStudentsPerClass(defaultCopy)
  saveSchoolDb(defaultCopy)
  return defaultCopy
}

export function saveSchoolDb(db: SchoolDatabase): boolean {
  try {
    const primaryPath = getDbFilePath()
    const dir = path.dirname(primaryPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    const content = JSON.stringify(db, null, 2)
    fs.writeFileSync(primaryPath, content, 'utf-8')

    // Also sync to alternative paths if their directory exists
    const altPaths = [
      path.join(process.cwd(), 'src', 'data', 'school-store.json'),
      path.join(process.cwd(), 'sekolah', 'src', 'data', 'school-store.json'),
    ]
    for (const alt of altPaths) {
      if (alt !== primaryPath) {
        const altDir = path.dirname(alt)
        if (fs.existsSync(altDir)) {
          fs.writeFileSync(alt, content, 'utf-8')
        }
      }
    }

    return true
  } catch (err) {
    console.error('Failed to save school-store.json to disk:', err)
    return false
  }
}
