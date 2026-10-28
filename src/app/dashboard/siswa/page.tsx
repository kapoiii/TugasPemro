'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Clock,
  BookOpen,
  Award,
  CheckCircle2,
  AlertCircle,
  LogOut,
  School,
  Download,
  FileCheck,
  Sparkles,
  Lock,
  Send,
  Upload,
  FileText,
  Check,
  AlertTriangle,
  UserCheck,
  Printer,
  ChevronRight,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

interface SiswaProfile {
  namaLengkap: string
  nisn: string
  nis: string
  kelas: string
  kelasId?: string
}

interface JadwalItem {
  id: string
  hari: string
  jamMulai: string
  jamSelesai: string
  ruangan: string
  mapel?: { namaMapel: string; kodeMapel: string }
  guru?: { namaLengkap: string }
}

interface AbsensiDetail {
  id: string
  status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA'
  catatan?: string
  sesi: {
    id: string
    tanggal: string
    pertemuanKe: number
    keterangan?: string
    mapel?: { namaMapel: string }
    guru?: { namaLengkap: string }
  }
}

interface AbsensiSummary {
  HADIR: number
  IZIN: number
  SAKIT: number
  ALFA: number
}

interface NilaiItem {
  id: string
  mapel?: { namaMapel: string; kkm: number }
  nilaiAkhir: number
  predikat: string
  nilaiTugas: number
  nilaiUts: number
  nilaiUas: number
  nilaiPraktik: number
  nilaiSikap: number
  catatan?: string
}

interface PekerjaanRumahItem {
  id: string
  judul: string
  deskripsi: string
  tenggatWaktu: string
  mapel?: { namaMapel: string }
  guru?: { namaLengkap: string }
  isSubmitted: boolean
  mySubmission?: {
    submissionText: string
    fileUrl?: string
    submittedAt: string
    status: 'SUBMITTED' | 'GRADED'
    nilai?: number
    catatanGuru?: string
  }
}

interface RaportInfo {
  status: string
  catatanWaliKelas?: string
  rataRataNilai: number
  semester: string
  tahunAjaran: string
  totalHadir: number
  totalIzin: number
  totalSakit: number
  totalAlfa: number
  isPublished?: boolean
}

