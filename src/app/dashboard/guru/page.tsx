'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  School,
  Clock,
  UserCheck,
  Award,
  Users,
  Search,
  Plus,
  RefreshCw,
  LogOut,
  Calendar,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  Trash2,
  Edit3,
  Sliders,
  Upload,
  Eye,
  EyeOff,
  MessageSquare,
  Lock,
  User,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowUpRight,
  BarChart3,
  Check,
  X,
  FileCheck,
  Download,
  AlertOctagon,
  Clock3,
  Save,
  Unlock,
  Printer,
} from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import DualImageInput from '@/components/common/DualImageInput'

// --- Interfaces ---
interface JadwalItem {
  id: string
  hari: string
  jamMulai: string
  jamSelesai: string
  kelasId: string
  mapelId: string
  guruId: string
  ruangan: string
  kelas?: { namaKelas: string }
  mapel?: { namaMapel: string; kodeMapel: string }
  guru?: { namaLengkap: string }
}

interface KelasOption {
  id: string
  namaKelas: string
  tingkat: string
  waliKelas?: { namaLengkap: string }
  _count?: { siswas: number }
}

interface MapelOption {
  id: string
  kodeMapel: string
  namaMapel: string
  kkm: number
}

const DEFAULT_KELAS_LIST: KelasOption[] = [
  { id: 'kelas-10-mipa1', namaKelas: 'X MIPA 1', tingkat: '10' },
  { id: 'kelas-10-mipa2', namaKelas: 'X MIPA 2', tingkat: '10' },
  { id: 'kelas-10-ips1', namaKelas: 'X IPS 1', tingkat: '10' },
  { id: 'kelas-10-ips2', namaKelas: 'X IPS 2', tingkat: '10' },
  { id: 'kelas-11-mipa1', namaKelas: 'XI MIPA 1', tingkat: '11' },
  { id: 'kelas-11-mipa2', namaKelas: 'XI MIPA 2', tingkat: '11' },
  { id: 'kelas-11-ips1', namaKelas: 'XI IPS 1', tingkat: '11' },
  { id: 'kelas-11-ips2', namaKelas: 'XI IPS 2', tingkat: '11' },
  { id: 'kelas-12-mipa1', namaKelas: 'XII MIPA 1', tingkat: '12' },
  { id: 'kelas-12-mipa2', namaKelas: 'XII MIPA 2', tingkat: '12' },
  { id: 'kelas-12-ips1', namaKelas: 'XII IPS 1', tingkat: '12' },
  { id: 'kelas-12-ips2', namaKelas: 'XII IPS 2', tingkat: '12' },
]

const DEFAULT_MAPEL_LIST: MapelOption[] = [
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
]

interface SiswaItem {
  id: string
  userId?: string
  namaLengkap: string
  nis: string
  nisn: string
  kelasId: string
  jenisKelamin?: string
  noHp?: string
  password?: string
  kelas?: { namaKelas: string }
}

interface GuruItem {
  id: string
  userId?: string
  username?: string
  email?: string
  namaLengkap: string
  nip: string
  mataPelajaranUtama?: string
  noHp?: string
  password?: string
}

interface SesiAbsensiHistory {
  id: string
  pertemuanKe: number
  tanggal: string
  keterangan?: string
  kelasId: string
  mapelId: string
  kelas?: { namaKelas: string }
  mapel?: { namaMapel: string }
  details?: Array<{
    id: string
    siswaId: string
    status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA'
    catatan?: string
    siswa?: { namaLengkap: string; nis: string; nisn?: string }
  }>
}

interface NilaiRow {
  siswaId: string
  mapelId?: string
  namaLengkap: string
  nis: string
  nisn: string
  nilaiTugas: number
  nilaiUh: number
  nilaiUts: number
  nilaiUas: number
  nilaiPraktik: number
  nilaiSikap: number
  nilaiAkhir: number
  predikat: string
  catatan: string
}

interface HomeworkSubmission {
  siswaId: string
  siswaNama?: string
  nisn?: string
  nis?: string
  submissionText: string
  fileUrl?: string
  submittedAt: string
  status: 'SUBMITTED' | 'GRADED' | 'UNSUBMITTED'
  nilai?: number
  catatanGuru?: string
  isSubmitted?: boolean
}

interface TaskItem {
  id: string
  judul: string
  deskripsi: string
  mapelId: string
  kelasId: string
  guruId: string
  tenggatWaktu: string
  createdAt: string
  mapel?: { namaMapel: string }
  kelas?: { namaKelas: string }
  totalSiswa?: number
  sudahMengumpulkan?: number
  belumMengumpulkan?: number
  belumDinilai?: number
  isOverdue?: boolean
  submissions?: HomeworkSubmission[]
  submissionRoster?: HomeworkSubmission[]
}

interface MateriItem {
  id: string
  judul: string
  deskripsi?: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSizeBytes: number
  kelasId: string
  mapelId: string
  guruId: string
  createdAt: string
  kelas?: { namaKelas: string }
  mapel?: { namaMapel: string }
}

interface PengumumanItem {
  id: string
  judul: string
  konten: string
  prioritas: 'NORMAL' | 'PENTING' | 'MENDESAK'
  kelasId: string
  guruId: string
  createdAt: string
  kelas?: { namaKelas: string }
}

interface BimbinganItem {
  id: string
  siswaId: string
  guruId: string
  kategori: 'Akademik' | 'Kedisiplinan' | 'Prestasi' | 'Konseling'
  catatan: string
  tindakan?: string
  tanggal: string
  siswa?: { namaLengkap: string; nisn: string; kelas?: { namaKelas: string } }
}