export default function SiswaDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'absen' | 'jadwal' | 'pr' | 'raport'>('absen')
  const [loading, setLoading] = useState(true)

  // Profile (strictly loaded from session, never hardcoded)
  const [profile, setProfile] = useState<SiswaProfile | null>(null)

  // 1. Absensi States
  const [absensiSummary, setAbsensiSummary] = useState<AbsensiSummary>({
    HADIR: 0,
    IZIN: 0,
    SAKIT: 0,
    ALFA: 0,
  })
  const [absensiDetails, setAbsensiDetails] = useState<AbsensiDetail[]>([])
  const [filterMapelAbsen, setFilterMapelAbsen] = useState<string>('Semua')
  const [filterStatusAbsen, setFilterStatusAbsen] = useState<string>('Semua')

  // 2. Jadwal States
  const [jadwalList, setJadwalList] = useState<JadwalItem[]>([])
  const [selectedHari, setSelectedHari] = useState<string>('Semua')

  // 3. PR States
  const [prList, setPrList] = useState<PekerjaanRumahItem[]>([])
  const [submittingPrId, setSubmittingPrId] = useState<string | null>(null)
  const [submissionText, setSubmissionText] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [submittingLoading, setSubmittingLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<{
    name: string
    size: number
    dataUrl: string
    isImage: boolean
  } | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  // 4. Raport States
  const [isRaportPublished, setIsRaportPublished] = useState(false)
  const [tanggalPembagianRaport, setTanggalPembagianRaport] = useState('15 Desember 2026')
  const [raport, setRaport] = useState<RaportInfo | null>(null)
  const [nilais, setNilais] = useState<NilaiItem[]>([])

  // Feedback Notification
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 4000)
  }

  // Load All Student Data
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [resMe, resAbsensi, resJadwal, resPr, resRaport, resNilai] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/absensi'),
        fetch('/api/jadwal'),
        fetch('/api/pr'),
        fetch('/api/raport'),
        fetch('/api/nilai'),
      ])

      const dataMe = await resMe.json()

      // Role check: Strictly ensure only SISWA (or ADMIN) stays here
      if (!resMe.ok || !dataMe.success || !dataMe.data) {
        router.push('/login')
        return
      }

      if (dataMe.data.role !== 'SISWA' && dataMe.data.role !== 'ADMIN') {
        if (dataMe.data.role === 'GURU') {
          router.push('/dashboard/guru')
          return
        }
        router.push('/login')
        return
      }

      const dataAbsensi = await resAbsensi.json()
      const dataJadwal = await resJadwal.json()
      const dataPr = await resPr.json()
      const dataRaport = await resRaport.json()
      const dataNilai = await resNilai.json()

      // 1. Profile
      const p = dataMe.data.details?.siswaProfile || {}
      setProfile({
        namaLengkap: p.namaLengkap || dataMe.data.namaLengkap || dataMe.data.username || '',
        nisn: p.nisn || (dataMe.data as any).nisn || '',
        nis: p.nis || (dataMe.data as any).nis || '',
        kelas: p.kelas?.namaKelas || (dataMe.data as any).kelasNama || 'Kelas Siswa',
        kelasId: p.kelasId || (dataMe.data as any).kelasId,
      })

      // 2. Absensi
      if (dataAbsensi.success && dataAbsensi.data) {
        if (dataAbsensi.data.summary) setAbsensiSummary(dataAbsensi.data.summary)
        if (Array.isArray(dataAbsensi.data.details)) setAbsensiDetails(dataAbsensi.data.details)
      }

      // 3. Jadwal
      if (dataJadwal.success && Array.isArray(dataJadwal.data)) {
        setJadwalList(dataJadwal.data)
      }

      // 4. PR
      if (dataPr.success && Array.isArray(dataPr.data)) {
        setPrList(dataPr.data)
      }

      // 5. Raport (Only accessible when pembagian raport is open!)
      if (dataRaport.success) {
        if (dataRaport.tanggalPembagianRaport) {
          setTanggalPembagianRaport(dataRaport.tanggalPembagianRaport)
        }
        setIsRaportPublished(!!dataRaport.isPublished)

        if (dataRaport.isPublished && Array.isArray(dataRaport.data) && dataRaport.data.length > 0) {
          const r = dataRaport.data[0]
          setRaport({
            status: r.status,
            catatanWaliKelas: r.catatanWaliKelas,
            rataRataNilai: r.rataRataNilai,
            semester: r.semester,
            tahunAjaran: r.tahunAjaran,
            totalHadir: r.totalHadir,
            totalIzin: r.totalIzin,
            totalSakit: r.totalSakit,
            totalAlfa: r.totalAlfa,
            isPublished: true,
          })
        }
      }

      // 6. Nilai
      if (dataNilai.success && Array.isArray(dataNilai.data)) {
        setNilais(dataNilai.data)
      }
    } catch {
      showFeedback('error', 'Gagal memuat data akademik siswa')
    } finally {
      setLoading(false)
    }
  }, [])

  const [checkingRaport, setCheckingRaport] = useState(false)

  const checkRaportStatus = useCallback(async (notifyOnSuccess = false) => {
    setCheckingRaport(true)
    try {
      const [resRaport, resNilai] = await Promise.all([
        fetch('/api/raport'),
        fetch('/api/nilai'),
      ])
      const dataRaport = await resRaport.json()
      const dataNilai = await resNilai.json()

      if (dataRaport.success) {
        if (dataRaport.tanggalPembagianRaport) {
          setTanggalPembagianRaport(dataRaport.tanggalPembagianRaport)
        }
        setIsRaportPublished(!!dataRaport.isPublished)

        if (dataRaport.isPublished && Array.isArray(dataRaport.data) && dataRaport.data.length > 0) {
          const r = dataRaport.data[0]
          setRaport({
            status: r.status,
            catatanWaliKelas: r.catatanWaliKelas,
            rataRataNilai: r.rataRataNilai,
            semester: r.semester,
            tahunAjaran: r.tahunAjaran,
            totalHadir: r.totalHadir,
            totalIzin: r.totalIzin,
            totalSakit: r.totalSakit,
            totalAlfa: r.totalAlfa,
            isPublished: true,
          })
          if (notifyOnSuccess) {
            showFeedback('success', 'Raport digital resmi terbuka! Anda dapat melihat hasil belajar.')
          }
        } else if (notifyOnSuccess) {
          showFeedback('error', 'Raport masih dikunci oleh Guru / Wali Kelas.')
        }
      }

      if (dataNilai.success && Array.isArray(dataNilai.data)) {
        setNilais(dataNilai.data)
      }
    } catch {
      if (notifyOnSuccess) {
        showFeedback('error', 'Gagal memuat status izin raport')
      }
    } finally {
      setCheckingRaport(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Automatically re-check raport status whenever student switches to Raport tab
  useEffect(() => {
    if (activeTab === 'raport') {
      checkRaportStatus()
    }
  }, [activeTab, checkRaportStatus])

  // File upload change handler (supports gallery on mobile, file dialog on PC)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      showFeedback('error', 'Ukuran berkas melebihi batas 10MB.')
      return
    }

    const isImage = file.type.startsWith('image/')
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setSelectedFile({
        name: file.name,
        size: file.size,
        dataUrl: result,
        isImage,
      })
      setFileUrl(result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setFileUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle Homework Submission (Input Pekerjaan Rumah)
  const handleSubmitPr = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!submittingPrId) return

    setSubmittingLoading(true)
    try {
      const res = await fetch('/api/pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prId: submittingPrId,
          submissionText,
          fileUrl: selectedFile?.dataUrl || fileUrl,
        }),
      })

      const data = await res.json()
      if (data.success) {
        showFeedback('success', 'Pekerjaan rumah berhasil dikumpulkan!')
        setSubmittingPrId(null)
        setSubmissionText('')
        setFileUrl('')
        setSelectedFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        // Refresh PR list
        const updatedRes = await fetch('/api/pr')
        const updatedJson = await updatedRes.json()
        if (updatedJson.success) setPrList(updatedJson.data)
      } else {
        showFeedback('error', data.message || 'Gagal mengumpulkan pekerjaan rumah')
      }
    } catch {
      showFeedback('error', 'Terjadi kesalahan saat mengumpulkan pekerjaan rumah')
    } finally {
      setSubmittingLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const totalPertemuan = absensiSummary.HADIR + absensiSummary.IZIN + absensiSummary.SAKIT + absensiSummary.ALFA
  const persentaseKehadiran = totalPertemuan > 0 ? Math.round((absensiSummary.HADIR / totalPertemuan) * 100) : 100

  // Filtered Jadwal
  const filteredJadwal = jadwalList.filter((j) => {
    if (selectedHari === 'Semua') return true
    return j.hari.toLowerCase() === selectedHari.toLowerCase()
  })

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header - White Theme with School Navy/Blue */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-800 text-base">Portal Siswa SMA Nusantara Bangsa</h1>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-md border border-blue-100">
                  Akun Siswa
                </span>
              </div>
              <div className="text-xs text-slate-500 min-h-[16px] flex items-center">
                {profile ? (
                  <span>
                    {profile.namaLengkap} • Kelas {profile.kelas} (NISN: {profile.nisn})
                  </span>
                ) : (
                  <span className="inline-block w-48 h-3.5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-rose-100 cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          </div>
        </div>

        {/* 4 Primary Navigation Tabs for Students */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex border-t border-slate-100 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('absen')}
            className={`py-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${activeTab === 'absen'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
          >
            <Calendar className="w-4 h-4" /> Rekap & Riwayat Absen
          </button>

          <button
            onClick={() => setActiveTab('jadwal')}
            className={`py-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${activeTab === 'jadwal'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
          >
            <Clock className="w-4 h-4" /> Jadwal Mata Pelajaran
          </button>

          <button
            onClick={() => setActiveTab('pr')}
            className={`py-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${activeTab === 'pr'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
          >
            <BookOpen className="w-4 h-4" /> Pekerjaan Rumah (PR)
            {prList.filter((p) => !p.isSubmitted).length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                {prList.filter((p) => !p.isSubmitted).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('raport')}
            className={`py-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${activeTab === 'raport'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
          >
            <Award className="w-4 h-4" /> Hasil Raport Digital
            {!isRaportPublished && (
              <span className="px-1.5 py-0.2 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-md flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Terkunci
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {feedback && (
        <div className="fixed top-20 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2.5 ${feedback.type === 'success'
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
            Memuat data akademik siswa...
          </div>
        ) : (
          <>
            {/* ============================================================== */}
            {/* TAB 1: MELIHAT ABSEN SISWA (Rekap kehadiran & riwayat log)     */}
            {/* ============================================================== */}
            {activeTab === 'absen' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" /> Rekap & Riwayat Kehadiran Siswa
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Catatan resmi kehadiran Anda pada seluruh sesi mata pelajaran di kelas {profile?.kelas || ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live Sync Aktif (Kelas & Rumah)
                    </span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-lg flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" /> Status: {persentaseKehadiran >= 85 ? 'Memenuhi Syarat' : 'Perlu Ditingkatkan'}
                    </span>
                  </div>
                </div>

                {/* Live Real-Time Banner */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50/60 rounded-2xl border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">
                        Log Riwayat Kehadiran Real-Time per Pertemuan Aktif
                      </p>
                      <p className="text-slate-500">
                        Memantau absensi tatap muka di ruang kelas maupun pembelajaran online dari rumah secara langsung dan transparan.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => loadData()}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-blue-700 font-semibold border border-blue-200 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Segarkan Data
                  </button>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Hadir</span>
                    <div className="text-3xl font-extrabold text-emerald-600">{absensiSummary.HADIR}</div>
                    <span className="text-xs text-slate-500">Pertemuan masuk</span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Izin</span>
                    <div className="text-3xl font-extrabold text-blue-600">{absensiSummary.IZIN}</div>
                    <span className="text-xs text-slate-500">Pertemuan</span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Sakit</span>
                    <div className="text-3xl font-extrabold text-amber-600">{absensiSummary.SAKIT}</div>
                    <span className="text-xs text-slate-500">Pertemuan</span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Alfa</span>
                    <div className="text-3xl font-extrabold text-rose-600">{absensiSummary.ALFA}</div>
                    <span className="text-xs text-slate-500">Tanpa keterangan</span>
                  </div>

                  <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 rounded-2xl shadow-sm space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Persentase</span>
                    <div className="text-3xl font-extrabold">{persentaseKehadiran}%</div>
                    <span className="text-xs text-blue-100">Dari {totalPertemuan} pertemuan</span>
                  </div>
                </div>

                {/* Detailed Attendance History Table */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-blue-600" /> Log Riwayat Kehadiran per Pertemuan
                    </h3>

                    {/* Filter controls */}
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={filterMapelAbsen}
                        onChange={(e) => setFilterMapelAbsen(e.target.value)}
                        className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="Semua">Semua Mata Pelajaran</option>
                        {Array.from(new Set(absensiDetails.map((d) => d.sesi.mapel?.namaMapel).filter(Boolean))).map((m) => (
                          <option key={m as string} value={m as string}>{m}</option>
                        ))}
                      </select>

                      <select
                        value={filterStatusAbsen}
                        onChange={(e) => setFilterStatusAbsen(e.target.value)}
                        className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="Semua">Semua Status</option>
                        <option value="HADIR">Hadir</option>
                        <option value="IZIN">Izin</option>
                        <option value="SAKIT">Sakit</option>
                        <option value="ALFA">Alfa</option>
                      </select>
                    </div>
                  </div>

                  {absensiDetails.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      Belum ada riwayat pertemuan absensi yang tercatat.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase">
                          <tr>
                            <th className="p-3">Tanggal</th>
                            <th className="p-3">Mata Pelajaran</th>
                            <th className="p-3">Pertemuan</th>
                            <th className="p-3">Status Masuk</th>
                            <th className="p-3">Guru Pengajar</th>
                            <th className="p-3">Keterangan / Catatan Pembelajaran</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {absensiDetails
                            .filter((det) => {
                              const matchMapel = filterMapelAbsen === 'Semua' || det.sesi.mapel?.namaMapel === filterMapelAbsen
                              const matchStatus = filterStatusAbsen === 'Semua' || det.status === filterStatusAbsen
                              return matchMapel && matchStatus
                            })
                            .map((det) => (
                            <tr key={det.id} className="hover:bg-slate-50/50">
                              <td className="p-3 font-semibold text-slate-800">{det.sesi.tanggal}</td>
                              <td className="p-3 font-bold text-slate-700">{det.sesi.mapel?.namaMapel || '-'}</td>
                              <td className="p-3 text-slate-600 font-medium">Pertemuan ke-{det.sesi.pertemuanKe}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2.5 py-1 rounded-lg font-bold text-xs inline-flex items-center gap-1 ${det.status === 'HADIR'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : det.status === 'IZIN'
                                        ? 'bg-blue-100 text-blue-800'
                                        : det.status === 'SAKIT'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-rose-100 text-rose-800'
                                    }`}
                                >
                                  {det.status === 'HADIR' ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600" /> Masuk (Hadir)
                                    </>
                                  ) : det.status === 'IZIN' ? (
                                    'Izin'
                                  ) : det.status === 'SAKIT' ? (
                                    'Sakit'
                                  ) : (
                                    'Alfa'
                                  )}
                                </span>
                              </td>
                              <td className="p-3 text-slate-600 font-medium">{det.sesi.guru?.namaLengkap || '-'}</td>
                              <td className="p-3 text-slate-600">
                                {det.catatan || det.sesi.keterangan || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 2: MELIHAT JADWAL MATA PELAJARAN (Jadwal Pelajaran Siswa)  */}
            {/* ============================================================== */}
            {activeTab === 'jadwal' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" /> Jadwal Mata Pelajaran Kelas {profile?.kelas || ''}
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Jadwal kegiatan belajar mengajar resmi semester ganjil tahun ajaran 2025/2026
                    </p>
                  </div>

                  {/* Day filter buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {['Semua', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map((h) => (
                      <button
                        key={h}
                        onClick={() => setSelectedHari(h)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${selectedHari === h
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timetable Cards */}
                {filteredJadwal.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Tidak ada jadwal pelajaran pada hari ini.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredJadwal.map((j) => (
                      <div
                        key={j.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg border border-blue-100">
                            {j.hari}
                          </span>
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {j.jamMulai} - {j.jamSelesai} WIB
                          </span>
                        </div>

                        <div className="space-y-1 mb-4">
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Mata Pelajaran:
                          </div>
                          <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {j.mapel?.namaMapel || 'Matematika Wajib'}
                          </h3>
                        </div>

                        <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="text-slate-400">Guru Pengajar:</span>
                            <span className="font-bold text-slate-800">{j.guru?.namaLengkap || 'Budi Santoso, S.Pd.'}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="text-slate-400">Ruangan:</span>
                            <span className="font-semibold text-slate-700">{j.ruangan}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 3: MENGINPUT PEKERJAAN RUMAH (Input PR / Tugas Siswa)       */}
            {/* ============================================================== */}
            {activeTab === 'pr' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" /> Pekerjaan Rumah (PR) & Tugas Siswa
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Lihat tugas PR yang diberikan oleh guru dan input pengumpulan tugas Anda secara online
                    </p>
                  </div>
                </div>

                {/* PR List */}
                <div className="space-y-4">
                  {prList.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-600">Belum ada tugas pekerjaan rumah baru.</p>
                      <p className="text-xs text-slate-400 mt-1">Seluruh tugas Anda sudah selesai dikerjakan.</p>
                    </div>
                  ) : (
                    prList.map((pr) => (
                      <div
                        key={pr.id}
                        className={`bg-white p-6 rounded-2xl border shadow-xs transition-all ${pr.isSubmitted ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 hover:border-blue-400'
                          }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                                {pr.mapel?.namaMapel || 'Mata Pelajaran'}
                              </span>
                              <span className="text-xs text-slate-500">
                                Guru: <strong>{pr.guru?.namaLengkap || 'Guru Pengampu'}</strong>
                              </span>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                Tenggat: <strong>{new Date(pr.tenggatWaktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                              </span>
                            </div>

                            <h3 className="text-lg font-bold text-slate-800">{pr.judul}</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">{pr.deskripsi}</p>
                          </div>

                          <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2">
                            {pr.isSubmitted ? (
                              <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-emerald-200">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sudah Dikumpulkan
                              </span>
                            ) : (
                              <span className="px-3 py-1.5 bg-amber-100 text-amber-800 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-amber-200">
                                <AlertTriangle className="w-4 h-4 text-amber-600" /> Belum Dikerjakan
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setSubmittingPrId(pr.id)
                                setSubmissionText(pr.mySubmission?.submissionText || '')
                                setFileUrl(pr.mySubmission?.fileUrl || '')
                              }}
                              className={`px-4 py-2 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 ${pr.isSubmitted
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                                }`}
                            >
                              <Send className="w-3.5 h-3.5" />
                              {pr.isSubmitted ? 'Edit Pengumpulan' : 'Input Pekerjaan Rumah'}
                            </button>
                          </div>
                        </div>

                        {/* Submission Details if submitted */}
                        {pr.isSubmitted && pr.mySubmission && (
                          <div className="mt-4 pt-4 border-t border-emerald-200/60 bg-emerald-50/50 p-4 rounded-xl space-y-2 text-xs">
                            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                              <FileCheck className="w-4 h-4 text-emerald-700" /> Catatan Pengumpulan Anda:
                            </div>
                            <p className="text-emerald-800 italic">&quot;{pr.mySubmission.submissionText}&quot;</p>
                            {pr.mySubmission.fileUrl && (
                              <div className="space-y-1.5 pt-1">
                                {pr.mySubmission.fileUrl.startsWith('data:image') ||
                                /\.(png|jpe?g|webp|gif)$/i.test(pr.mySubmission.fileUrl) ? (
                                  <div className="space-y-1">
                                    <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Foto Bukti Tugas Terunggah:
                                    </span>
                                    <a
                                      href={pr.mySubmission.fileUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="block max-w-xs group relative rounded-xl overflow-hidden border border-emerald-200 shadow-2xs"
                                    >
                                      <img
                                        src={pr.mySubmission.fileUrl}
                                        alt="Foto Bukti Tugas"
                                        className="w-full h-36 object-cover group-hover:scale-105 transition-transform"
                                      />
                                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                                        <ExternalLink className="w-3.5 h-3.5" /> Buka Foto Penuh
                                      </div>
                                    </a>
                                  </div>
                                ) : (
                                  <a
                                    href={pr.mySubmission.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" /> Buka Tautan Berkas Tugas Lampiran
                                  </a>
                                )}
                              </div>
                            )}
                            {pr.mySubmission.nilai !== undefined && (
                              <div className="mt-2 pt-2 border-t border-emerald-200 text-emerald-900">
                                Nilai Tugas: <strong className="text-sm font-extrabold text-blue-700">{pr.mySubmission.nilai} / 100</strong>
                                {pr.mySubmission.catatanGuru && (
                                  <span className="block text-slate-600 mt-0.5">Catatan Guru: &quot;{pr.mySubmission.catatanGuru}&quot;</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Modal Input / Submit PR */}
                {submittingPrId && (
                  <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-fade-up">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                          <Upload className="w-5 h-5 text-blue-600" /> Input Pengumpulan Pekerjaan Rumah
                        </h3>
                        <button
                          onClick={() => {
                            setSubmittingPrId(null)
                            setSelectedFile(null)
                          }}
                          className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center font-bold"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleSubmitPr} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                            Jawaban / Keterangan Pengerjaan PR:
                          </label>
                          <textarea
                            rows={3}
                            required
                            placeholder="Tuliskan jawaban singkat atau rangkuman pengerjaan tugas Anda di sini..."
                            value={submissionText}
                            onChange={(e) => setSubmissionText(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* File Upload from Mobile Gallery or Laptop File Manager */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                            Unggah Foto / Berkas Tugas (Galeri HP / File Manager Laptop):
                          </label>

                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*,application/pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="hidden"
                          />

                          {!selectedFile ? (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full p-4 border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 rounded-2xl flex flex-col items-center justify-center gap-2 text-blue-600 transition-all cursor-pointer group"
                            >
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload className="w-5 h-5 text-blue-600" />
                              </div>
                              <span className="font-bold text-xs text-slate-800">
                                Pilih Foto dari Galeri HP / File Manager Laptop
                              </span>
                              <span className="text-[11px] text-slate-500 text-center">
                                Bisa langsung dari Galeri Kamera HP atau File Explorer Laptop (Maks. 10MB)
                              </span>
                            </button>
                          ) : (
                            <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 overflow-hidden">
                                {selectedFile.isImage ? (
                                  <img
                                    src={selectedFile.dataUrl}
                                    alt="Preview Tugas"
                                    className="w-12 h-12 object-cover rounded-xl border border-blue-200 shrink-0 shadow-xs"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                  </div>
                                )}
                                <div className="truncate">
                                  <p className="text-xs font-bold text-slate-800 truncate">
                                    {selectedFile.name}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    {(selectedFile.size / 1024).toFixed(1)} KB • Siap dikumpulkan
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                                >
                                  Ganti
                                </button>
                                <button
                                  type="button"
                                  onClick={handleRemoveFile}
                                  className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  Hapus
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                            Atau Tautan Dokumen / Google Drive (Opsional):
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: https://drive.google.com/file/d/..."
                            value={fileUrl.startsWith('data:') ? '' : fileUrl}
                            onChange={(e) => {
                              setSelectedFile(null)
                              setFileUrl(e.target.value)
                            }}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setSubmittingPrId(null)}
                            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            disabled={submittingLoading}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                          >
                            <Send className="w-4 h-4" />
                            {submittingLoading ? 'Mengirim Tugas...' : 'Kumpulkan Tugas Sekarang'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 4: HASIL RAPORT DIGITAL (HANYA PADA SAAT PEMBAGIAN RAPORT)  */}
            {/* ============================================================== */}
            {activeTab === 'raport' && (
              <div className="space-y-6">
                {!isRaportPublished ? (
                  /* =================================================== */
                  /* LOCKED STATE: Raport HANYA saat pembagian raport!   */
                  /* =================================================== */
                  <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm space-y-6">
                    <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200/80 shadow-xs">
                      <Lock className="w-10 h-10" />
                    </div>

                    <div className="space-y-2">
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 font-extrabold text-xs rounded-full uppercase tracking-wider inline-block">
                        Menunggu Izin Guru / Wali Kelas
                      </span>
                      <h2 className="text-2xl font-extrabold text-slate-800">
                        Akses Raport Digital Masih Dikunci
                      </h2>
                      <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                        Sesuai ketentuan akademik sekolah, raport digital <strong>hanya dapat dibuka setelah Guru / Wali Kelas memberikan izin penerbitan resmi</strong>.
                      </p>
                    </div>

                    {/* Announcement Information Box */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-xs space-y-3">
                      <div className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-blue-600" /> Informasi Jadwal Pembagian Raport:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="text-slate-400 block text-[11px]">Tanggal Pembagian:</span>
                          <span className="font-bold text-slate-800 text-sm">{tanggalPembagianRaport}</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="text-slate-400 block text-[11px]">Status Penerbitan:</span>
                          <span className="font-bold text-amber-600 text-sm">Menunggu Rilis Wali Kelas</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 italic">
                        * Hubungi Wali Kelas Anda apabila terdapat keperluan administratif atau verifikasi perbaikan nilai sebelum tanggal pembagian raport.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => checkRaportStatus(true)}
                      disabled={checkingRaport}
                      className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${checkingRaport ? 'animate-spin' : ''}`} />
                      {checkingRaport ? 'Memeriksa Izin Guru...' : 'Periksa & Buka Raport Sekarang'}
                    </button>
                  </div>
                ) : (
                  /* =================================================== */
                  /* UNLOCKED STATE: Raport Resmi pada saat pembagian    */
                  /* =================================================== */
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full inline-block mb-1">
                          Resmi Diterbitkan (Masa Pembagian Raport)
                        </span>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          <Award className="w-5 h-5 text-blue-600" /> Raport Digital Semester Ganjil 2025/2026
                        </h2>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => checkRaportStatus(true)}
                          disabled={checkingRaport}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                          title="Perbarui data raport"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${checkingRaport ? 'animate-spin' : ''}`} />
                          {checkingRaport ? 'Memuat...' : 'Perbarui'}
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all shrink-0 cursor-pointer"
                        >
                          <Printer className="w-4 h-4" /> Cetak / Unduh Raport PDF
                        </button>
                      </div>
                    </div>

                    {/* Official Report Card Sheet */}
                    <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-8 print:shadow-none print:border-none print:p-0">
                      {/* Kop Sekolah */}
                      <div className="border-b-2 border-slate-800 pb-6 text-center space-y-1">
                        <h1 className="text-2xl font-black text-slate-900 tracking-wide uppercase">
                          SMA NUSANTARA BANGSA
                        </h1>
                        <p className="text-xs text-slate-600">
                          Jl. Pendidikan No. 10, Jakarta Selatan • Telp: (021) 7890123 • Email: info@sekolah.sch.id
                        </p>
                        <p className="text-xs font-bold text-blue-700 uppercase tracking-widest pt-2">
                          LAPORAN HASIL BELAJAR SISWA (RAPORT DIGITAL)
                        </p>
                      </div>

                      {/* Student Identity */}
                      <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <div className="space-y-1.5">
                          <div>
                            <span className="text-slate-400">Nama Siswa:</span>{' '}
                            <strong className="text-slate-800 text-sm">{profile?.namaLengkap || '-'}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Nomor Induk Siswa (NIS):</span>{' '}
                            <strong className="text-slate-800">{profile?.nis || '-'}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">NISN:</span>{' '}
                            <strong className="text-slate-800">{profile?.nisn || '-'}</strong>
                          </div>
                        </div>
                        <div className="space-y-1.5 text-right sm:text-left">
                          <div>
                            <span className="text-slate-400">Kelas:</span>{' '}
                            <strong className="text-slate-800">{profile?.kelas || '-'}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Semester:</span>{' '}
                            <strong className="text-slate-800">1 (Ganjil)</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Tahun Ajaran:</span>{' '}
                            <strong className="text-slate-800">2025/2026</strong>
                          </div>
                        </div>
                      </div>

                      {/* Grades Table */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                          A. Capaian Hasil Belajar Akademik
                        </h4>
                        <div className="overflow-x-auto border border-slate-300 rounded-xl">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 uppercase">
                              <tr>
                                <th className="p-3 w-8">No</th>
                                <th className="p-3">Mata Pelajaran</th>
                                <th className="p-3 text-center">KKM</th>
                                <th className="p-3 text-center">Nilai Akhir</th>
                                <th className="p-3 text-center">Predikat</th>
                                <th className="p-3">Keterangan</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {nilais.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="p-4 text-center text-slate-400">
                                    Belum ada data nilai tercatat.
                                  </td>
                                </tr>
                              ) : (
                                nilais.map((n, idx) => (
                                  <tr key={n.id || idx}>
                                    <td className="p-3 text-center text-slate-500 font-semibold">{idx + 1}</td>
                                    <td className="p-3 font-bold text-slate-800">{n.mapel?.namaMapel || 'Mata Pelajaran'}</td>
                                    <td className="p-3 text-center text-slate-600">{n.mapel?.kkm || 75}</td>
                                    <td className="p-3 text-center font-extrabold text-blue-700 text-sm">{n.nilaiAkhir}</td>
                                    <td className="p-3 text-center font-bold">{n.predikat}</td>
                                    <td className="p-3 text-slate-600">
                                      {n.nilaiAkhir >= (n.mapel?.kkm || 75) ? (
                                        <span className="text-emerald-700 font-semibold">Tuntas</span>
                                      ) : (
                                        <span className="text-rose-600 font-semibold">Perlu Bimbingan</span>
                                      )}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Attendance Recap in Raport */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                          B. Rekap Ketidakhadiran
                        </h4>
                        <div className="grid grid-cols-4 gap-3 text-center text-xs">
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                            <span className="text-slate-400 block text-[11px]">Hadir</span>
                            <strong className="text-emerald-700 text-base">{absensiSummary.HADIR} Hari</strong>
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                            <span className="text-slate-400 block text-[11px]">Izin</span>
                            <strong className="text-blue-700 text-base">{absensiSummary.IZIN} Hari</strong>
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                            <span className="text-slate-400 block text-[11px]">Sakit</span>
                            <strong className="text-amber-700 text-base">{absensiSummary.SAKIT} Hari</strong>
                          </div>
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                            <span className="text-slate-400 block text-[11px]">Tanpa Keterangan (Alfa)</span>
                            <strong className="text-rose-700 text-base">{absensiSummary.ALFA} Hari</strong>
                          </div>
                        </div>
                      </div>

                      {/* Catatan Wali Kelas */}
                      <div className="space-y-2 p-5 bg-blue-50/70 border border-blue-200 rounded-2xl">
                        <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider">
                          C. Catatan Resmi Wali Kelas:
                        </h4>
                        <p className="text-sm text-blue-950 italic leading-relaxed">
                          &quot;{raport?.catatanWaliKelas || 'Pertahankan prestasi belajar, tingkatkan kedisiplinan dan selalu aktif dalam kegiatan intrakurikuler maupun ekstrakurikuler.'}&quot;
                        </p>
                      </div>

                      {/* Signature Area */}
                      <div className="pt-8 border-t border-slate-200 flex justify-between text-xs text-slate-700 text-center">
                        <div className="space-y-16">
                          <p>Orang Tua / Wali Siswa,</p>
                          <p className="font-bold underline">( ........................................ )</p>
                        </div>
                        <div className="space-y-16">
                          <p>Jakarta, {tanggalPembagianRaport}<br />Wali Kelas,</p>
                          <p className="font-bold underline">Budi Santoso, S.Pd.<br /><span className="font-normal text-slate-500">NIP. 198501012010011001</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