export default function GuruDashboardPage() {
  const router = useRouter()

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    'ringkasan' | 'kelas_siswa' | 'presensi' | 'nilai' | 'tugas_materi' | 'raport' | 'profil'
  >('ringkasan')

  // Sub-tabs
  const [tugasSubTab, setTugasSubTab] = useState<'tugas' | 'materi'>('tugas')
  const [presensiSubTab, setPresensiSubTab] = useState<'input' | 'rekap'>('input')

  // Raport Digital States
  const [selectedKelasRaport, setSelectedKelasRaport] = useState<string>('kelas-10-mipa1')
  const [raportRecords, setRaportRecords] = useState<any[]>([])
  const [loadingRaport, setLoadingRaport] = useState(false)
  const [selectedStudentForRaport, setSelectedStudentForRaport] = useState<{
    siswa: SiswaItem
    raport?: any
    nilais?: any[]
  } | null>(null)
  const [showRaportDetailModal, setShowRaportDetailModal] = useState(false)
  const [raportDetailForm, setRaportDetailForm] = useState({
    catatanWaliKelas: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
  })
  const [savingRaport, setSavingRaport] = useState(false)

  // Global loading
  const [loading, setLoading] = useState(true)

  // Teacher Profile state
  const [teacherProfile, setTeacherProfile] = useState({
    id: '',
    userId: '',
    namaLengkap: '',
    nip: '',
    mapelUtama: '',
    noHp: '',
    email: '',
    avatarUrl: '',
    bio: '',
  })

  // Master Data (Initialized with complete 12 classes & 17 subjects)
  const [kelasList, setKelasList] = useState<KelasOption[]>(DEFAULT_KELAS_LIST)
  const [mapelList, setMapelList] = useState<MapelOption[]>(DEFAULT_MAPEL_LIST)
  const [jadwalList, setJadwalList] = useState<JadwalItem[]>([])
  const [allSiswa, setAllSiswa] = useState<SiswaItem[]>([])
  const [guruList, setGuruList] = useState<GuruItem[]>([])
  const [direktoriMode, setDirektoriMode] = useState<'siswa' | 'guru'>('siswa')
  const [guruSearch, setGuruSearch] = useState<string>('')
  const [visibleStudentPasswords, setVisibleStudentPasswords] = useState<Record<string, boolean>>({})
  const [visibleTeacherPasswords, setVisibleTeacherPasswords] = useState<Record<string, boolean>>({})

  const toggleStudentPasswordVisibility = (siswaId: string) => {
    setVisibleStudentPasswords((prev) => ({
      ...prev,
      [siswaId]: !prev[siswaId],
    }))
  }

  const toggleTeacherPasswordVisibility = (guruId: string) => {
    setVisibleTeacherPasswords((prev) => ({
      ...prev,
      [guruId]: !prev[guruId],
    }))
  }

  // Presensi State
  const [selectedKelasAbsensi, setSelectedKelasAbsensi] = useState<string>('kelas-10-mipa1')
  const [selectedMapelAbsensi, setSelectedMapelAbsensi] = useState<string>('mapel-mtk')
  const [tanggalAbsensi, setTanggalAbsensi] = useState<string>('2026-10-21')
  const [pertemuanKe, setPertemuanKe] = useState<number>(1)
  const [keteranganAbsensi, setKeteranganAbsensi] = useState<string>('')
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, { status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA'; catatan: string }>
  >({})
  const [absensiHistory, setAbsensiHistory] = useState<SesiAbsensiHistory[]>([])
  const [rekapPresensiList, setRekapPresensiList] = useState<
    Array<{
      siswaId: string
      namaLengkap: string
      nisn: string
      nis: string
      hadir: number
      izin: number
      sakit: number
      alfa: number
      totalSesi: number
      persentase: number
      isWarning: boolean
    }>
  >([])
  const [submittingAbsensi, setSubmittingAbsensi] = useState(false)
  const [duplicateWarning, setDuplicateWarning] = useState<{
    hasDuplicate: boolean
    existingId?: string
    message?: string
  }>({ hasDuplicate: false })

  // Nilai State
  const [selectedKelasNilai, setSelectedKelasNilai] = useState<string>('kelas-10-mipa1')
  const [selectedMapelNilai, setSelectedMapelNilai] = useState<string>('mapel-mtk')
  const [bobotNilai, setBobotNilai] = useState({ tugas: 25, uh: 25, uts: 25, uas: 25 })
  const [nilaiRows, setNilaiRows] = useState<NilaiRow[]>([])
  const [submittingNilai, setSubmittingNilai] = useState(false)
  const [showBobotModal, setShowBobotModal] = useState(false)
  const [tempBobot, setTempBobot] = useState({ tugas: 25, uh: 25, uts: 25, uas: 25 })

  // Tasks (Tugas) State
  const [taskList, setTaskList] = useState<TaskItem[]>([])
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false)
  const [newTaskForm, setNewTaskForm] = useState({
    judul: '',
    deskripsi: '',
    kelasId: 'kelas-10-mipa1',
    mapelId: 'mapel-mtk',
    tenggatWaktu: '2026-10-25T23:59',
  })
  const [selectedTaskForReview, setSelectedTaskForReview] = useState<TaskItem | null>(null)
  const [gradingModalData, setGradingModalData] = useState<{
    prId: string
    siswaId: string
    siswaNama: string
    nilai: number
    catatanGuru: string
    fileUrl?: string
    submissionText?: string
  } | null>(null)

  // Materi State
  const [materiList, setMateriList] = useState<MateriItem[]>([])
  const [showUploadMateriModal, setShowUploadMateriModal] = useState(false)
  const [newMateriForm, setNewMateriForm] = useState({
    judul: '',
    deskripsi: '',
    fileName: '',
    fileType: 'pdf',
    fileSizeBytes: 2048576,
    kelasId: 'kelas-10-mipa1',
    mapelId: 'mapel-mtk',
  })

  // Raport Memoized Stats
  const studentsInSelectedRaportClass = useMemo(() => {
    return allSiswa.filter((s) => s.kelasId === selectedKelasRaport)
  }, [allSiswa, selectedKelasRaport])

  const currentRaportKelasObj = useMemo(() => {
    return kelasList.find((k) => k.id === selectedKelasRaport)
  }, [kelasList, selectedKelasRaport])

  const countPublished = useMemo(() => {
    return studentsInSelectedRaportClass.filter((st) => {
      const rap = raportRecords.find((r) => r.siswaId === st.id || r.siswaId === st.userId)
      return rap?.status === 'PUBLISHED'
    }).length
  }, [studentsInSelectedRaportClass, raportRecords])

  const countLocked = useMemo(() => {
    return Math.max(0, studentsInSelectedRaportClass.length - countPublished)
  }, [studentsInSelectedRaportClass, countPublished])
  const [todayName, setTodayName] = useState('Senin')

  // Filter & Search states
  const [hariFilter, setHariFilter] = useState<string>('Semua')
  const [siswaSearch, setSiswaSearch] = useState<string>('')
  const [siswaKelasFilter, setSiswaKelasFilter] = useState<string>('Semua')

  // Profil Form
  const [profileForm, setProfileForm] = useState({
    namaLengkap: '',
    nip: '',
    mataPelajaranUtama: '',
    noHp: '',
    email: '',
    avatarUrl: '',
    bio: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  // Generic Confirmation Modal
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  })

  // Toast feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 4000)
  }

  // --- Initial Data Load ---
  const loadPortalData = useCallback(async () => {
    setLoading(true)
    try {
      const [
        resMe,
        resMaster,
        resJadwal,
        resAbsensi,
        resSiswa,
        resNilai,
        resPr,
        resMateri,
        resRaport,
      ] = await Promise.all([
        fetch('/api/auth/me').catch(() => null),
        fetch('/api/admin/master').catch(() => null),
        fetch('/api/jadwal').catch(() => null),
        fetch('/api/absensi').catch(() => null),
        fetch('/api/siswa').then((r) => r.ok ? r : fetch('/api/admin/siswa-dashboard')).catch(() => fetch('/api/admin/siswa-dashboard')).catch(() => null),
        fetch('/api/nilai').catch(() => null),
        fetch('/api/pr').catch(() => null),
        fetch('/api/materi').catch(() => null),
        fetch('/api/raport').catch(() => null),
      ])

      const dataMe = resMe ? await resMe.json().catch(() => ({})) : {}
      const dataMaster = resMaster ? await resMaster.json().catch(() => ({})) : {}
      const dataJadwal = resJadwal ? await resJadwal.json().catch(() => ({})) : {}
      const dataAbsensi = resAbsensi ? await resAbsensi.json().catch(() => ({})) : {}
      const dataSiswa = resSiswa ? await resSiswa.json().catch(() => ({})) : {}
      const dataNilai = resNilai ? await resNilai.json().catch(() => ({})) : {}
      const dataPr = resPr ? await resPr.json().catch(() => ({})) : {}
      const dataMateri = resMateri ? await resMateri.json().catch(() => ({})) : {}
      const dataRaport = resRaport ? await resRaport.json().catch(() => ({})) : {}

      if (!resMe || !dataMe.success || !dataMe.data) {
        router.push('/login')
        return
      }

      if (dataMe.data.role !== 'GURU' && dataMe.data.role !== 'ADMIN') {
        router.push('/dashboard/siswa')
        return
      }

      if (dataMe.success && dataMe.data?.details) {
        const d = dataMe.data.details
        const gp = d.guruProfile || {}
        const prof = {
          id: gp.id || dataMe.data.profileId || 'guru-profile-01',
          userId: d.id || '',
          namaLengkap: gp.namaLengkap || dataMe.data.namaLengkap || 'Budi Santoso, S.Pd.',
          nip: gp.nip || '198501012010011001',
          mapelUtama: gp.mataPelajaranUtama || 'Matematika Wajib',
          noHp: gp.noHp || '081234567890',
          email: d.email || 'budi.santoso@sekolah.sch.id',
          avatarUrl: gp.avatarUrl || '',
          bio: gp.bio || 'Guru Pengampu Mata Pelajaran Matematika Wajib & Pembina Olimpiade Sains',
        }
        setTeacherProfile(prof)
        setProfileForm({
          namaLengkap: prof.namaLengkap,
          nip: prof.nip,
          mataPelajaranUtama: prof.mapelUtama,
          noHp: prof.noHp,
          email: prof.email,
          avatarUrl: prof.avatarUrl,
          bio: prof.bio,
        })
      }

      if (dataMaster.success && dataMaster.data && Array.isArray(dataMaster.data.kelas) && dataMaster.data.kelas.length > 0) {
        setKelasList(dataMaster.data.kelas)
      } else {
        setKelasList(DEFAULT_KELAS_LIST)
      }

      if (dataMaster.success && dataMaster.data && Array.isArray(dataMaster.data.mapel) && dataMaster.data.mapel.length > 0) {
        setMapelList(dataMaster.data.mapel)
      } else {
        setMapelList(DEFAULT_MAPEL_LIST)
      }

      if (dataJadwal.success && Array.isArray(dataJadwal.data)) {
        setJadwalList(dataJadwal.data)
      }

      if (dataAbsensi.success) {
        if (Array.isArray(dataAbsensi.data)) setAbsensiHistory(dataAbsensi.data)
        if (Array.isArray(dataAbsensi.rekap)) setRekapPresensiList(dataAbsensi.rekap)
      }

      if (dataMaster.success && dataMaster.data && Array.isArray(dataMaster.data.guru)) {
        setGuruList(dataMaster.data.guru)
      }

      let studentsArray: SiswaItem[] = []
      if (dataSiswa.success && Array.isArray(dataSiswa.data)) {
        studentsArray = dataSiswa.data
        setAllSiswa(studentsArray)
      }

      if (dataNilai.success) {
        if (dataNilai.bobot) {
          setBobotNilai(dataNilai.bobot)
          setTempBobot(dataNilai.bobot)
        }
      }

      if (dataPr.success && Array.isArray(dataPr.data)) {
        setTaskList(dataPr.data)
      }

      if (dataMateri.success && Array.isArray(dataMateri.data)) {
        setMateriList(dataMateri.data)
      }

      if (dataRaport.success && Array.isArray(dataRaport.data)) {
        setRaportRecords(dataRaport.data)
      }

      // Initialize Attendance and Grade tables for default class
      const defaultClassId = 'kelas-10-mipa1'
      const studentsInDefaultClass = studentsArray.filter((s) => s.kelasId === defaultClassId || !s.kelasId)

      const initialAttendance: Record<string, { status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA'; catatan: string }> = {}
      studentsInDefaultClass.forEach((st) => {
        initialAttendance[st.id] = { status: 'HADIR', catatan: '' }
      })
      setAttendanceRecords(initialAttendance)

      initGradesForClass(studentsInDefaultClass, dataNilai.data || [], 'mapel-mtk', dataNilai.bobot)

      // Set client-computed current day and date
      const daysIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
      const now = new Date()
      setTodayName(daysIndo[now.getDay()])
      setTanggalAbsensi(now.toISOString().split('T')[0])
    } catch {
      showFeedback('error', 'Gagal memuat kelengkapan data portal guru')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPortalData()
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get('tab')
      if (
        tabParam &&
        ['ringkasan', 'kelas_siswa', 'presensi', 'nilai', 'tugas_materi', 'raport', 'pengumuman_bimbingan', 'profil'].includes(
          tabParam
        )
      ) {
        setActiveTab(tabParam as any)
      }
    }
  }, [loadPortalData])

  // --- Grade Table Builder ---
  const initGradesForClass = (
    students: SiswaItem[],
    existingGrades: Array<{
      siswaId: string
      mapelId?: string
      nilaiTugas: number
      nilaiUh?: number
      nilaiUts: number
      nilaiUas: number
      nilaiPraktik: number
      nilaiSikap: number
      nilaiAkhir: number
      predikat: string
      catatan?: string
    }>,
    mapelId: string,
    customBobot?: { tugas: number; uh: number; uts: number; uas: number }
  ) => {
    const bobot = customBobot || bobotNilai
    const sumW = bobot.tugas + bobot.uh + bobot.uts + bobot.uas || 100

    const rows: NilaiRow[] = students.map((s) => {
      const match = existingGrades.find(
        (g) => (g.siswaId === s.id || g.siswaId === s.userId) && (!g.mapelId || g.mapelId === mapelId)
      )
      const t = match?.nilaiTugas ?? 80
      const uh = match?.nilaiUh ?? match?.nilaiTugas ?? 80
      const uts = match?.nilaiUts ?? 80
      const uas = match?.nilaiUas ?? 80
      const prk = match?.nilaiPraktik ?? 85
      const skp = match?.nilaiSikap ?? 90

      const calculatedAkhir = Number(
        ((t * bobot.tugas + uh * bobot.uh + uts * bobot.uts + uas * bobot.uas) / sumW).toFixed(2)
      )

      let pred = match?.predikat ?? 'B'
      if (calculatedAkhir >= 88) pred = 'A'
      else if (calculatedAkhir >= 78) pred = 'B'
      else if (calculatedAkhir >= 68) pred = 'C'
      else pred = 'D'

      return {
        siswaId: s.id,
        mapelId,
        namaLengkap: s.namaLengkap,
        nis: s.nis,
        nisn: s.nisn,
        nilaiTugas: t,
        nilaiUh: uh,
        nilaiUts: uts,
        nilaiUas: uas,
        nilaiPraktik: prk,
        nilaiSikap: skp,
        nilaiAkhir: calculatedAkhir,
        predikat: pred,
        catatan: match?.catatan || '',
      }
    })
    setNilaiRows(rows)
  }

  // Handle Class Switch in Nilai
  const handleKelasNilaiChange = async (kId: string) => {
    setSelectedKelasNilai(kId)
    const studentsInClass = allSiswa.filter((s) => s.kelasId === kId)
    try {
      const res = await fetch(`/api/nilai?kelasId=${kId}&mapelId=${selectedMapelNilai}`)
      const j = await res.json()
      if (j.success && Array.isArray(j.data)) {
        initGradesForClass(studentsInClass, j.data, selectedMapelNilai)
        return
      }
    } catch { }
    initGradesForClass(studentsInClass, [], selectedMapelNilai)
  }

  // Handle Mapel Switch in Nilai
  const handleMapelNilaiChange = async (mId: string) => {
    setSelectedMapelNilai(mId)
    const studentsInClass = allSiswa.filter((s) => s.kelasId === selectedKelasNilai)
    try {
      const res = await fetch(`/api/nilai?kelasId=${selectedKelasNilai}&mapelId=${mId}`)
      const j = await res.json()
      if (j.success && Array.isArray(j.data)) {
        initGradesForClass(studentsInClass, j.data, mId)
        return
      }
    } catch { }
    initGradesForClass(studentsInClass, [], mId)
  }

  // Handle Class Switch in Absensi
  const handleKelasAbsensiChange = async (kId: string) => {
    setSelectedKelasAbsensi(kId)
    const studentsInClass = allSiswa.filter((s) => s.kelasId === kId)
    const records: Record<string, { status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA'; catatan: string }> = {}
    studentsInClass.forEach((st) => {
      records[st.id] = { status: 'HADIR', catatan: '' }
    })
    setAttendanceRecords(records)

    // Check duplicate
    checkDuplicateAttendance(kId, selectedMapelAbsensi, tanggalAbsensi)

    // Refresh rekap
    try {
      const res = await fetch(`/api/absensi?kelasId=${kId}`)
      const j = await res.json()
      if (j.success && Array.isArray(j.rekap)) setRekapPresensiList(j.rekap)
    } catch {
      // non-blocking
    }
  }

  // Check Duplicate Attendance
  const checkDuplicateAttendance = (kId: string, mId: string, tgl: string) => {
    const existing = absensiHistory.find((s) => s.kelasId === kId && s.mapelId === mId && s.tanggal === tgl)
    if (existing) {
      setDuplicateWarning({
        hasDuplicate: true,
        existingId: existing.id,
        message: `Presensi kelas ini pada tanggal ${tgl} sudah pernah diinput sebelumnya (Pertemuan Ke-${existing.pertemuanKe}).`,
      })
      // Fill records from existing history if teacher wants to edit
      if (existing.details) {
        const loaded: Record<string, { status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA'; catatan: string }> = {}
        existing.details.forEach((d) => {
          loaded[d.siswaId] = { status: d.status, catatan: d.catatan || '' }
        })
        setAttendanceRecords(loaded)
        setPertemuanKe(existing.pertemuanKe)
        setKeteranganAbsensi(existing.keterangan || '')
      }
    } else {
      setDuplicateWarning({ hasDuplicate: false })
    }
  }

  // "Hadirkan Semua" Button
  const handleMarkAllHadir = () => {
    const studentsInClass = allSiswa.filter((s) => s.kelasId === selectedKelasAbsensi)
    const updated: Record<string, { status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA'; catatan: string }> = {}
    studentsInClass.forEach((st) => {
      updated[st.id] = { status: 'HADIR', catatan: attendanceRecords[st.id]?.catatan || '' }
    })
    setAttendanceRecords(updated)
    showFeedback('success', 'Semua siswa berhasil ditandai HADIR!')
  }

  // Save Attendance
  const handleSaveAbsensi = async (forceOverwrite = false) => {
    setSubmittingAbsensi(true)
    try {
      const studentsInClass = allSiswa.filter((s) => s.kelasId === selectedKelasAbsensi)
      const recordsArray = studentsInClass.map((st) => ({
        siswaId: st.id,
        status: attendanceRecords[st.id]?.status || 'HADIR',
        catatan: attendanceRecords[st.id]?.catatan || '',
      }))

      const res = await fetch('/api/absensi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kelasId: selectedKelasAbsensi,
          mapelId: selectedMapelAbsensi,
          tanggal: tanggalAbsensi,
          pertemuanKe,
          keterangan: keteranganAbsensi,
          records: recordsArray,
          allowOverwrite: forceOverwrite || duplicateWarning.hasDuplicate,
        }),
      })

      const json = await res.json()
      if (json.success) {
        showFeedback('success', forceOverwrite ? 'Presensi berhasil diperbarui!' : 'Presensi siswa berhasil disimpan!')
        setDuplicateWarning({ hasDuplicate: false })

        // Real-time notification broadcast to all connected student devices & tabs
        if (typeof window !== 'undefined') {
          try {
            const channel = new BroadcastChannel('sekolah_realtime_sync')
            channel.postMessage({
              type: 'ABSENSI_UPDATED',
              kelasId: selectedKelasAbsensi,
              mapelId: selectedMapelAbsensi,
              pertemuanKe,
              timestamp: Date.now(),
            })
            channel.close()
          } catch {
            // BroadcastChannel fallback
          }
          try {
            localStorage.setItem(
              'sekolah_last_absensi_sync',
              JSON.stringify({
                kelasId: selectedKelasAbsensi,
                timestamp: Date.now(),
              })
            )
          } catch {
            // localStorage fallback
          }
        }

        // Refresh absensi list & rekap
        const updatedRes = await fetch(`/api/absensi?kelasId=${selectedKelasAbsensi}&t=${Date.now()}`, {
          cache: 'no-store',
        })
        const updatedJson = await updatedRes.json()
        if (updatedJson.success) {
          if (Array.isArray(updatedJson.data)) setAbsensiHistory(updatedJson.data)
          if (Array.isArray(updatedJson.rekap)) setRekapPresensiList(updatedJson.rekap)
        }
      } else if (json.duplicate) {
        setDuplicateWarning({
          hasDuplicate: true,
          existingId: json.existingId,
          message: json.message,
        })
        showFeedback('error', json.message)
      } else {
        showFeedback('error', json.message || 'Gagal menyimpan absensi')
      }
    } catch {
      showFeedback('error', 'Terjadi kesalahan jaringan saat menyimpan absensi')
    } finally {
      setSubmittingAbsensi(false)
    }
  }

  // Live Recalculate Nilai for Single Row
  const handleGradeCellChange = (
    index: number,
    field: 'nilaiTugas' | 'nilaiUh' | 'nilaiUts' | 'nilaiUas' | 'nilaiPraktik' | 'nilaiSikap' | 'catatan',
    val: string
  ) => {
    const updated = [...nilaiRows]
    const row = { ...updated[index] }

    if (field === 'catatan') {
      row.catatan = val
    } else {
      let num = Number(val)
      if (isNaN(num)) num = 0
      if (num < 0) num = 0
      if (num > 100) num = 100

      row[field] = num

      const t = field === 'nilaiTugas' ? num : row.nilaiTugas
      const uh = field === 'nilaiUh' ? num : row.nilaiUh
      const uts = field === 'nilaiUts' ? num : row.nilaiUts
      const uas = field === 'nilaiUas' ? num : row.nilaiUas

      const sumW = bobotNilai.tugas + bobotNilai.uh + bobotNilai.uts + bobotNilai.uas || 100
      const akhir = Number(((t * bobotNilai.tugas + uh * bobotNilai.uh + uts * bobotNilai.uts + uas * bobotNilai.uas) / sumW).toFixed(2))
      row.nilaiAkhir = akhir

      if (akhir >= 88) row.predikat = 'A'
      else if (akhir >= 78) row.predikat = 'B'
      else if (akhir >= 68) row.predikat = 'C'
      else row.predikat = 'D'
    }

    updated[index] = row
    setNilaiRows(updated)
  }

  // Save All Grades (Batch)
  const handleSaveAllGrades = async () => {
    setSubmittingNilai(true)
    try {
      const res = await fetch('/api/nilai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: nilaiRows.map((r) => ({
            siswaId: r.siswaId,
            kelasId: selectedKelasNilai,
            mapelId: selectedMapelNilai,
            nilaiTugas: r.nilaiTugas,
            nilaiUh: r.nilaiUh,
            nilaiUts: r.nilaiUts,
            nilaiUas: r.nilaiUas,
            nilaiPraktik: r.nilaiPraktik,
            nilaiSikap: r.nilaiSikap,
            catatan: r.catatan,
          })),
          bobot: bobotNilai,
        }),
      })

      const json = await res.json()
      if (json.success) {
        showFeedback('success', `Berhasil menyimpan & memperbarui rekap nilai kelas!`)
        try {
          const rNilai = await fetch(`/api/nilai?kelasId=${selectedKelasNilai}&mapelId=${selectedMapelNilai}`)
          const dNilai = await rNilai.json()
          if (dNilai.success && Array.isArray(dNilai.data)) {
            const studentsInClass = allSiswa.filter((s) => s.kelasId === selectedKelasNilai)
            initGradesForClass(studentsInClass, dNilai.data, selectedMapelNilai)
          }
        } catch {
          // non-blocking
        }
      } else {
        showFeedback('error', json.message || 'Gagal menyimpan nilai siswa')
      }
    } catch {
      showFeedback('error', 'Gagal memproses penyimpanan nilai ke server')
    } finally {
      setSubmittingNilai(false)
    }
  }

  // Save Custom Weights
  const handleSaveBobot = async () => {
    const total = tempBobot.tugas + tempBobot.uh + tempBobot.uts + tempBobot.uas
    if (total !== 100) {
      showFeedback('error', `Total bobot penilaian harus tepat 100% (Saat ini: ${total}%)`)
      return
    }

    try {
      const res = await fetch('/api/nilai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'BOBOT',
          bobot: tempBobot,
        }),
      })
      const j = await res.json()
      if (j.success) {
        setBobotNilai(tempBobot)
        setShowBobotModal(false)
        showFeedback('success', 'Pengaturan bobot penilaian berhasil diperbarui!')

        // Recalculate current rows
        const studentsInClass = allSiswa.filter((s) => s.kelasId === selectedKelasNilai)
        initGradesForClass(studentsInClass, nilaiRows, selectedMapelNilai, tempBobot)
      } else {
        showFeedback('error', j.message || 'Gagal menyimpan bobot')
      }
    } catch {
      showFeedback('error', 'Terjadi kesalahan saat menyimpan bobot nilai')
    }
  }

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskForm.judul.trim()) {
      showFeedback('error', 'Judul tugas wajib diisi')
      return
    }

    try {
      const res = await fetch('/api/pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTaskForm),
      })
      const j = await res.json()
      if (j.success) {
        showFeedback('success', 'Tugas berhasil dibuat dan dibagikan ke siswa!')
        setShowCreateTaskModal(false)
        setNewTaskForm({
          judul: '',
          deskripsi: '',
          kelasId: 'kelas-10-mipa1',
          mapelId: 'mapel-mtk',
          tenggatWaktu: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        })
        // Refresh tasks
        const rPr = await fetch('/api/pr')
        const dPr = await rPr.json()
        if (dPr.success) setTaskList(dPr.data)
      } else {
        showFeedback('error', j.message || 'Gagal membuat tugas')
      }
    } catch {
      showFeedback('error', 'Terjadi kesalahan server saat membuat tugas')
    }
  }

  // Grade Student Submission
  const handleSaveGradeSubmission = async () => {
    if (!gradingModalData) return
    try {
      const res = await fetch('/api/pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'GRADE_SUBMISSION',
          prId: gradingModalData.prId,
          siswaId: gradingModalData.siswaId,
          nilai: gradingModalData.nilai,
          catatanGuru: gradingModalData.catatanGuru,
        }),
      })
      const j = await res.json()
      if (j.success) {
        showFeedback('success', `Berhasil memberikan nilai ${gradingModalData.nilai} kepada ${gradingModalData.siswaNama}!`)
        setGradingModalData(null)
        // Refresh tasks
        const rPr = await fetch('/api/pr')
        const dPr = await rPr.json()
        if (dPr.success) {
          setTaskList(dPr.data)
          // Update currently reviewed task
          const updatedSelected = dPr.data.find((p: TaskItem) => p.id === gradingModalData.prId)
          if (updatedSelected) setSelectedTaskForReview(updatedSelected)
        }
      } else {
        showFeedback('error', j.message || 'Gagal menyimpan nilai tugas')
      }
    } catch {
      showFeedback('error', 'Gagal memproses penilaian tugas')
    }
  }

  // Delete Task
  const handleDeleteTask = (tId: string, judul: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Tugas',
      message: `Apakah Anda yakin ingin menghapus tugas "${judul}"? Seluruh pengumpulan tugas siswa terkait juga akan dihapus.`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/pr?id=${tId}`, { method: 'DELETE' })
          const j = await res.json()
          if (j.success) {
            showFeedback('success', 'Tugas berhasil dihapus')
            setTaskList((prev) => prev.filter((p) => p.id !== tId))
            if (selectedTaskForReview?.id === tId) setSelectedTaskForReview(null)
          } else {
            showFeedback('error', j.message || 'Gagal menghapus tugas')
          }
        } catch {
          showFeedback('error', 'Gagal menghubungi server')
        }
        setConfirmDialog((c) => ({ ...c, isOpen: false }))
      },
    })
  }

  // Upload Learning Material
  const handleUploadMateri = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMateriForm.judul.trim() || !newMateriForm.fileName.trim()) {
      showFeedback('error', 'Judul dan nama file materi wajib diisi')
      return
    }

    try {
      const res = await fetch('/api/materi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMateriForm,
          fileUrl: `/documents/${encodeURIComponent(newMateriForm.fileName)}`,
        }),
      })
      const j = await res.json()
      if (j.success) {
        showFeedback('success', 'Materi pembelajaran berhasil diunggah!')
        setShowUploadMateriModal(false)
        setNewMateriForm({
          judul: '',
          deskripsi: '',
          fileName: '',
          fileType: 'pdf',
          fileSizeBytes: 2048576,
          kelasId: 'kelas-10-mipa1',
          mapelId: 'mapel-mtk',
        })
        const rMat = await fetch('/api/materi')
        const dMat = await rMat.json()
        if (dMat.success) setMateriList(dMat.data)
      } else {
        showFeedback('error', j.message || 'Gagal mengunggah materi')
      }
    } catch {
      showFeedback('error', 'Terjadi kesalahan saat mengunggah materi')
    }
  }

  // Delete Materi
  const handleDeleteMateri = (mId: string, judul: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Materi Pelajaran',
      message: `Apakah Anda yakin ingin menghapus materi "${judul}"? File ini tidak akan dapat diakses siswa lagi.`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/materi?id=${mId}`, { method: 'DELETE' })
          const j = await res.json()
          if (j.success) {
            showFeedback('success', 'Materi berhasil dihapus')
            setMateriList((prev) => prev.filter((m) => m.id !== mId))
          } else {
            showFeedback('error', j.message || 'Gagal menghapus materi')
          }
        } catch {
          showFeedback('error', 'Gagal menghubungi server')
        }
        setConfirmDialog((c) => ({ ...c, isOpen: false }))
      },
    })
  }

  // --- RAPORT DIGITAL HANDLERS ---
  const loadRaportForClass = async (kId: string) => {
    setLoadingRaport(true)
    try {
      const res = await fetch(`/api/raport?kelasId=${kId}&_t=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store',
      })
      const j = await res.json()
      if (j.success && Array.isArray(j.data)) {
        setRaportRecords(j.data)
      }
    } catch {
      showFeedback('error', 'Gagal memuat status raport kelas')
    } finally {
      setLoadingRaport(false)
    }
  }

  const handleToggleStudentRaportStatus = async (siswaId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
    try {
      const res = await fetch('/api/raport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          siswaId,
          kelasId: selectedKelasRaport,
          status: nextStatus,
          callerRole: 'GURU',
          guruId: teacherProfile.id,
        }),
      })
      const j = await res.json()
      if (j.success) {
        showFeedback(
          'success',
          `Status izin raport berhasil diubah: ${nextStatus === 'PUBLISHED' ? 'Diizinkan (Terbuka)' : 'Terkunci (Perlu Izin Guru)'}`
        )
        setRaportRecords((prev) => {
          const idx = prev.findIndex((r) => r.siswaId === siswaId)
          if (idx !== -1) {
            const copy = [...prev]
            copy[idx] = { ...copy[idx], status: nextStatus }
            return copy
          }
          return [...prev, { siswaId, kelasId: selectedKelasRaport, status: nextStatus }]
        })
      } else {
        showFeedback('error', j.message || 'Gagal mengubah status izin raport')
      }
    } catch {
      showFeedback('error', 'Terjadi kesalahan saat mengubah izin raport')
    }
  }

  const handleBulkRaportStatus = async (kelasId: string, newStatus: 'PUBLISHED' | 'DRAFT') => {
    // Immediate optimistic update: all student badges and summary cards update instantly
    setRaportRecords((prev) => {
      const copy = [...prev]
      copy.forEach((r) => {
        if (kelasId === 'ALL' || r.kelasId === kelasId) {
          r.status = newStatus
        }
      })
      const classStudents = allSiswa.filter((s) => kelasId === 'ALL' || s.kelasId === kelasId)
      classStudents.forEach((st) => {
        const found = copy.find((r) => r.siswaId === st.id || r.siswaId === st.userId)
        if (found) {
          found.status = newStatus
        } else {
          copy.push({
            id: `raport-${st.id}`,
            siswaId: st.id,
            kelasId: st.kelasId || kelasId,
            status: newStatus,
          })
        }
      })
      return copy
    })

    try {
      const res = await fetch('/api/raport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'BULK_UPDATE_STATUS',
          kelasId,
          status: newStatus,
          callerRole: 'GURU',
          guruId: teacherProfile.id,
        }),
      })
      const j = await res.json()
      if (j.success) {
        showFeedback(
          'success',
          j.message ||
            (newStatus === 'PUBLISHED'
              ? 'Seluruh raport kelas berhasil dibuka (Diizinkan)'
              : 'Seluruh raport kelas berhasil dikunci kembali')
        )
        await loadRaportForClass(kelasId)
      } else {
        showFeedback('error', j.message || 'Gagal mengubah status kelas')
        loadRaportForClass(kelasId)
      }
    } catch {
      showFeedback('error', 'Gagal memproses perubahan izin raport')
      loadRaportForClass(kelasId)
    }
  }

  const handleOpenRaportModal = async (student: SiswaItem, existingRaport?: any) => {
    let studentNilais: any[] = []
    try {
      const res = await fetch(`/api/nilai?siswaId=${student.id}`, { credentials: 'include' })
      const j = await res.json()
      if (j.success && Array.isArray(j.data)) {
        studentNilais = j.data
      }
    } catch { }

    setSelectedStudentForRaport({
      siswa: student,
      raport: existingRaport,
      nilais: studentNilais,
    })
    setRaportDetailForm({
      catatanWaliKelas:
        existingRaport?.catatanWaliKelas ||
        'Pertahankan prestasi belajar, tingkatkan kedisiplinan dan selalu aktif dalam kegiatan sekolah.',
      status: existingRaport?.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
    })
    setShowRaportDetailModal(true)
  }

  const handleSaveRaportModal = async () => {
    if (!selectedStudentForRaport) return
    setSavingRaport(true)
    try {
      const res = await fetch('/api/raport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          siswaId: selectedStudentForRaport.siswa.id,
          kelasId: selectedKelasRaport,
          catatanWaliKelas: raportDetailForm.catatanWaliKelas,
          status: raportDetailForm.status,
          callerRole: 'GURU',
          guruId: teacherProfile.id,
        }),
      })
      const j = await res.json()
      if (j.success) {
        showFeedback('success', 'Pengaturan raport siswa berhasil disimpan!')
        setShowRaportDetailModal(false)
        loadRaportForClass(selectedKelasRaport)
      } else {
        showFeedback('error', j.message || 'Gagal menyimpan raport')
      }
    } catch {
      showFeedback('error', 'Terjadi kesalahan sistem saat menyimpan')
    } finally {
      setSavingRaport(false)
    }
  }

  // Save Teacher Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await fetch('/api/guru/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      })
      const j = await res.json()
      if (j.success) {
        setTeacherProfile((prev) => ({ ...prev, ...profileForm }))
        showFeedback('success', 'Profil dan data diri guru berhasil diperbarui!')
      } else {
        showFeedback('error', j.message || 'Gagal memperbarui profil')
      }
    } catch {
      showFeedback('error', 'Gagal menyimpan pembaruan profil')
    } finally {
      setSavingProfile(false)
    }
  }

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showFeedback('error', 'Konfirmasi password baru tidak cocok')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      showFeedback('error', 'Password baru minimal harus 6 karakter')
      return
    }

    setSavingPassword(true)
    try {
      const res = await fetch('/api/guru/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CHANGE_PASSWORD',
          ...passwordForm,
        }),
      })
      const j = await res.json()
      if (j.success) {
        showFeedback('success', 'Password akun guru berhasil diubah!')
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        showFeedback('error', j.message || 'Gagal mengubah kata sandi')
      }
    } catch {
      showFeedback('error', 'Gagal memproses penggantian password')
    } finally {
      setSavingPassword(false)
    }
  }

  // Logout
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  // --- Export Reports (Excel/CSV & PDF) ---
  const handleExportNilaiExcel = () => {
    const kNama = kelasList.find((k) => k.id === selectedKelasNilai)?.namaKelas || 'Kelas'
    const mNama = mapelList.find((m) => m.id === selectedMapelNilai)?.namaMapel || 'MataPelajaran'
    const curKkm = mapelList.find((m) => m.id === selectedMapelNilai)?.kkm || 75

    let csvContent = `\uFEFFREKAPITULASI NILAI SISWA - SMA NUSANTARA BANGSA\r\n`
    csvContent += `Kelas: ${kNama} | Mata Pelajaran: ${mNama} | KKM: ${curKkm}\r\n`
    csvContent += `Guru Pengampu: ${teacherProfile.namaLengkap} (NIP: ${teacherProfile.nip})\r\n`
    csvContent += `Bobot: Tugas (${bobotNilai.tugas}%), UH (${bobotNilai.uh}%), UTS (${bobotNilai.uts}%), UAS (${bobotNilai.uas}%)\r\n\r\n`
    csvContent += `No,NISN,NIS,Nama Lengkap,Nilai Tugas,Nilai UH,Nilai UTS,Nilai UAS,Praktik,Sikap,Nilai Akhir,Predikat,Status KKM,Catatan Guru\r\n`

    nilaiRows.forEach((r, idx) => {
      const statusKkm = r.nilaiAkhir >= curKkm ? 'Tuntas' : 'Di Bawah KKM (Remedial)'
      csvContent += `${idx + 1},"${r.nisn || ''}","${r.nis || ''}","${r.namaLengkap}",${r.nilaiTugas},${r.nilaiUh},${r.nilaiUts},${r.nilaiUas},${r.nilaiPraktik},${r.nilaiSikap},${r.nilaiAkhir},${r.predikat},"${statusKkm}","${r.catatan || '-'}"\r\n`
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Rekap_Nilai_${kNama.replace(/\s+/g, '_')}_${mNama.replace(/\s+/g, '_')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showFeedback('success', 'File Excel Rekap Nilai berhasil diunduh!')
  }

  const handleExportNilaiPDF = () => {
    const kNama = kelasList.find((k) => k.id === selectedKelasNilai)?.namaKelas || 'Kelas'
    const mNama = mapelList.find((m) => m.id === selectedMapelNilai)?.namaMapel || 'Mata Pelajaran'
    const curKkm = mapelList.find((m) => m.id === selectedMapelNilai)?.kkm || 75

    const printWin = window.open('', '_blank')
    if (!printWin) return

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rekap Nilai - ${kNama}</title>
        <style>
          body { font-family: 'Times New Roman', serif; margin: 30px; color: #111; font-size: 12px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; }
          .header h2 { margin: 0; font-size: 18px; text-transform: uppercase; }
          .header h3 { margin: 4px 0; font-size: 14px; font-weight: normal; }
          .header p { margin: 2px 0; font-size: 11px; }
          .meta { margin-bottom: 15px; font-size: 12px; }
          .meta table { width: 100%; border: none; }
          .meta td { padding: 3px 0; }
          table.data { width: 100%; border-collapse: collapse; margin-top: 10px; }
          table.data th, table.data td { border: 1px solid #333; padding: 6px 8px; text-align: center; font-size: 11px; }
          table.data th { background-color: #f1f5f9; font-weight: bold; }
          table.data td.text-left { text-align: left; }
          .badge-kkm { color: #dc2626; font-weight: bold; }
          .badge-pass { color: #16a34a; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; }
          .sign-box { text-align: center; width: 220px; }
          .sign-space { height: 60px; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA</h2>
          <h2>DINAS PENDIDIKAN DAN KEBUDAYAAN</h2>
          <h3>SMA NUSANTARA BANGSA TERAKREDITASI A</h3>
          <p>Jl. Pendidikan Kebangsaan No. 10 Jakarta | Telp: (021) 7890123 | Website: https://sekolah.sch.id</p>
        </div>

        <h3 style="text-align: center; text-decoration: underline; margin-bottom: 15px;">LEMBAR LAPORAN REKAPITULASI NILAI SISWA</h3>

        <div class="meta">
          <table>
            <tr>
              <td style="width: 150px;"><strong>Kelas</strong></td><td>: ${kNama}</td>
              <td style="width: 150px;"><strong>Semester / TA</strong></td><td>: 1 (Ganjil) / 2025-2026</td>
            </tr>
            <tr>
              <td><strong>Mata Pelajaran</strong></td><td>: ${mNama} (KKM: ${curKkm})</td>
              <td><strong>Guru Pengampu</strong></td><td>: ${teacherProfile.namaLengkap}</td>
            </tr>
            <tr>
              <td><strong>Komposisi Bobot</strong></td><td colspan="3">: Tugas ${bobotNilai.tugas}%, UH ${bobotNilai.uh}%, UTS ${bobotNilai.uts}%, UAS ${bobotNilai.uas}%</td>
            </tr>
          </table>
        </div>

        <table class="data">
          <thead>
            <tr>
              <th style="width: 30px;">No</th>
              <th>NISN</th>
              <th>Nama Siswa</th>
              <th>Tugas</th>
              <th>UH</th>
              <th>UTS</th>
              <th>UAS</th>
              <th>Nilai Akhir</th>
              <th>Predikat</th>
              <th>Status KKM</th>
            </tr>
          </thead>
          <tbody>
            ${nilaiRows
        .map(
          (r, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${r.nisn || '-'}</td>
                <td class="text-left">${r.namaLengkap}</td>
                <td>${r.nilaiTugas}</td>
                <td>${r.nilaiUh}</td>
                <td>${r.nilaiUts}</td>
                <td>${r.nilaiUas}</td>
                <td><strong>${r.nilaiAkhir}</strong></td>
                <td><strong>${r.predikat}</strong></td>
                <td class="${r.nilaiAkhir < curKkm ? 'badge-kkm' : 'badge-pass'}">
                  ${r.nilaiAkhir >= curKkm ? 'Tuntas' : 'Remedial'}
                </td>
              </tr>
            `
        )
        .join('')}
          </tbody>
        </table>

        <div class="footer">
          <div class="sign-box">
            <p>Mengetahui,<br/>Kepala SMA Nusantara Bangsa</p>
            <div class="sign-space"></div>
            <p><strong>Dr. H. Mulyadi, M.Pd.</strong><br/>NIP. 197001011995031002</p>
          </div>
          <div class="sign-box">
            <p>Jakarta, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>Guru Mata Pelajaran,</p>
            <div class="sign-space"></div>
            <p><strong>${teacherProfile.namaLengkap}</strong><br/>NIP. ${teacherProfile.nip}</p>
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `
    printWin.document.write(html)
    printWin.document.close()
  }

  const handleExportPresensiExcel = () => {
    const kNama = kelasList.find((k) => k.id === selectedKelasAbsensi)?.namaKelas || 'Kelas'
    let csvContent = `\uFEFFREKAPITULASI PRESENSI KEHADIRAN SISWA - SMA NUSANTARA BANGSA\r\n`
    csvContent += `Kelas: ${kNama} | Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}\r\n`
    csvContent += `Guru Pengampu: ${teacherProfile.namaLengkap} (NIP: ${teacherProfile.nip})\r\n\r\n`
    csvContent += `No,NISN,NIS,Nama Lengkap,Hadir,Izin,Sakit,Alpa,Total Pertemuan,Persentase Kehadiran,Status Peringatan\r\n`

    rekapPresensiList.forEach((r, idx) => {
      const warn = r.persentase < 75 ? 'Peringatan (<75%)' : 'Normal'
      csvContent += `${idx + 1},"${r.nisn || ''}","${r.nis || ''}","${r.namaLengkap}",${r.hadir},${r.izin},${r.sakit},${r.alfa},${r.totalSesi},"${r.persentase}%","${warn}"\r\n`
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Rekap_Presensi_${kNama.replace(/\s+/g, '_')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showFeedback('success', 'File Excel Rekap Presensi berhasil diunduh!')
  }

  const handleExportPresensiPDF = () => {
    const kNama = kelasList.find((k) => k.id === selectedKelasAbsensi)?.namaKelas || 'Kelas'
    const printWin = window.open('', '_blank')
    if (!printWin) return

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rekap Presensi - ${kNama}</title>
        <style>
          body { font-family: 'Times New Roman', serif; margin: 30px; color: #111; font-size: 12px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; }
          .header h2 { margin: 0; font-size: 18px; text-transform: uppercase; }
          .header h3 { margin: 4px 0; font-size: 14px; font-weight: normal; }
          table.data { width: 100%; border-collapse: collapse; margin-top: 15px; }
          table.data th, table.data td { border: 1px solid #333; padding: 6px 8px; text-align: center; font-size: 11px; }
          table.data th { background-color: #f1f5f9; font-weight: bold; }
          table.data td.text-left { text-align: left; }
          .badge-warn { color: #dc2626; font-weight: bold; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; }
          .sign-box { text-align: center; width: 220px; }
          .sign-space { height: 60px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>SMA NUSANTARA BANGSA TERAKREDITASI A</h2>
          <h3>REKAPITULASI PRESENSI KEHADIRAN SISWA KELAS ${kNama}</h3>
        </div>

        <table class="data">
          <thead>
            <tr>
              <th>No</th>
              <th>NISN</th>
              <th>Nama Siswa</th>
              <th>Hadir</th>
              <th>Izin</th>
              <th>Sakit</th>
              <th>Alpa</th>
              <th>Total Pertemuan</th>
              <th>% Kehadiran</th>
              <th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            ${rekapPresensiList
        .map(
          (r, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${r.nisn || '-'}</td>
                <td class="text-left">${r.namaLengkap}</td>
                <td>${r.hadir}</td>
                <td>${r.izin}</td>
                <td>${r.sakit}</td>
                <td>${r.alfa}</td>
                <td>${r.totalSesi}</td>
                <td><strong>${r.persentase}%</strong></td>
                <td class="${r.persentase < 75 ? 'badge-warn' : ''}">
                  ${r.persentase < 75 ? 'Perhatian Khusus (<75%)' : 'Sangat Baik'}
                </td>
              </tr>
            `
        )
        .join('')}
          </tbody>
        </table>

        <div class="footer">
          <div class="sign-box">
            <p>Mengetahui,<br/>Wali Kelas,</p>
            <div class="sign-space"></div>
            <p><strong>${teacherProfile.namaLengkap}</strong><br/>NIP. ${teacherProfile.nip}</p>
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `
    printWin.document.write(html)
    printWin.document.close()
  }

  // --- Computed Statistics for Overview Dashboard ---
  const statsOverview = useMemo(() => {
    // 1. Classes taught
    const taughtClassIds = new Set(jadwalList.map((j) => j.kelasId))
    const totalKelas = taughtClassIds.size || kelasList.length

    // 2. Total students in taught classes
    const relevantStudents = allSiswa.filter((s) => taughtClassIds.has(s.kelasId) || !s.kelasId)
    const totalSiswaCount = relevantStudents.length || allSiswa.length

    // 3. Pending ungraded tasks
    let pendingGrading = 0
    taskList.forEach((t) => {
      pendingGrading += t.belumDinilai || (t.submissions?.filter((s) => s.status !== 'GRADED').length || 0)
    })

    // 4. Average Attendance
    let avgAttendance = 94.5
    if (rekapPresensiList.length > 0) {
      const sum = rekapPresensiList.reduce((acc, curr) => acc + curr.persentase, 0)
      avgAttendance = Number((sum / rekapPresensiList.length).toFixed(1))
    }

    // 5. Automatic Warnings: Attendance < 75% or Nilai < KKM
    const studentsLowAttendance = rekapPresensiList.filter((r) => r.persentase < 75)
    const studentsLowGrades = nilaiRows.filter((r) => r.nilaiAkhir < 75)

    // 6. Today's teaching schedule
    const todayJadwal = jadwalList.filter((j) => j.hari.toLowerCase() === todayName.toLowerCase())

    // 7. Upcoming deadline tasks
    const upcomingTasks = [...taskList]
      .sort((a, b) => (a.tenggatWaktu || '').localeCompare(b.tenggatWaktu || ''))
      .slice(0, 3)

    // 8. Grade Distribution Chart Data
    const gradeCounts = { A: 0, B: 0, C: 0, D: 0 }
    nilaiRows.forEach((r) => {
      if (r.predikat === 'A') gradeCounts.A++
      else if (r.predikat === 'B') gradeCounts.B++
      else if (r.predikat === 'C') gradeCounts.C++
      else gradeCounts.D++
    })

    return {
      totalKelas,
      totalSiswaCount,
      pendingGrading,
      avgAttendance,
      studentsLowAttendance,
      studentsLowGrades,
      todayJadwal,
      todayName,
      upcomingTasks,
      gradeCounts,
    }
  }, [jadwalList, kelasList, allSiswa, taskList, rekapPresensiList, nilaiRows, todayName])

  // Filtered Students in Kelas & Siswa Tab
  const filteredStudentsDirectory = useMemo(() => {
    return allSiswa.filter((s) => {
      const matchesClass = siswaKelasFilter === 'Semua' || s.kelasId === siswaKelasFilter
      const query = siswaSearch.toLowerCase().trim()
      const matchesSearch =
        !query ||
        s.namaLengkap.toLowerCase().includes(query) ||
        (s.nisn && s.nisn.toLowerCase().includes(query)) ||
        (s.nis && s.nis.toLowerCase().includes(query))
      return matchesClass && matchesSearch
    })
  }, [allSiswa, siswaKelasFilter, siswaSearch])

  // Filtered Teachers in Guru Directory Tab
  const filteredGuruDirectory = useMemo(() => {
    let list = guruList
    if (guruSearch.trim()) {
      const q = guruSearch.toLowerCase().trim()
      list = list.filter(
        (g) =>
          g.namaLengkap.toLowerCase().includes(q) ||
          g.nip.toLowerCase().includes(q) ||
          (g.mataPelajaranUtama && g.mataPelajaranUtama.toLowerCase().includes(q)) ||
          (g.email && g.email.toLowerCase().includes(q))
      )
    }
    return list
  }, [guruList, guruSearch])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* ========================================================= */}
      {/* TOP HEADER */}
      {/* ========================================================= */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                  Portal Akademik Guru
                </h1>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                  SMA Nusantara Bangsa
                </span>
              </div>
              <div className="text-xs text-slate-500 font-medium min-h-[16px] flex items-center">
                {teacherProfile.namaLengkap ? (
                  <span>
                    {teacherProfile.namaLengkap} • NIP: {teacherProfile.nip} ({teacherProfile.mapelUtama})
                  </span>
                ) : (
                  <span className="inline-block w-48 h-3.5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <button
              onClick={() => setActiveTab('profil')}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded-xl transition border border-slate-200"
            >
              <User className="w-4 h-4 text-blue-600" /> Profil Saya
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition border border-rose-200 shadow-xs"
            >
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          </div>
        </div>

        {/* PRIMARY NAVIGATION TABS */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto border-t border-slate-100 no-scrollbar">
          <button
            onClick={() => setActiveTab('ringkasan')}
            className={`py-3 px-4 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${activeTab === 'ringkasan'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
          >
            <BarChart3 className="w-4 h-4" /> Dashboard Guru
          </button>
          <button
            onClick={() => setActiveTab('kelas_siswa')}
            className={`py-3 px-4 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${activeTab === 'kelas_siswa'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
          >
            <Users className="w-4 h-4" /> Kelas & Siswa
          </button>
          <button
            onClick={() => setActiveTab('presensi')}
            className={`py-3 px-4 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${activeTab === 'presensi'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
          >
            <UserCheck className="w-4 h-4" /> Presensi Siswa
          </button>
          <button
            onClick={() => setActiveTab('nilai')}
            className={`py-3 px-4 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${activeTab === 'nilai'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
          >
            <Award className="w-4 h-4" /> Input & Rekap Nilai
          </button>
          <button
            onClick={() => setActiveTab('tugas_materi')}
            className={`py-3 px-4 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${activeTab === 'tugas_materi'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
          >
            <BookOpen className="w-4 h-4" /> Tugas & Materi
          </button>
          <button
            onClick={() => {
              setActiveTab('raport')
              loadRaportForClass(selectedKelasRaport)
            }}
            className={`py-3 px-4 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${activeTab === 'raport'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> Raport Digital
          </button>
          <button
            onClick={() => setActiveTab('profil')}
            className={`py-3 px-4 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${activeTab === 'profil'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
          >
            <User className="w-4 h-4" /> Profil & Akun
          </button>
        </div>
      </header>

      {/* FEEDBACK TOAST */}
      {feedback && (
        <div className="fixed top-24 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold flex items-center gap-3 ${feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {loading ? (
          /* LOADING SKELETON */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse space-y-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-8 bg-slate-200 rounded w-3/4" />
                </div>
              ))}
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-200 animate-pulse space-y-4">
              <div className="h-6 bg-slate-200 rounded w-1/4" />
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-4/5" />
            </div>
          </div>
        ) : (
          <>
            {/* ========================================================= */}
            {/* 1. RINGKASAN DASHBOARD SEBAGAI HALAMAN AWAL GURU */}
            {/* ========================================================= */}
            {activeTab === 'ringkasan' && (
              <div className="space-y-6">
                {/* WELCOME BANNER */}
                <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Selamat Datang di Dashboard Guru
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        {teacherProfile.namaLengkap}
                      </h2>
                      <p className="text-sm text-blue-100 max-w-xl">
                        NIP: {teacherProfile.nip} • Pengampu {teacherProfile.mapelUtama}. Kelola jadwal, presensi siswa, penilaian berbobot otomatis, dan tugas kelas Anda secara terpadu.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => {
                          setActiveTab('presensi')
                          setPresensiSubTab('input')
                        }}
                        className="px-4 py-2.5 bg-white text-blue-700 text-xs font-bold rounded-xl shadow-md hover:bg-blue-50 transition flex items-center gap-2"
                      >
                        <UserCheck className="w-4 h-4" /> Mulai Presensi
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('nilai')
                        }}
                        className="px-4 py-2.5 bg-blue-600/50 hover:bg-blue-600 border border-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-md transition flex items-center gap-2"
                      >
                        <Award className="w-4 h-4" /> Input Nilai Siswa
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4 STATISTIC CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Jumlah Kelas */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jumlah Kelas</span>
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Layers className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-slate-900">{statsOverview.totalKelas}</span>
                      <span className="text-xs text-slate-500 font-medium">Kelas diampu</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Mencakup X, XI, dan XII MIPA</p>
                  </div>

                  {/* Card 2: Total Siswa */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Siswa</span>
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-slate-900">{statsOverview.totalSiswaCount}</span>
                      <span className="text-xs text-slate-500 font-medium">Siswa terdaftar</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Seluruh siswa aktif bimbingan</p>
                  </div>

                  {/* Card 3: Tugas Belum Dinilai */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tugas Menunggu Nilai</span>
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-slate-900">{statsOverview.pendingGrading}</span>
                      <span className="text-xs text-amber-600 font-bold">Koleksi tugas</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Perlu pemeriksaan & feedback</p>
                  </div>

                  {/* Card 4: Rata-rata Kehadiran */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rata-rata Kehadiran</span>
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <UserCheck className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-slate-900">{statsOverview.avgAttendance}%</span>
                      <span className="text-xs text-emerald-600 font-bold">Sangat Baik</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Dari seluruh sesi presensi bulan ini</p>
                  </div>
                </div>

                {/* AUTOMATIC EARLY WARNING BANNER (NILAI PLUS: Siswa < 75% atau < KKM) */}
                {(statsOverview.studentsLowAttendance.length > 0 || statsOverview.studentsLowGrades.length > 0) && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-rose-900 text-sm">
                          Peringatan Otomatis Siswa Perlu Perhatian Khusus
                        </h4>
                        <p className="text-xs text-rose-700 mt-1">
                          Sistem mendeteksi siswa yang berada di bawah standar kehadiran minimum (75%) atau di bawah KKM mata pelajaran:
                        </p>

                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                          {statsOverview.studentsLowAttendance.length > 0 && (
                            <div className="bg-white/80 p-3 rounded-xl border border-rose-200">
                              <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                                <AlertOctagon className="w-3.5 h-3.5 text-rose-600" /> Kehadiran di bawah 75%:
                              </span>
                              <div className="mt-1 space-y-1">
                                {statsOverview.studentsLowAttendance.map((st) => (
                                  <div key={st.siswaId} className="text-xs text-slate-700 flex justify-between">
                                    <span>• {st.namaLengkap} ({st.nisn})</span>
                                    <span className="font-bold text-rose-600">{st.persentase}% Kehadiran</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {statsOverview.studentsLowGrades.length > 0 && (
                            <div className="bg-white/80 p-3 rounded-xl border border-rose-200">
                              <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                                <AlertOctagon className="w-3.5 h-3.5 text-rose-600" /> Nilai Akhir di bawah KKM (&lt;75):
                              </span>
                              <div className="mt-1 space-y-1">
                                {statsOverview.studentsLowGrades.map((st) => (
                                  <div key={st.siswaId} className="text-xs text-slate-700 flex justify-between">
                                    <span>• {st.namaLengkap}</span>
                                    <span className="font-bold text-rose-600">Nilai: {st.nilaiAkhir} (Predikat {st.predikat})</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TWO-COLUMN LAYOUT: JADWAL HARI INI + TUGAS MENDEKATI DEADLINE */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Jadwal Mengajar Hari Ini */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base">Jadwal Mengajar Hari Ini ({statsOverview.todayName})</h3>
                          <p className="text-xs text-slate-500">Pantau kelas tatap muka aktif Anda hari ini</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                        {statsOverview.todayJadwal.length} Sesi Terjadwal
                      </span>
                    </div>

                    {statsOverview.todayJadwal.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
                        Tidak ada jam mengajar tatap muka untuk hari {statsOverview.todayName}. Silakan periksa tab Jadwal Mingguan.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {statsOverview.todayJadwal.map((j) => (
                          <div
                            key={j.id}
                            className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-start gap-3">
                              <div className="px-2.5 py-2 bg-white rounded-lg border border-slate-200 text-center font-bold text-slate-700 text-xs shrink-0 shadow-xs">
                                <Clock className="w-3.5 h-3.5 mx-auto text-blue-600 mb-0.5" />
                                {j.jamMulai}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-slate-900 text-sm">
                                    {j.mapel?.namaMapel || 'Matematika Wajib'}
                                  </h4>
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-bold rounded">
                                    {j.kelas?.namaKelas || 'X MIPA 1'}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                  Ruang: <span className="font-medium text-slate-700">{j.ruangan}</span> • Durasi: {j.jamMulai} - {j.jamSelesai}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setSelectedKelasAbsensi(j.kelasId)
                                setSelectedMapelAbsensi(j.mapelId)
                                setActiveTab('presensi')
                                setPresensiSubTab('input')
                              }}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1 self-start sm:self-auto"
                            >
                              Presensi Kelas <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* NILAI PLUS: VISUAL GRADE DISTRIBUTION CHART */}
                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <BarChart3 className="w-4 h-4 text-indigo-600" /> Distribusi Nilai Kelas Aktif
                        </span>
                        <span className="text-xs text-slate-500">Standar KKM: 75</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                          <span className="text-xs font-bold text-emerald-800">Predikat A (&ge;88)</span>
                          <p className="text-xl font-extrabold text-emerald-700 mt-1">{statsOverview.gradeCounts.A}</p>
                          <span className="text-[10px] text-emerald-600">Siswa Tuntas</span>
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                          <span className="text-xs font-bold text-blue-800">Predikat B (78-87)</span>
                          <p className="text-xl font-extrabold text-blue-700 mt-1">{statsOverview.gradeCounts.B}</p>
                          <span className="text-[10px] text-blue-600">Siswa Tuntas</span>
                        </div>
                        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                          <span className="text-xs font-bold text-amber-800">Predikat C (68-77)</span>
                          <p className="text-xl font-extrabold text-amber-700 mt-1">{statsOverview.gradeCounts.C}</p>
                          <span className="text-[10px] text-amber-600">Cukup</span>
                        </div>
                        <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
                          <span className="text-xs font-bold text-rose-800">Predikat D (&lt;68)</span>
                          <p className="text-xl font-extrabold text-rose-700 mt-1">{statsOverview.gradeCounts.D}</p>
                          <span className="text-[10px] text-rose-600">Perlu Remedial</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Tugas Mendekati Deadline & Pengumuman */}
                  <div className="space-y-6">
                    {/* Tugas Deadline Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <Clock3 className="w-4 h-4 text-amber-600" /> Tugas Mendekati Deadline
                        </h3>
                        <button
                          onClick={() => {
                            setActiveTab('tugas_materi')
                            setTugasSubTab('tugas')
                          }}
                          className="text-xs text-blue-600 hover:underline font-semibold"
                        >
                          Lihat Semua
                        </button>
                      </div>

                      {statsOverview.upcomingTasks.length === 0 ? (
                        <p className="text-xs text-slate-400 py-4 text-center">Belum ada tugas aktif</p>
                      ) : (
                        <div className="space-y-3">
                          {statsOverview.upcomingTasks.map((t) => {
                            const deadlineDate = new Date(t.tenggatWaktu)
                            const isOverdue = new Date() > deadlineDate
                            return (
                              <div
                                key={t.id}
                                className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition space-y-2"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{t.judul}</h4>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${isOverdue
                                        ? 'bg-rose-100 text-rose-700'
                                        : 'bg-amber-100 text-amber-800'
                                      }`}
                                  >
                                    {isOverdue ? 'Lewat Batas' : 'Aktif'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-slate-500">
                                  <span>Kelas: {t.kelas?.namaKelas || 'X MIPA 1'}</span>
                                  <span>
                                    {t.sudahMengumpulkan || t.submissions?.length || 0} / {t.totalSiswa || allSiswa.length} Mengumpulkan
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-blue-600 h-1.5 rounded-full"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        (((t.sudahMengumpulkan || t.submissions?.length || 0) / (t.totalSiswa || allSiswa.length || 1)) * 100)
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Status Raport Digital Siswa */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-blue-600" /> Kontrol Raport Digital Siswa
                        </h3>
                        <button
                          onClick={() => {
                            setActiveTab('raport')
                            loadRaportForClass(selectedKelasRaport)
                          }}
                          className="text-xs text-blue-600 hover:underline font-semibold"
                        >
                          Buka Raport
                        </button>
                      </div>

                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                        <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
                          <Lock className="w-3.5 h-3.5" /> Proteksi Izin Akses Raport
                        </div>
                        <p className="text-[11px] text-amber-700 leading-relaxed">
                          Siswa tidak dapat membuka raport mereka tanpa izin/publikasi dari Guru atau Wali Kelas. Anda dapat mengizinkan perorangan atau seluruh kelas secara serentak.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                          <span className="text-[11px] font-bold text-emerald-800">Status Izin</span>
                          <p className="text-lg font-extrabold text-emerald-700 mt-0.5">Aktif</p>
                          <span className="text-[10px] text-emerald-600">Bisa Dikelola Guru</span>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-center">
                          <span className="text-[11px] font-bold text-blue-800">Total Kelas</span>
                          <p className="text-lg font-extrabold text-blue-700 mt-0.5">{kelasList.length}</p>
                          <span className="text-[10px] text-blue-600">Tersedia Lengkap</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveTab('raport')
                          loadRaportForClass(selectedKelasRaport)
                        }}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                      >
                        <ShieldCheck className="w-4 h-4" /> Kelola Izin Raport Siswa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 2. DAFTAR KELAS DAN SISWA SERTA JADWAL MENGAJAR */}
            {/* ========================================================= */}
            {activeTab === 'kelas_siswa' && (
              <div className="space-y-6">
                {/* Section Header */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" /> Direktori Pengguna & Akses Password
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Pencarian data siswa dan rekan guru beserta monitoring password akun untuk asistensi akademik
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setDirektoriMode('siswa')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${direktoriMode === 'siswa'
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      <Users className="w-4 h-4" /> Direktori Siswa ({allSiswa.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirektoriMode('guru')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${direktoriMode === 'guru'
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                      <User className="w-4 h-4" /> Direktori Guru ({guruList.length})
                    </button>
                  </div>
                </div>

                {direktoriMode === 'siswa' ? (
                  <>

                    {/* KELAS CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {kelasList.map((k) => {
                        const countStudents = allSiswa.filter((s) => s.kelasId === k.id).length
                        const isWali = k.waliKelas?.namaLengkap === teacherProfile.namaLengkap
                        return (
                          <div
                            key={k.id}
                            className={`p-5 rounded-2xl border transition shadow-xs ${isWali ? 'bg-blue-50/40 border-blue-200' : 'bg-white border-slate-200'
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-500 uppercase">Tingkat {k.tingkat}</span>
                              {isWali && (
                                <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-md">
                                  Wali Kelas
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-extrabold text-slate-900 mt-2">{k.namaKelas}</h3>
                            <p className="text-xs text-slate-500 mt-1">
                              {countStudents || k._count?.siswas || 0} Siswa Terdaftar
                            </p>
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                              <button
                                onClick={() => {
                                  setSiswaKelasFilter(k.id)
                                  setSelectedKelasAbsensi(k.id)
                                  setSelectedKelasNilai(k.id)
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                              >
                                Filter Kelas Ini <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* DIRECTORY SEARCH & FILTER */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="relative flex-1">
                          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Cari siswa berdasarkan NISN, NIS, atau Nama Lengkap..."
                            value={siswaSearch}
                            onChange={(e) => setSiswaSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-500 shrink-0">Filter Kelas:</span>
                          <select
                            value={siswaKelasFilter}
                            onChange={(e) => setSiswaKelasFilter(e.target.value)}
                            className="text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
                          >
                            <option value="Semua">Semua Kelas</option>
                            {kelasList.map((k) => (
                              <option key={k.id} value={k.id}>
                                {k.namaKelas}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* STUDENTS TABLE */}
                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left border-collapse text-xs sm:text-sm">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                              <th className="py-3 px-4">No</th>
                              <th className="py-3 px-4">NISN</th>
                              <th className="py-3 px-4">NIS</th>
                              <th className="py-3 px-4">Nama Lengkap</th>
                              <th className="py-3 px-4">Kelas</th>
                              <th className="py-3 px-4">Password Siswa</th>
                              <th className="py-3 px-4">L/P</th>
                              <th className="py-3 px-4">Kontak / No HP</th>
                              <th className="py-3 px-4 text-center">Aksi Cepat</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredStudentsDirectory.length === 0 ? (
                              <tr>
                                <td colSpan={9} className="py-8 text-center text-slate-400">
                                  Tidak ada siswa yang cocok dengan kriteria pencarian
                                </td>
                              </tr>
                            ) : (
                              filteredStudentsDirectory.map((st, idx) => {
                                const kObj = kelasList.find((k) => k.id === st.kelasId)
                                const isPassVisible = !!visibleStudentPasswords[st.id]
                                const studentPass = st.password || `siswa${st.nis || '123'}`
                                return (
                                  <tr key={st.id} className="hover:bg-slate-50/70 transition">
                                    <td className="py-3 px-4 text-slate-500 font-medium">{idx + 1}</td>
                                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{st.nisn || '-'}</td>
                                    <td className="py-3 px-4 font-mono text-slate-600">{st.nis || '-'}</td>
                                    <td className="py-3 px-4 font-bold text-slate-900">{st.namaLengkap}</td>
                                    <td className="py-3 px-4">
                                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-xs">
                                        {kObj?.namaKelas || 'X MIPA 1'}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                                          {isPassVisible ? studentPass : '••••••••'}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => toggleStudentPasswordVisibility(st.id)}
                                          className="p-1 text-slate-400 hover:text-blue-600 transition"
                                          title={isPassVisible ? "Sembunyikan password" : "Lihat password"}
                                        >
                                          {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        </button>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 font-semibold text-slate-600">{st.jenisKelamin || 'L'}</td>
                                    <td className="py-3 px-4 text-slate-500">{st.noHp || '-'}</td>
                                    <td className="py-3 px-4 text-center">
                                      <button
                                        onClick={() => {
                                          setSelectedKelasRaport(st.kelasId)
                                          setActiveTab('raport')
                                          loadRaportForClass(st.kelasId)
                                          handleOpenRaportModal(st)
                                        }}
                                        className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 transition flex items-center gap-1 mx-auto"
                                      >
                                        <FileSpreadsheet className="w-3.5 h-3.5" /> Buka Raport
                                      </button>
                                    </td>
                                  </tr>
                                )
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  /* GURU DIRECTORY */
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Cari guru berdasarkan Nama Lengkap, NIP, atau Mata Pelajaran..."
                          value={guruSearch}
                          onChange={(e) => setGuruSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                      <span className="text-xs px-3 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl border border-slate-200">
                        Total {filteredGuruDirectory.length} Guru
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                            <th className="py-3 px-4">No</th>
                            <th className="py-3 px-4">NIP</th>
                            <th className="py-3 px-4">Nama Lengkap</th>
                            <th className="py-3 px-4">Mata Pelajaran</th>
                            <th className="py-3 px-4">Username / Email</th>
                            <th className="py-3 px-4">Kontak / No HP</th>
                            <th className="py-3 px-4">Password Guru</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredGuruDirectory.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-slate-400">
                                Tidak ada guru yang cocok dengan kriteria pencarian
                              </td>
                            </tr>
                          ) : (
                            filteredGuruDirectory.map((g, idx) => {
                              const isPassVisible = !!visibleTeacherPasswords[g.id]
                              const teacherPass = g.password || 'guru123'
                              return (
                                <tr key={g.id} className="hover:bg-slate-50/70 transition">
                                  <td className="py-3 px-4 text-slate-500 font-medium">{idx + 1}</td>
                                  <td className="py-3 px-4 font-mono font-bold text-indigo-700">{g.nip}</td>
                                  <td className="py-3 px-4 font-bold text-slate-900">{g.namaLengkap}</td>
                                  <td className="py-3 px-4">
                                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded text-xs">
                                      {g.mataPelajaranUtama || 'Guru Mata Pelajaran'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-slate-600">
                                    <span className="font-mono text-xs">{g.username || g.email || '-'}</span>
                                  </td>
                                  <td className="py-3 px-4 text-slate-500">{g.noHp || '-'}</td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                                        {isPassVisible ? teacherPass : '••••••••'}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => toggleTeacherPasswordVisibility(g.id)}
                                        className="p-1 text-slate-400 hover:text-indigo-600 transition"
                                        title={isPassVisible ? "Sembunyikan password" : "Lihat password"}
                                      >
                                        {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* JADWAL MINGGUAN LENGKAP */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-600" /> Jadwal Mengajar Mingguan
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Jadwal terinci jam pelajaran, mata pelajaran, kelas, dan ruangan
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">Filter Hari:</span>
                      <select
                        value={hariFilter}
                        onChange={(e) => setHariFilter(e.target.value)}
                        className="text-xs sm:text-sm px-3 py-1.5 rounded-xl border border-slate-200 font-semibold"
                      >
                        <option value="Semua">Semua Hari</option>
                        <option value="Senin">Senin</option>
                        <option value="Selasa">Selasa</option>
                        <option value="Rabu">Rabu</option>
                        <option value="Kamis">Kamis</option>
                        <option value="Jumat">Jumat</option>
                        <option value="Sabtu">Sabtu</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {jadwalList
                      .filter((j) => hariFilter === 'Semua' || j.hari.toLowerCase() === hariFilter.toLowerCase())
                      .map((j) => (
                        <div
                          key={j.id}
                          className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-xs transition space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-md">
                              {j.hari}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-600">
                              {j.jamMulai} - {j.jamSelesai}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{j.mapel?.namaMapel || 'Matematika Wajib'}</h4>
                            <p className="text-xs text-slate-600 mt-0.5">
                              Kelas: <span className="font-bold text-blue-700">{j.kelas?.namaKelas || 'X MIPA 1'}</span> • Ruang: <span className="font-medium text-slate-700">{j.ruangan}</span>
                            </p>
                          </div>
                          <div className="pt-2 border-t border-slate-100 flex justify-end">
                            <button
                              onClick={() => {
                                setSelectedKelasAbsensi(j.kelasId)
                                setSelectedMapelAbsensi(j.mapelId)
                                setActiveTab('presensi')
                                setPresensiSubTab('input')
                              }}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                            >
                              Buka Presensi &rarr;
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 3. PRESENSI SISWA */}
            {/* ========================================================= */}
            {activeTab === 'presensi' && (
              <div className="space-y-6">
                {/* Header & Sub-tab navigation */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-blue-600" /> Presensi & Rekap Kehadiran Siswa
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Input kehadiran harian siswa, pencegahan input ganda, dan rekap persentase kehadiran bulanan
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="bg-slate-100 p-1 rounded-xl flex items-center">
                      <button
                        onClick={() => setPresensiSubTab('input')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${presensiSubTab === 'input' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                          }`}
                      >
                        Input Presensi
                      </button>
                      <button
                        onClick={() => setPresensiSubTab('rekap')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${presensiSubTab === 'rekap' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                          }`}
                      >
                        Rekap Bulanan
                      </button>
                    </div>

                    {presensiSubTab === 'rekap' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleExportPresensiExcel}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                        >
                          <FileSpreadsheet className="w-4 h-4" /> Excel
                        </button>
                        <button
                          onClick={handleExportPresensiPDF}
                          className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                        >
                          <FileText className="w-4 h-4" /> PDF
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* SUBTAB 1: INPUT PRESENSI */}
                {presensiSubTab === 'input' && (
                  <div className="space-y-6">
                    {/* Filter Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Pilih Kelas</label>
                          <select
                            value={selectedKelasAbsensi}
                            onChange={(e) => handleKelasAbsensiChange(e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-blue-500"
                          >
                            {kelasList.map((k) => (
                              <option key={k.id} value={k.id}>
                                {k.namaKelas}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Mata Pelajaran</label>
                          <select
                            value={selectedMapelAbsensi}
                            onChange={(e) => {
                              setSelectedMapelAbsensi(e.target.value)
                              checkDuplicateAttendance(selectedKelasAbsensi, e.target.value, tanggalAbsensi)
                            }}
                            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-blue-500"
                          >
                            {mapelList.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.namaMapel}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Tanggal Presensi</label>
                          <input
                            type="date"
                            value={tanggalAbsensi}
                            onChange={(e) => {
                              setTanggalAbsensi(e.target.value)
                              checkDuplicateAttendance(selectedKelasAbsensi, selectedMapelAbsensi, e.target.value)
                            }}
                            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Pertemuan Ke-</label>
                          <input
                            type="number"
                            min="1"
                            value={pertemuanKe}
                            onChange={(e) => setPertemuanKe(Number(e.target.value) || 1)}
                            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* DUPLICATE WARNING ALERT */}
                      {duplicateWarning.hasDuplicate && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                            <span>
                              <strong>Perhatian:</strong> {duplicateWarning.message} Sistem mencegah input data ganda. Anda dapat meninjau data di bawah lalu klik Perbarui Data.
                            </span>
                          </div>
                          <button
                            onClick={() => handleSaveAbsensi(true)}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shrink-0 shadow-xs"
                          >
                            Perbarui Data
                          </button>
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={handleMarkAllHadir}
                          className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4 text-emerald-600" /> Hadirkan Semua Siswa
                        </button>

                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            placeholder="Keterangan materi/topik pertemuan (opsional)..."
                            value={keteranganAbsensi}
                            onChange={(e) => setKeteranganAbsensi(e.target.value)}
                            className="text-xs px-3 py-2 rounded-xl border border-slate-200 w-64 focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveAbsensi(false)}
                            disabled={submittingAbsensi}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
                          >
                            {submittingAbsensi ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                            {duplicateWarning.hasDuplicate ? 'Perbarui Presensi' : 'Simpan Presensi'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Attendance Roster Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase">
                          Daftar Siswa Kelas {kelasList.find((k) => k.id === selectedKelasAbsensi)?.namaKelas || 'X MIPA 1'}
                        </span>
                        <span className="text-xs text-slate-500">
                          {allSiswa.filter((s) => s.kelasId === selectedKelasAbsensi).length} Siswa
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                          <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-600 text-[11px] uppercase font-bold">
                              <th className="py-3 px-4">No</th>
                              <th className="py-3 px-4">NISN / NIS</th>
                              <th className="py-3 px-4">Nama Siswa</th>
                              <th className="py-3 px-4 text-center">Status Kehadiran</th>
                              <th className="py-3 px-4">Catatan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {allSiswa
                              .filter((s) => s.kelasId === selectedKelasAbsensi)
                              .map((st, idx) => {
                                const currentStatus = attendanceRecords[st.id]?.status || 'HADIR'
                                const currentCatatan = attendanceRecords[st.id]?.catatan || ''
                                return (
                                  <tr key={st.id} className="hover:bg-slate-50/70 transition">
                                    <td className="py-3 px-4 text-slate-500 font-medium">{idx + 1}</td>
                                    <td className="py-3 px-4 font-mono text-slate-700">
                                      <span className="font-bold">{st.nisn || '-'}</span>
                                      <span className="text-slate-400 text-xs block">NIS: {st.nis || '-'}</span>
                                    </td>
                                    <td className="py-3 px-4 font-bold text-slate-900">{st.namaLengkap}</td>
                                    <td className="py-3 px-4 text-center">
                                      <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
                                        {(['HADIR', 'IZIN', 'SAKIT', 'ALFA'] as const).map((stat) => (
                                          <button
                                            key={stat}
                                            type="button"
                                            onClick={() =>
                                              setAttendanceRecords((prev) => ({
                                                ...prev,
                                                [st.id]: {
                                                  status: stat,
                                                  catatan: prev[st.id]?.catatan || '',
                                                },
                                              }))
                                            }
                                            className={`px-3 py-1 text-xs font-bold rounded-md transition ${currentStatus === stat
                                                ? stat === 'HADIR'
                                                  ? 'bg-emerald-600 text-white shadow-xs'
                                                  : stat === 'IZIN'
                                                    ? 'bg-blue-600 text-white shadow-xs'
                                                    : stat === 'SAKIT'
                                                      ? 'bg-amber-600 text-white shadow-xs'
                                                      : 'bg-rose-600 text-white shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                              }`}
                                          >
                                            {stat}
                                          </button>
                                        ))}
                                      </div>
                                    </td>
                                    <td className="py-3 px-4">
                                      <input
                                        type="text"
                                        placeholder="Keterangan..."
                                        value={currentCatatan}
                                        onChange={(e) =>
                                          setAttendanceRecords((prev) => ({
                                            ...prev,
                                            [st.id]: {
                                              status: currentStatus,
                                              catatan: e.target.value,
                                            },
                                          }))
                                        }
                                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                                      />
                                    </td>
                                  </tr>
                                )
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 2: REKAP BULANAN */}
                {presensiSubTab === 'rekap' && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">Rekapitulasi Kehadiran Bulanan</h3>
                        <p className="text-xs text-slate-500">
                          Persentase kehadiran dihitung otomatis. Siswa dengan kehadiran di bawah 75% ditandai khusus.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={selectedKelasAbsensi}
                          onChange={(e) => handleKelasAbsensiChange(e.target.value)}
                          className="text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                        >
                          {kelasList.map((k) => (
                            <option key={k.id} value={k.id}>
                              {k.namaKelas}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] uppercase font-bold">
                            <th className="py-3 px-4">No</th>
                            <th className="py-3 px-4">NISN</th>
                            <th className="py-3 px-4">Nama Siswa</th>
                            <th className="py-3 px-4 text-center text-emerald-700">Hadir</th>
                            <th className="py-3 px-4 text-center text-blue-700">Izin</th>
                            <th className="py-3 px-4 text-center text-amber-700">Sakit</th>
                            <th className="py-3 px-4 text-center text-rose-700">Alpa</th>
                            <th className="py-3 px-4 text-center">Total Sesi</th>
                            <th className="py-3 px-4 text-center">% Kehadiran</th>
                            <th className="py-3 px-4 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {rekapPresensiList.length === 0 ? (
                            <tr>
                              <td colSpan={10} className="py-8 text-center text-slate-400">
                                Belum ada riwayat sesi presensi untuk kelas ini
                              </td>
                            </tr>
                          ) : (
                            rekapPresensiList.map((r, idx) => (
                              <tr key={r.siswaId} className="hover:bg-slate-50/70 transition">
                                <td className="py-3 px-4 text-slate-500">{idx + 1}</td>
                                <td className="py-3 px-4 font-mono font-bold text-slate-700">{r.nisn}</td>
                                <td className="py-3 px-4 font-bold text-slate-900">{r.namaLengkap}</td>
                                <td className="py-3 px-4 text-center font-bold text-emerald-600">{r.hadir}</td>
                                <td className="py-3 px-4 text-center font-bold text-blue-600">{r.izin}</td>
                                <td className="py-3 px-4 text-center font-bold text-amber-600">{r.sakit}</td>
                                <td className="py-3 px-4 text-center font-bold text-rose-600">{r.alfa}</td>
                                <td className="py-3 px-4 text-center font-semibold text-slate-600">{r.totalSesi}</td>
                                <td className="py-3 px-4 text-center">
                                  <span
                                    className={`px-2.5 py-1 rounded-full font-extrabold text-xs ${r.persentase < 75
                                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                        : 'bg-emerald-100 text-emerald-800'
                                      }`}
                                  >
                                    {r.persentase}%
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {r.persentase < 75 ? (
                                    <span className="text-xs text-rose-600 font-bold flex items-center justify-center gap-1">
                                      <AlertTriangle className="w-3.5 h-3.5" /> Perhatian (&lt;75%)
                                    </span>
                                  ) : (
                                    <span className="text-xs text-emerald-700 font-medium">Memenuhi Syarat</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* 4. INPUT DAN REKAP NILAI */}
            {/* ========================================================= */}
            {activeTab === 'nilai' && (
              <div className="space-y-6">
                {/* Header & Weight Settings button */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Award className="w-5 h-5 text-blue-600" /> Penginputan & Rekapitulasi Nilai Siswa
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Komponen Tugas, UH, UTS, dan UAS dengan pembobotan fleksibel. Validasi angka 0-100 dan penandaan otomatis siswa di bawah KKM.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowBobotModal(true)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-slate-200"
                    >
                      <Sliders className="w-4 h-4 text-blue-600" /> Atur Bobot Penilaian
                    </button>
                    <button
                      type="button"
                      onClick={handleExportNilaiExcel}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                    >
                      <FileSpreadsheet className="w-4 h-4" /> Excel
                    </button>
                    <button
                      type="button"
                      onClick={handleExportNilaiPDF}
                      className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                    >
                      <FileText className="w-4 h-4" /> PDF
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAllGrades}
                      disabled={submittingNilai}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {submittingNilai ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Simpan Seluruh Nilai
                    </button>
                  </div>
                </div>

                {/* Filter and Bobot Info Banner */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Kelas:</span>
                      <select
                        value={selectedKelasNilai}
                        onChange={(e) => handleKelasNilaiChange(e.target.value)}
                        className="text-xs sm:text-sm px-3 py-1.5 rounded-xl border border-slate-200 font-bold"
                      >
                        {kelasList.map((k) => (
                          <option key={k.id} value={k.id}>
                            {k.namaKelas}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Mata Pelajaran:</span>
                      <select
                        value={selectedMapelNilai}
                        onChange={(e) => handleMapelNilaiChange(e.target.value)}
                        className="text-xs sm:text-sm px-3 py-1.5 rounded-xl border border-slate-200 font-bold"
                      >
                        {mapelList.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.namaMapel} (KKM: {m.kkm})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Weight preview chips */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-semibold">Bobot Aktif:</span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded">Tugas {bobotNilai.tugas}%</span>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded">UH {bobotNilai.uh}%</span>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-bold rounded">UTS {bobotNilai.uts}%</span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded">UAS {bobotNilai.uas}%</span>
                  </div>
                </div>

                {/* Nilai Interactive Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-[11px] uppercase font-bold tracking-wider">
                          <th className="py-3 px-3 w-10">No</th>
                          <th className="py-3 px-3 min-w-[150px]">Nama Siswa</th>
                          <th className="py-3 px-2 text-center w-20">Tugas ({bobotNilai.tugas}%)</th>
                          <th className="py-3 px-2 text-center w-20">UH ({bobotNilai.uh}%)</th>
                          <th className="py-3 px-2 text-center w-20">UTS ({bobotNilai.uts}%)</th>
                          <th className="py-3 px-2 text-center w-20">UAS ({bobotNilai.uas}%)</th>
                          <th className="py-3 px-2 text-center w-24">Nilai Akhir</th>
                          <th className="py-3 px-2 text-center w-16">Grade</th>
                          <th className="py-3 px-2 text-center w-28">Status KKM</th>
                          <th className="py-3 px-3 min-w-[180px]">Catatan Guru</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {nilaiRows.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="py-8 text-center text-slate-400">
                              Tidak ada siswa di kelas ini
                            </td>
                          </tr>
                        ) : (
                          nilaiRows.map((row, idx) => {
                            const curKkm = mapelList.find((m) => m.id === selectedMapelNilai)?.kkm || 75
                            const isBelowKkm = row.nilaiAkhir < curKkm
                            return (
                              <tr
                                key={row.siswaId}
                                className={`transition ${isBelowKkm ? 'bg-rose-50/40 hover:bg-rose-50/70' : 'hover:bg-slate-50/70'}`}
                              >
                                <td className="py-3 px-3 text-slate-500 font-medium">{idx + 1}</td>
                                <td className="py-3 px-3">
                                  <span className="font-bold text-slate-900 block">{row.namaLengkap}</span>
                                  <span className="text-[11px] text-slate-400 font-mono">NISN: {row.nisn || '-'}</span>
                                </td>

                                {/* Input Tugas */}
                                <td className="py-3 px-2 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={row.nilaiTugas}
                                    onChange={(e) => handleGradeCellChange(idx, 'nilaiTugas', e.target.value)}
                                    className="w-16 px-2 py-1.5 text-center text-xs font-bold rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                                  />
                                </td>

                                {/* Input UH */}
                                <td className="py-3 px-2 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={row.nilaiUh}
                                    onChange={(e) => handleGradeCellChange(idx, 'nilaiUh', e.target.value)}
                                    className="w-16 px-2 py-1.5 text-center text-xs font-bold rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                                  />
                                </td>

                                {/* Input UTS */}
                                <td className="py-3 px-2 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={row.nilaiUts}
                                    onChange={(e) => handleGradeCellChange(idx, 'nilaiUts', e.target.value)}
                                    className="w-16 px-2 py-1.5 text-center text-xs font-bold rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                                  />
                                </td>

                                {/* Input UAS */}
                                <td className="py-3 px-2 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={row.nilaiUas}
                                    onChange={(e) => handleGradeCellChange(idx, 'nilaiUas', e.target.value)}
                                    className="w-16 px-2 py-1.5 text-center text-xs font-bold rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                                  />
                                </td>

                                {/* Nilai Akhir (Calculated) */}
                                <td className="py-3 px-2 text-center">
                                  <span
                                    className={`text-sm font-extrabold ${isBelowKkm ? 'text-rose-600' : 'text-slate-900'
                                      }`}
                                  >
                                    {row.nilaiAkhir}
                                  </span>
                                </td>

                                {/* Predikat */}
                                <td className="py-3 px-2 text-center">
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-bold ${row.predikat === 'A'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : row.predikat === 'B'
                                          ? 'bg-blue-100 text-blue-800'
                                          : row.predikat === 'C'
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-rose-100 text-rose-800'
                                      }`}
                                  >
                                    {row.predikat}
                                  </span>
                                </td>

                                {/* Status KKM */}
                                <td className="py-3 px-2 text-center">
                                  {isBelowKkm ? (
                                    <span className="px-2 py-1 bg-rose-100 text-rose-700 text-[11px] font-bold rounded-md inline-flex items-center gap-1">
                                      <AlertTriangle className="w-3 h-3" /> Remedial
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-md inline-flex items-center gap-1">
                                      <Check className="w-3 h-3" /> Tuntas
                                    </span>
                                  )}
                                </td>

                                {/* Catatan */}
                                <td className="py-3 px-3">
                                  <input
                                    type="text"
                                    placeholder="Catatan perkembangan..."
                                    value={row.catatan}
                                    onChange={(e) => handleGradeCellChange(idx, 'catatan', e.target.value)}
                                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                                  />
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 5. MANAJEMEN TUGAS, MATERI, DAN PENGUMPULAN */}
            {/* ========================================================= */}
            {activeTab === 'tugas_materi' && (
              <div className="space-y-6">
                {/* Header & Sub-tab navigation */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" /> Manajemen Tugas & Materi Pembelajaran
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Buat tugas ber-deadline, periksa dan nilai pengumpulan siswa, serta unggah materi belajar (PDF, PPTX, MP4 maks 25MB)
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-1 rounded-xl flex items-center">
                      <button
                        onClick={() => setTugasSubTab('tugas')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${tugasSubTab === 'tugas' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                          }`}
                      >
                        Tugas & Pengumpulan
                      </button>
                      <button
                        onClick={() => setTugasSubTab('materi')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${tugasSubTab === 'materi' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                          }`}
                      >
                        Materi Pelajaran
                      </button>
                    </div>

                    {tugasSubTab === 'tugas' ? (
                      <button
                        onClick={() => setShowCreateTaskModal(true)}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> Buat Tugas Baru
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowUploadMateriModal(true)}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                      >
                        <Upload className="w-4 h-4" /> Unggah Materi
                      </button>
                    )}
                  </div>
                </div>

                {/* SUBTAB 1: TUGAS KELAS */}
                {tugasSubTab === 'tugas' && (
                  <div className="space-y-4">
                    {taskList.length === 0 ? (
                      <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
                        Belum ada tugas yang dibuat. Silakan klik tombol "Buat Tugas Baru".
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {taskList.map((task) => {
                          const deadlineDate = new Date(task.tenggatWaktu)
                          const isOverdue = new Date() > deadlineDate
                          const countSubmitted = task.sudahMengumpulkan || task.submissions?.length || 0
                          const totalExpected = task.totalSiswa || allSiswa.length || 1
                          return (
                            <div
                              key={task.id}
                              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded">
                                      {task.kelas?.namaKelas || 'X MIPA 1'}
                                    </span>
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">
                                      {task.mapel?.namaMapel || 'Matematika Wajib'}
                                    </span>
                                  </div>
                                  <h3 className="font-bold text-slate-900 text-base mt-1.5">{task.judul}</h3>
                                </div>

                                <span
                                  className={`px-2 py-1 text-[11px] font-bold rounded-md shrink-0 ${isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                                    }`}
                                >
                                  {isOverdue ? 'Lewat Tenggat' : 'Aktif'}
                                </span>
                              </div>

                              <p className="text-xs text-slate-600 line-clamp-2">{task.deskripsi}</p>

                              <div className="pt-2 border-t border-slate-100 space-y-2">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                  <span>Tenggat: {deadlineDate.toLocaleString('id-ID')}</span>
                                  <span className="font-bold text-slate-800">
                                    {countSubmitted} / {totalExpected} Mengumpulkan
                                  </span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{ width: `${Math.min(100, (countSubmitted / totalExpected) * 100)}%` }}
                                  />
                                </div>
                              </div>

                              <div className="pt-2 flex items-center justify-between">
                                <button
                                  onClick={() => setSelectedTaskForReview(task)}
                                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                                >
                                  <Eye className="w-3.5 h-3.5" /> Periksa Pengumpulan ({task.belumDinilai || 0} Belum Dinilai)
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id, task.judul)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* SUBTAB 2: MATERI PELAJARAN */}
                {tugasSubTab === 'materi' && (
                  <div className="space-y-4">
                    {materiList.length === 0 ? (
                      <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
                        Belum ada materi pelajaran yang diunggah. Silakan klik "Unggah Materi".
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {materiList.map((m) => (
                          <div
                            key={m.id}
                            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded uppercase">
                                  .{m.fileType || 'PDF'}
                                </span>
                                <span className="text-[11px] text-slate-400 font-medium">
                                  {(m.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB
                                </span>
                              </div>
                              <h3 className="font-bold text-slate-900 text-sm line-clamp-2">{m.judul}</h3>
                              {m.deskripsi && <p className="text-xs text-slate-500 line-clamp-2">{m.deskripsi}</p>}
                              <p className="text-[11px] text-slate-400 font-mono line-clamp-1">{m.fileName}</p>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                              <a
                                href={m.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                              >
                                <Download className="w-3.5 h-3.5 text-blue-600" /> Unduh
                              </a>
                              <button
                                onClick={() => handleDeleteMateri(m.id, m.judul)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* 6. RAPORT DIGITAL & IZIN AKSES SISWA */}
            {/* ========================================================= */}
            {activeTab === 'raport' && (
              <div className="space-y-6">
                {/* Header & Controls */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-blue-600" /> Raport Digital & Izin Akses Siswa
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Kontrol penerbitan raport semester. Tanpa izin Guru / Wali Kelas, raport siswa terkunci secara otomatis.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">Pilih Kelas:</span>
                      <select
                        value={selectedKelasRaport}
                        onChange={(e) => {
                          const kId = e.target.value
                          setSelectedKelasRaport(kId)
                          loadRaportForClass(kId)
                        }}
                        className="text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-bold bg-white"
                      >
                        {kelasList.map((k) => (
                          <option key={k.id} value={k.id}>
                            {k.namaKelas}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => handleBulkRaportStatus(selectedKelasRaport, 'PUBLISHED')}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                    >
                      <Unlock className="w-4 h-4" /> Izinkan Semua (Buka Raport)
                    </button>
                    <button
                      onClick={() => handleBulkRaportStatus(selectedKelasRaport, 'DRAFT')}
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                    >
                      <Lock className="w-4 h-4" /> Kunci Semua Raport
                    </button>
                    <button
                      onClick={() => loadRaportForClass(selectedKelasRaport)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
                      title="Segarkan data raport"
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingRaport ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Status Alert Banner */}
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Aturan Akses Raport Digital Siswa
                    </h4>
                    <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                      Siswa <strong>TIDAK DAPAT MEMBUKA RAPORT</strong> di akun mereka sebelum status raport diubah menjadi <strong>Diizinkan (Terbuka)</strong> oleh Guru / Wali Kelas. Anda dapat mengizinkan perorangan atau membuka akses seluruh siswa di kelas <strong>{currentRaportKelasObj?.namaKelas || selectedKelasRaport}</strong> dengan satu klik tombol di atas.
                    </p>
                  </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-semibold">Total Siswa Kelas {currentRaportKelasObj?.namaKelas}</span>
                      <p className="text-2xl font-black text-slate-900">{studentsInSelectedRaportClass.length} Siswa</p>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Unlock className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-semibold">Raport Diizinkan (Terbuka)</span>
                      <p className="text-2xl font-black text-emerald-600">{countPublished} Siswa</p>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-semibold">Raport Terkunci (Belum Izin)</span>
                      <p className="text-2xl font-black text-rose-600">{countLocked} Siswa</p>
                    </div>
                  </div>
                </div>

                {/* Raport Students Table */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-indigo-600" /> Lembar Verifikasi Raport Siswa - Kelas {currentRaportKelasObj?.namaKelas}
                    </h3>
                    <span className="text-xs font-semibold text-slate-500">
                      Semester Ganjil 2025/2026
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                          <th className="py-3 px-4">No</th>
                          <th className="py-3 px-4">NISN / NIS</th>
                          <th className="py-3 px-4">Nama Siswa</th>
                          <th className="py-3 px-4 text-center">Status Izin Guru</th>
                          <th className="py-3 px-4">Catatan Wali Kelas</th>
                          <th className="py-3 px-4 text-center">Aksi Cepat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {studentsInSelectedRaportClass.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400">
                              Tidak ada data siswa terdaftar di kelas ini
                            </td>
                          </tr>
                        ) : (
                          studentsInSelectedRaportClass.map((st, idx) => {
                            const rap = raportRecords.find((r) => r.siswaId === st.id || r.siswaId === st.userId)
                            const isPub = rap?.status === 'PUBLISHED'
                            return (
                              <tr key={st.id} className="hover:bg-slate-50/70 transition">
                                <td className="py-3 px-4 text-slate-500 font-medium">{idx + 1}</td>
                                <td className="py-3 px-4 font-mono">
                                  <div className="font-bold text-blue-700">{st.nisn || '-'}</div>
                                  <div className="text-[11px] text-slate-400">{st.nis || '-'}</div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="font-bold text-slate-900">{st.namaLengkap}</div>
                                  <div className="text-[11px] text-slate-400">Jenis Kelamin: {st.jenisKelamin || 'L'}</div>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {isPub ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      <Unlock className="w-3.5 h-3.5" /> Diizinkan (Terbuka)
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                      <Lock className="w-3.5 h-3.5" /> Terkunci (Perlu Izin)
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-slate-600 max-w-xs truncate text-xs">
                                  {rap?.catatanWaliKelas || 'Pertahankan prestasi belajar, tingkatkan kedisiplinan.'}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => handleToggleStudentRaportStatus(st.id, rap?.status || 'DRAFT')}
                                      className={`px-3 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1 ${isPub
                                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                        }`}
                                      title={isPub ? 'Kunci kembali raport siswa ini' : 'Buka & izinkan raport siswa ini'}
                                    >
                                      {isPub ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                      {isPub ? 'Kunci' : 'Izinkan'}
                                    </button>
                                    <button
                                      onClick={() => handleOpenRaportModal(st, rap)}
                                      className="px-3 py-1 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition flex items-center gap-1"
                                    >
                                      <Edit3 className="w-3 h-3" /> Kelola & Catatan
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 7. PROFIL GURU & PENGATURAN KATA SANDI */}
            {/* ========================================================= */}
            {activeTab === 'profil' && (
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" /> Profil Pengajar & Keamanan Akun
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Perbarui informasi identitas diri, foto profil, dan kata sandi akun portal Anda
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Photo / Avatar Card */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-4">
                    <div className="w-28 h-28 mx-auto rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-blue-500/20 overflow-hidden">
                      {profileForm.avatarUrl ? (
                        <img
                          src={profileForm.avatarUrl}
                          alt="Avatar Guru"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            ; (e.target as HTMLElement).style.display = 'none'
                          }}
                        />
                      ) : (
                        teacherProfile.namaLengkap.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{teacherProfile.namaLengkap}</h3>
                      <p className="text-xs text-slate-500">NIP: {teacherProfile.nip}</p>
                      <span className="mt-2 inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-md">
                        {teacherProfile.mapelUtama}
                      </span>
                    </div>

                    <div className="text-left pt-3 border-t border-slate-100">
                      <DualImageInput
                        label="Foto Profil Guru"
                        value={profileForm.avatarUrl}
                        onChange={(val) => setProfileForm({ ...profileForm, avatarUrl: val })}
                        helperText="Bisa seret & lepas (drag & drop) gambar dari folder/galeri atau masukkan URL"
                      />
                    </div>
                  </div>

                  {/* Edit Profile Form */}
                  <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-blue-600" /> Ubah Data Diri Pengajar
                    </h3>

                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Lengkap & Gelar</label>
                        <input
                          type="text"
                          value={profileForm.namaLengkap}
                          onChange={(e) => setProfileForm({ ...profileForm, namaLengkap: e.target.value })}
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nomor Induk Pegawai (NIP)</label>
                          <input
                            type="text"
                            value={profileForm.nip}
                            onChange={(e) => setProfileForm({ ...profileForm, nip: e.target.value })}
                            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mata Pelajaran Utama</label>
                          <input
                            type="text"
                            value={profileForm.mataPelajaranUtama}
                            onChange={(e) => setProfileForm({ ...profileForm, mataPelajaranUtama: e.target.value })}
                            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">No. WhatsApp / HP</label>
                          <input
                            type="text"
                            value={profileForm.noHp}
                            onChange={(e) => setProfileForm({ ...profileForm, noHp: e.target.value })}
                            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Resmi</label>
                          <input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Biodata / Catatan Singkat</label>
                        <textarea
                          rows={2}
                          value={profileForm.bio}
                          onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={savingProfile}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
                        >
                          {savingProfile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Simpan Pembaruan Profil
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* CHANGE PASSWORD CARD */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4 text-rose-600" /> Ganti Kata Sandi Akun
                  </h3>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password Lama</label>
                        <input
                          type="password"
                          value={passwordForm.oldPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                          placeholder="Password saat ini"
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password Baru</label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          placeholder="Minimal 6 karakter"
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Konfirmasi Password Baru</label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          placeholder="Ulangi password baru"
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={savingPassword}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {savingPassword ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                        Perbarui Kata Sandi
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL 1: ATUR BOBOT PENILAIAN */}
      {/* ========================================================= */}
      {showBobotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" /> Atur Bobot Penilaian
              </h3>
              <button onClick={() => setShowBobotModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Sesuaikan proporsi persentase komponen penilaian. Total akumulasi bobot harus tepat 100%.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bobot Tugas: {tempBobot.tugas}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tempBobot.tugas}
                  onChange={(e) => setTempBobot({ ...tempBobot, tugas: Number(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bobot Ulangan Harian (UH): {tempBobot.uh}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tempBobot.uh}
                  onChange={(e) => setTempBobot({ ...tempBobot, uh: Number(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bobot Ulangan Tengah Semester (UTS): {tempBobot.uts}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tempBobot.uts}
                  onChange={(e) => setTempBobot({ ...tempBobot, uts: Number(e.target.value) })}
                  className="w-full accent-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bobot Ulangan Akhir Semester (UAS): {tempBobot.uas}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tempBobot.uas}
                  onChange={(e) => setTempBobot({ ...tempBobot, uas: Number(e.target.value) })}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div
                className={`p-3 rounded-xl text-center text-xs font-bold ${tempBobot.tugas + tempBobot.uh + tempBobot.uts + tempBobot.uas === 100
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
              >
                Total Bobot: {tempBobot.tugas + tempBobot.uh + tempBobot.uts + tempBobot.uas}%
                {tempBobot.tugas + tempBobot.uh + tempBobot.uts + tempBobot.uas !== 100 && ' (Harus 100%)'}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBobotModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveBobot}
                className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
              >
                Terapkan Bobot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: BUAT TUGAS BARU */}
      {/* ========================================================= */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Buat Tugas Kelas Baru
              </h3>
              <button onClick={() => setShowCreateTaskModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Judul Tugas</label>
                <input
                  type="text"
                  placeholder="Contoh: Latihan Soal Logaritma Bab 2"
                  value={newTaskForm.judul}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, judul: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kelas Sasaran</label>
                  <select
                    value={newTaskForm.kelasId}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, kelasId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-semibold"
                  >
                    {kelasList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.namaKelas}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mata Pelajaran</label>
                  <select
                    value={newTaskForm.mapelId}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, mapelId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-semibold"
                  >
                    {mapelList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.namaMapel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Batas Waktu (Deadline)</label>
                <input
                  type="datetime-local"
                  value={newTaskForm.tenggatWaktu}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, tenggatWaktu: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Petunjuk & Deskripsi Tugas</label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan instruksi pengerjaan soal, buku referensi, atau format jawaban..."
                  value={newTaskForm.deskripsi}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, deskripsi: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTaskModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
                >
                  Simpan & Bagikan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: PERIKSA PENGUMPULAN TUGAS SISWA */}
      {/* ========================================================= */}
      {selectedTaskForReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Evaluasi Pengumpulan Tugas</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedTaskForReview.judul}</p>
              </div>
              <button
                onClick={() => setSelectedTaskForReview(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] uppercase font-bold">
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">Nama Siswa</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-center">Nilai</th>
                      <th className="py-2.5 px-3">Feedback Guru</th>
                      <th className="py-2.5 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allSiswa
                      .filter((s) => s.kelasId === selectedTaskForReview.kelasId)
                      .map((st, idx) => {
                        const sub = (selectedTaskForReview.submissions || []).find((s) => s.siswaId === st.id)
                        const isDone = !!sub
                        return (
                          <tr key={st.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-slate-900 block">{st.namaLengkap}</span>
                              <span className="text-[10px] text-slate-400 font-mono">NISN: {st.nisn}</span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {isDone ? (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                                  Sudah Mengumpulkan
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded">
                                  Belum
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold">
                              {sub?.nilai !== undefined ? (
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-extrabold text-xs">
                                  {sub.nilai}
                                </span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-xs text-slate-600 max-w-[200px] truncate">
                              {sub?.catatanGuru || (sub?.submissionText ? `Ket: ${sub.submissionText}` : '-')}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() =>
                                  setGradingModalData({
                                    prId: selectedTaskForReview.id,
                                    siswaId: st.id,
                                    siswaNama: st.namaLengkap,
                                    nilai: sub?.nilai || 85,
                                    catatanGuru: sub?.catatanGuru || '',
                                    fileUrl: sub?.fileUrl,
                                    submissionText: sub?.submissionText,
                                  })
                                }
                                className="px-2.5 py-1 text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition"
                              >
                                {sub?.status === 'GRADED' ? 'Edit Nilai' : 'Beri Nilai'}
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedTaskForReview(null)}
                className="px-5 py-2 text-xs font-bold bg-slate-800 text-white rounded-xl shadow-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: INPUT NILAI & FEEDBACK UNTUK 1 SISWA */}
      {/* ========================================================= */}
      {gradingModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Evaluasi Jawaban Siswa</h3>
              <button onClick={() => setGradingModalData(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-slate-700 space-y-1">
              <p>
                <strong>Siswa:</strong> {gradingModalData.siswaNama}
              </p>
              {gradingModalData.submissionText && (
                <p>
                  <strong>Keterangan Siswa:</strong> {gradingModalData.submissionText}
                </p>
              )}
              {gradingModalData.fileUrl && (
                <p>
                  <strong>Lampiran File:</strong>{' '}
                  <a
                    href={gradingModalData.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline font-semibold"
                  >
                    Buka File Tugas
                  </a>
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nilai (0 - 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradingModalData.nilai}
                  onChange={(e) =>
                    setGradingModalData({
                      ...gradingModalData,
                      nilai: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-extrabold text-blue-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Komentar / Feedback Pembinaan
                </label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan catatan evaluasi, pujian, atau bagian yang perlu diperbaiki..."
                  value={gradingModalData.catatanGuru}
                  onChange={(e) => setGradingModalData({ ...gradingModalData, catatanGuru: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setGradingModalData(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveGradeSubmission}
                className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
              >
                Simpan Penilaian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: UNGGAH MATERI */}
      {/* ========================================================= */}
      {showUploadMateriModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" /> Unggah Materi Pelajaran
              </h3>
              <button onClick={() => setShowUploadMateriModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadMateri} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Judul Materi</label>
                <input
                  type="text"
                  placeholder="Contoh: Modul Eksponen & Logaritma Kelas X"
                  value={newMateriForm.judul}
                  onChange={(e) => setNewMateriForm({ ...newMateriForm, judul: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kelas</label>
                  <select
                    value={newMateriForm.kelasId}
                    onChange={(e) => setNewMateriForm({ ...newMateriForm, kelasId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-semibold"
                  >
                    {kelasList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.namaKelas}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mata Pelajaran</label>
                  <select
                    value={newMateriForm.mapelId}
                    onChange={(e) => setNewMateriForm({ ...newMateriForm, mapelId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-semibold"
                  >
                    {mapelList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.namaMapel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama File Dokumen</label>
                  <input
                    type="text"
                    placeholder="Materi_Bab_1.pdf"
                    value={newMateriForm.fileName}
                    onChange={(e) => setNewMateriForm({ ...newMateriForm, fileName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tipe Format File</label>
                  <select
                    value={newMateriForm.fileType}
                    onChange={(e) => setNewMateriForm({ ...newMateriForm, fileType: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="pdf">PDF Document (.pdf)</option>
                    <option value="pptx">PowerPoint Presentation (.pptx)</option>
                    <option value="docx">Word Document (.docx)</option>
                    <option value="mp4">Video Tutorial (.mp4)</option>
                    <option value="zip">Arsip ZIP (.zip)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Ringkasan isi materi atau instruksi bacaan mandiri..."
                  value={newMateriForm.deskripsi}
                  onChange={(e) => setNewMateriForm({ ...newMateriForm, deskripsi: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Batas ukuran berkas maksimum: 25MB. Format yang didukung: PDF, PPTX, DOCX, MP4, ZIP.</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadMateriModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
                >
                  Unggah Materi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: DETAIL & IZIN AKSES RAPORT DIGITAL SISWA */}
      {/* ========================================================= */}
      {showRaportDetailModal && selectedStudentForRaport && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Verifikasi Raport Digital - {selectedStudentForRaport.siswa.namaLengkap}
                  </h3>
                  <p className="text-xs text-slate-500">
                    NISN: {selectedStudentForRaport.siswa.nisn || '-'} | NIS: {selectedStudentForRaport.siswa.nis || '-'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRaportDetailModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Control Card */}
            <div className="p-4 rounded-2xl border bg-slate-50 space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Status Izin Akses Raport Siswa
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRaportDetailForm((prev) => ({ ...prev, status: 'PUBLISHED' }))}
                  className={`p-3 rounded-xl border text-left flex items-start gap-3 transition ${raportDetailForm.status === 'PUBLISHED'
                      ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:bg-slate-100/50'
                    }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${raportDetailForm.status === 'PUBLISHED'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-400'
                      }`}
                  >
                    <Unlock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Diizinkan (Terbuka)</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Siswa dapat melihat nilai dan mengunduh berkas raport
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRaportDetailForm((prev) => ({ ...prev, status: 'DRAFT' }))}
                  className={`p-3 rounded-xl border text-left flex items-start gap-3 transition ${raportDetailForm.status === 'DRAFT'
                      ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20'
                      : 'bg-white border-slate-200 hover:bg-slate-100/50'
                    }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${raportDetailForm.status === 'DRAFT'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 text-slate-400'
                      }`}
                  >
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Terkunci (Belum Izin)</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Raport belum bisa diakses siswa di dashboard mereka
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Nilai Ringkasan Preview */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Pratinjau Nilai Mata Pelajaran Siswa
              </label>
              {selectedStudentForRaport.nilais && selectedStudentForRaport.nilais.length > 0 ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-44 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Mata Pelajaran</th>
                        <th className="py-2 px-3 text-center">Tugas</th>
                        <th className="py-2 px-3 text-center">UH</th>
                        <th className="py-2 px-3 text-center">UTS</th>
                        <th className="py-2 px-3 text-center">UAS</th>
                        <th className="py-2 px-3 text-center">Nilai Akhir</th>
                        <th className="py-2 px-3 text-center">Predikat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedStudentForRaport.nilais.map((n: any, i: number) => {
                        const mObj = mapelList.find((m) => m.id === n.mapelId)
                        return (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-medium text-slate-800">
                              {mObj?.namaMapel || n.mapelId}
                            </td>
                            <td className="py-2 px-3 text-center font-mono">{n.nilaiTugas || '-'}</td>
                            <td className="py-2 px-3 text-center font-mono">{n.nilaiUh || '-'}</td>
                            <td className="py-2 px-3 text-center font-mono">{n.nilaiUts || '-'}</td>
                            <td className="py-2 px-3 text-center font-mono">{n.nilaiUas || '-'}</td>
                            <td className="py-2 px-3 text-center font-mono font-bold text-blue-700">
                              {n.nilaiAkhir || '-'}
                            </td>
                            <td className="py-2 px-3 text-center font-bold">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] ${n.predikat === 'A'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : n.predikat === 'B'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                              >
                                {n.predikat || '-'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  Data nilai mata pelajaran sudah disinkronisasi dengan master raport.
                </div>
              )}
            </div>

            {/* Catatan Wali Kelas */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Catatan Wali Kelas untuk Raport Siswa
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan catatan kemajuan belajar, kedisiplinan, dan motivasi untuk siswa..."
                value={raportDetailForm.catatanWaliKelas}
                onChange={(e) =>
                  setRaportDetailForm({ ...raportDetailForm, catatanWaliKelas: e.target.value })
                }
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                required
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowRaportDetailModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveRaportModal}
                disabled={savingRaport}
                className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition flex items-center gap-1.5 disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {savingRaport ? 'Menyimpan...' : 'Simpan Perubahan Raport'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* GENERIC CONFIRMATION MODAL (NILAI PLUS: Konfirmasi sebelum menghapus) */}
      {/* ========================================================= */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">{confirmDialog.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{confirmDialog.message}</p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmDialog((c) => ({ ...c, isOpen: false }))}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
