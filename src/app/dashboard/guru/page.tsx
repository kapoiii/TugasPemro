'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserCheck,
  Award,
  LogOut,
  School,
  Save,
  Users,
  Search,
  ChevronRight,
  Filter,
  Check,
  Plus,
  RefreshCw,
  Sparkles,
} from 'lucide-react'

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
}

interface MapelOption {
  id: string
  kodeMapel: string
  namaMapel: string
  kkm: number
}

interface SiswaItem {
  id: string
  namaLengkap: string
  nis: string
  nisn: string
  kelasId: string
}

interface SesiAbsensiHistory {
  id: string
  pertemuanKe: number
  tanggal: string
  keterangan?: string
  kelas?: { namaKelas: string }
  mapel?: { namaMapel: string }
  details?: Array<{
    id: string
    siswaId: string
    status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA'
    catatan?: string
    siswa?: { namaLengkap: string }
  }>
}

interface NilaiEntry {
  siswaId: string
  namaLengkap: string
  nis: string
  nilaiTugas: number
  nilaiUts: number
  nilaiUas: number
  nilaiPraktik: number
  nilaiSikap: number
  nilaiAkhir: number
  predikat: string
  catatan: string
}

export default function GuruDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'jadwal' | 'absensi' | 'nilai'>('jadwal')
  const [loading, setLoading] = useState(true)
  const [teacherProfile, setTeacherProfile] = useState({
    namaLengkap: 'Budi Santoso, S.Pd.',
    nip: '198501012010011001',
    mapelUtama: 'Matematika Wajib',
  })

  // Master options
  const [kelasList, setKelasList] = useState<KelasOption[]>([])
  const [mapelList, setMapelList] = useState<MapelOption[]>([])

  // 1. Jadwal State
  const [jadwalList, setJadwalList] = useState<JadwalItem[]>([])
  const [hariFilter, setHariFilter] = useState<string>('Semua')

  // 2. Absensi State
  const [selectedKelasAbsensi, setSelectedKelasAbsensi] = useState<string>('kelas-10-mipa1')
  const [selectedMapelAbsensi, setSelectedMapelAbsensi] = useState<string>('mapel-mtk')
  const [tanggalAbsensi, setTanggalAbsensi] = useState<string>('2026-10-16')
  const [pertemuanKe, setPertemuanKe] = useState<number>(1)
  const [keteranganAbsensi, setKeteranganAbsensi] = useState<string>('')
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, { status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA'; catatan: string }>>({})
  const [absensiHistory, setAbsensiHistory] = useState<SesiAbsensiHistory[]>([])
  const [submittingAbsensi, setSubmittingAbsensi] = useState(false)

  // 3. Nilai State
  const [selectedKelasNilai, setSelectedKelasNilai] = useState<string>('kelas-10-mipa1')
  const [selectedMapelNilai, setSelectedMapelNilai] = useState<string>('mapel-mtk')
  const [nilaiRows, setNilaiRows] = useState<NilaiEntry[]>([])
  const [submittingNilai, setSubmittingNilai] = useState(false)

  // All Siswa
  const [allSiswa, setAllSiswa] = useState<SiswaItem[]>([])

  // Notification feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 4000)
  }

  // Load Initial Data
  const loadInitialData = useCallback(async () => {
    setLoading(true)
    try {
      const [resMe, resMaster, resJadwal, resAbsensi, resSiswa, resNilai] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/admin/master'),
        fetch('/api/jadwal'),
        fetch('/api/absensi'),
        fetch('/api/admin/siswa-dashboard'),
        fetch('/api/nilai'),
      ])

      const dataMe = await resMe.json()
      const dataMaster = await resMaster.json()
      const dataJadwal = await resJadwal.json()
      const dataAbsensi = await resAbsensi.json()
      const dataSiswa = await resSiswa.json()
      const dataNilai = await resNilai.json()

      if (dataMe.success && dataMe.data?.details?.guruProfile) {
        const gp = dataMe.data.details.guruProfile
        setTeacherProfile({
          namaLengkap: gp.namaLengkap || dataMe.data.namaLengkap || 'Budi Santoso, S.Pd.',
          nip: gp.nip || '198501012010011001',
          mapelUtama: gp.mataPelajaranUtama || 'Matematika Wajib',
        })
      }

      if (dataMaster.success && dataMaster.data) {
        setKelasList(dataMaster.data.kelas || [])
        setMapelList(dataMaster.data.mapel || [])
      }

      if (dataJadwal.success && Array.isArray(dataJadwal.data)) {
        setJadwalList(dataJadwal.data)
      }

      if (dataAbsensi.success && Array.isArray(dataAbsensi.data)) {
        setAbsensiHistory(dataAbsensi.data)
      }

      if (dataSiswa.success && Array.isArray(dataSiswa.data)) {
        setAllSiswa(dataSiswa.data)
      }

      // Initialize attendance records for students in default class
      if (dataSiswa.success && Array.isArray(dataSiswa.data)) {
        const studentsInClass = dataSiswa.data.filter((s: SiswaItem) => s.kelasId === 'kelas-10-mipa1' || !s.kelasId)
        const initialRecords: Record<string, { status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA'; catatan: string }> = {}
        studentsInClass.forEach((st: SiswaItem) => {
          initialRecords[st.id] = { status: 'HADIR', catatan: '' }
        })
        setAttendanceRecords(initialRecords)

        // Initialize grades
        initGradeRows(studentsInClass, dataNilai.data || [], 'mapel-mtk')
      }
    } catch {
      showFeedback('error', 'Gagal memuat data portal guru')
    } finally {
      setLoading(false)
    }
  }, [])

  const initGradeRows = (students: SiswaItem[], existingGrades: Array<{
    siswaId: string
    mapelId: string
    nilaiTugas: number
    nilaiUts: number
    nilaiUas: number
    nilaiPraktik: number
    nilaiSikap: number
    nilaiAkhir: number
    predikat: string
    catatan?: string
  }>, mapelId: string) => {
    const rows: NilaiEntry[] = students.map((s) => {
      const match = existingGrades.find((g) => g.siswaId === s.id && g.mapelId === mapelId)
      const t = match?.nilaiTugas ?? 85
      const uts = match?.nilaiUts ?? 80
      const uas = match?.nilaiUas ?? 85
      const prk = match?.nilaiPraktik ?? 85
      const skp = match?.nilaiSikap ?? 90
      const finalVal = match?.nilaiAkhir ?? Number((t * 0.2 + uts * 0.25 + uas * 0.3 + prk * 0.15 + skp * 0.1).toFixed(2))
      let pred = match?.predikat ?? 'B'
      if (finalVal >= 88) pred = 'A'
      else if (finalVal >= 78) pred = 'B'
      else if (finalVal >= 68) pred = 'C'
      else pred = 'D'

      return {
        siswaId: s.id,
        namaLengkap: s.namaLengkap,
        nis: s.nis,
        nilaiTugas: t,
        nilaiUts: uts,
        nilaiUas: uas,
        nilaiPraktik: prk,
        nilaiSikap: skp,
        nilaiAkhir: finalVal,
        predikat: pred,
        catatan: match?.catatan || '',
      }
    })
    setNilaiRows(rows)
  }

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  // When class filter changes in Absensi
  const handleKelasAbsensiChange = (kelasId: string) => {
    setSelectedKelasAbsensi(kelasId)
    const filtered = allSiswa.filter((s) => s.kelasId === kelasId || (s as { kelas?: { id: string } }).kelas?.id === kelasId)
    const newRecords: Record<string, { status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA'; catatan: string }> = {}
    filtered.forEach((st) => {
      newRecords[st.id] = { status: 'HADIR', catatan: '' }
    })
    setAttendanceRecords(newRecords)
  }

  // When class or mapel filter changes in Nilai
  const handleKelasNilaiChange = async (newKelasId: string, newMapelId: string) => {
    setSelectedKelasNilai(newKelasId)
    setSelectedMapelNilai(newMapelId)
    const studentsInClass = allSiswa.filter((s) => s.kelasId === newKelasId || (s as { kelas?: { id: string } }).kelas?.id === newKelasId)
    try {
      const res = await fetch(`/api/nilai?kelasId=${newKelasId}&mapelId=${newMapelId}`)
      const json = await res.json()
      initGradeRows(studentsInClass, json.data || [], newMapelId)
    } catch {
      initGradeRows(studentsInClass, [], newMapelId)
    }
  }

  // 1-Click Set All Hadir
  const handleSetAllHadir = () => {
    const updated = { ...attendanceRecords }
    Object.keys(updated).forEach((id) => {
      updated[id] = { ...updated[id], status: 'HADIR' }
    })
    setAttendanceRecords(updated)
    showFeedback('success', 'Semua siswa ditandai HADIR')
  }

  // Save Absensi
  const handleSaveAbsensi = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingAbsensi(true)
    try {
      const recordsArray = Object.keys(attendanceRecords).map((siswaId) => ({
        siswaId,
        status: attendanceRecords[siswaId].status,
        catatan: attendanceRecords[siswaId].catatan,
      }))

      if (recordsArray.length === 0) {
        showFeedback('error', 'Tidak ada siswa yang diabsen di kelas ini')
        setSubmittingAbsensi(false)
        return
      }

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
        }),
      })

      const json = await res.json()
      if (json.success) {
        showFeedback('success', 'Data absensi masuk/tidak siswa berhasil disimpan!')
        setKeteranganAbsensi('')
        setPertemuanKe((prev) => prev + 1)
        // Refresh absensi history
        const updatedRes = await fetch('/api/absensi')
        const updatedJson = await updatedRes.json()
        if (updatedJson.success) setAbsensiHistory(updatedJson.data)
      } else {
        showFeedback('error', json.message || 'Gagal menyimpan absensi')
      }
    } catch {
      showFeedback('error', 'Terjadi kesalahan saat menyimpan absensi')
    } finally {
      setSubmittingAbsensi(false)
    }
  }

  // Live Recalculate Nilai for a student row
  const handleGradeChange = (
    index: number,
    field: 'nilaiTugas' | 'nilaiUts' | 'nilaiUas' | 'nilaiPraktik' | 'nilaiSikap' | 'catatan',
    val: string
  ) => {
    const updated = [...nilaiRows]
    const row = { ...updated[index] }

    if (field === 'catatan') {
      row.catatan = val
    } else {
      const num = Math.min(100, Math.max(0, Number(val) || 0))
      row[field] = num

      const t = field === 'nilaiTugas' ? num : row.nilaiTugas
      const uts = field === 'nilaiUts' ? num : row.nilaiUts
      const uas = field === 'nilaiUas' ? num : row.nilaiUas
      const prk = field === 'nilaiPraktik' ? num : row.nilaiPraktik
      const skp = field === 'nilaiSikap' ? num : row.nilaiSikap

      const akhir = Number((t * 0.2 + uts * 0.25 + uas * 0.3 + prk * 0.15 + skp * 0.1).toFixed(2))
      row.nilaiAkhir = akhir

      if (akhir >= 88) row.predikat = 'A'
      else if (akhir >= 78) row.predikat = 'B'
      else if (akhir >= 68) row.predikat = 'C'
      else row.predikat = 'D'
    }

    updated[index] = row
    setNilaiRows(updated)
  }

  // Save All Grades
  const handleSaveAllGrades = async () => {
    setSubmittingNilai(true)
    try {
      for (const row of nilaiRows) {
        await fetch('/api/nilai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            siswaId: row.siswaId,
            kelasId: selectedKelasNilai,
            mapelId: selectedMapelNilai,
            nilaiTugas: row.nilaiTugas,
            nilaiUts: row.nilaiUts,
            nilaiUas: row.nilaiUas,
            nilaiPraktik: row.nilaiPraktik,
            nilaiSikap: row.nilaiSikap,
            catatan: row.catatan,
          }),
        })
      }
      showFeedback('success', `Berhasil menyimpan & memperbarui seluruh nilai siswa kelas ${kelasList.find(k => k.id === selectedKelasNilai)?.namaKelas || ''}!`)
    } catch {
      showFeedback('error', 'Gagal menyimpan pembaruan nilai siswa')
    } finally {
      setSubmittingNilai(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  // Filtered Jadwal by Day
  const filteredJadwal = jadwalList.filter((j) => {
    if (hariFilter === 'Semua') return true
    return j.hari.toLowerCase() === hariFilter.toLowerCase()
  })

  // Students in selected attendance class
  const studentsInAbsensiClass = allSiswa.filter((s) => s.kelasId === selectedKelasAbsensi || (s as { kelas?: { id: string } }).kelas?.id === selectedKelasAbsensi)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header - White Theme with Navy Accents */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-800 text-base">Portal Guru SMA Nusantara Bangsa</h1>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-md border border-blue-100">
                  Akun Guru
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {teacherProfile.namaLengkap} • NIP: {teacherProfile.nip} ({teacherProfile.mapelUtama})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-rose-100"
            >
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex border-t border-slate-100 gap-2">
          <button
            onClick={() => setActiveTab('jadwal')}
            className={`py-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'jadwal'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Clock className="w-4 h-4" /> Jadwal Mengajar Guru
          </button>
          <button
            onClick={() => setActiveTab('absensi')}
            className={`py-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'absensi'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Input & Kelola Absensi Siswa
          </button>
          <button
            onClick={() => setActiveTab('nilai')}
            className={`py-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'nilai'
                ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Award className="w-4 h-4" /> Input & Merubah Nilai Siswa
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {feedback && (
        <div className="fixed top-20 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2.5 ${
              feedback.type === 'success'
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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            Memuat data portal guru...
          </div>
        ) : (
          <>
            {/* ========================================================= */}
            {/* TAB 1: JADWAL MENGAJAR (Melihat jadwal dia ada di kelas mana) */}
            {/* ========================================================= */}
            {activeTab === 'jadwal' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" /> Jadwal Mengajar Guru
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Pantau hari, jam, kelas yang diajar, dan ruang kegiatan belajar mengajar Anda
                    </p>
                  </div>

                  {/* Filter Hari */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5" /> Hari:
                    </span>
                    {['Semua', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map((h) => (
                      <button
                        key={h}
                        onClick={() => setHariFilter(h)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          hariFilter === h
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Schedule Grid */}
                {filteredJadwal.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Tidak ada jadwal mengajar pada filter ini.</p>
                    <p className="text-xs text-slate-400 mt-1">Silakan pilih hari lain atau tampilkan semua hari.</p>
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

                        <div className="space-y-1.5 mb-4">
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Mata Pelajaran:
                          </div>
                          <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {j.mapel?.namaMapel || 'Matematika Wajib'}
                          </h3>
                        </div>

                        <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="text-slate-400">Kelas yang Diajar:</span>
                            <span className="font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                              {j.kelas?.namaKelas || 'X MIPA 1'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="text-slate-400">Ruang Kelas / Lab:</span>
                            <span className="font-semibold text-slate-700">{j.ruangan}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedKelasAbsensi(j.kelasId)
                              setSelectedMapelAbsensi(j.mapelId)
                              setActiveTab('absensi')
                            }}
                            className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Absen Kelas Ini
                          </button>
                          <button
                            onClick={() => {
                              setSelectedKelasNilai(j.kelasId)
                              setSelectedMapelNilai(j.mapelId)
                              setActiveTab('nilai')
                            }}
                            className="flex-1 py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                          >
                            <Award className="w-3.5 h-3.5" /> Nilai Siswa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: INPUT & KELOLA ABSENSI SISWA (Input absen masuk atau tidaknya siswa) */}
            {/* ========================================================================= */}
            {activeTab === 'absensi' && (
              <div className="space-y-6">
                <form onSubmit={handleSaveAbsensi} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-blue-600" /> Input Absen Masuk atau Tidaknya Siswa
                      </h2>
                      <p className="text-sm text-slate-500 mt-0.5">
                        Tentukan status kehadiran setiap siswa: Masuk (Hadir), Izin, Sakit, atau Alfa
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSetAllHadir}
                      className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors shrink-0 shadow-xs"
                    >
                      <Check className="w-4 h-4" /> Tandai Semua Siswa Masuk (Hadir)
                    </button>
                  </div>

                  {/* Sesi Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                        Pilih Kelas:
                      </label>
                      <select
                        value={selectedKelasAbsensi}
                        onChange={(e) => handleKelasAbsensiChange(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                      >
                        {kelasList.map((k) => (
                          <option key={k.id} value={k.id}>
                            {k.namaKelas} (Tingkat {k.tingkat})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                        Mata Pelajaran:
                      </label>
                      <select
                        value={selectedMapelAbsensi}
                        onChange={(e) => setSelectedMapelAbsensi(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                      >
                        {mapelList.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.namaMapel} ({m.kodeMapel})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                        Tanggal Pertemuan:
                      </label>
                      <input
                        type="date"
                        required
                        value={tanggalAbsensi}
                        onChange={(e) => setTanggalAbsensi(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                        Pertemuan Ke-:
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={pertemuanKe}
                        onChange={(e) => setPertemuanKe(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Keterangan / Pokok Bahasan Materi:
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Pembahasan Soal Latihan Bab 2 & Praktikum"
                      value={keteranganAbsensi}
                      onChange={(e) => setKeteranganAbsensi(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Student Attendance Roster */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-500" />
                        Daftar Siswa Kelas {kelasList.find((k) => k.id === selectedKelasAbsensi)?.namaKelas || ''} ({studentsInAbsensiClass.length} Siswa)
                      </h3>

                      {/* Live Counter */}
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                          Hadir: {Object.values(attendanceRecords).filter((r) => r.status === 'HADIR').length}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                          Izin: {Object.values(attendanceRecords).filter((r) => r.status === 'IZIN').length}
                        </span>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                          Sakit: {Object.values(attendanceRecords).filter((r) => r.status === 'SAKIT').length}
                        </span>
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded">
                          Alfa: {Object.values(attendanceRecords).filter((r) => r.status === 'ALFA').length}
                        </span>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
                      {studentsInAbsensiClass.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">
                          Belum ada siswa terdaftar di kelas ini. Tambahkan siswa dari portal admin.
                        </div>
                      ) : (
                        studentsInAbsensiClass.map((st, index) => {
                          const currentStatus = attendanceRecords[st.id]?.status || 'HADIR'
                          const currentCatatan = attendanceRecords[st.id]?.catatan || ''

                          return (
                            <div
                              key={st.id}
                              className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-6 text-center text-xs font-bold text-slate-400">
                                  {index + 1}.
                                </span>
                                <div>
                                  <div className="font-bold text-slate-800 text-sm">{st.namaLengkap}</div>
                                  <div className="text-xs text-slate-400">NIS: {st.nis} • NISN: {st.nisn}</div>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-3">
                                {/* 4 Status Buttons */}
                                <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setAttendanceRecords((prev) => ({
                                        ...prev,
                                        [st.id]: { ...prev[st.id], status: 'HADIR' },
                                      }))
                                    }
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                      currentStatus === 'HADIR'
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                  >
                                    Hadir
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setAttendanceRecords((prev) => ({
                                        ...prev,
                                        [st.id]: { ...prev[st.id], status: 'IZIN' },
                                      }))
                                    }
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                      currentStatus === 'IZIN'
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                  >
                                    Izin
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setAttendanceRecords((prev) => ({
                                        ...prev,
                                        [st.id]: { ...prev[st.id], status: 'SAKIT' },
                                      }))
                                    }
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                      currentStatus === 'SAKIT'
                                        ? 'bg-amber-600 text-white shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                  >
                                    Sakit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setAttendanceRecords((prev) => ({
                                        ...prev,
                                        [st.id]: { ...prev[st.id], status: 'ALFA' },
                                      }))
                                    }
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                      currentStatus === 'ALFA'
                                        ? 'bg-rose-600 text-white shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                  >
                                    Alfa (Tidak Masuk)
                                  </button>
                                </div>

                                {/* Catatan */}
                                <input
                                  type="text"
                                  placeholder="Keterangan..."
                                  value={currentCatatan}
                                  onChange={(e) =>
                                    setAttendanceRecords((prev) => ({
                                      ...prev,
                                      [st.id]: { ...prev[st.id], catatan: e.target.value },
                                    }))
                                  }
                                  className="w-40 sm:w-48 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={submittingAbsensi}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {submittingAbsensi ? 'Menyimpan Absensi...' : 'Simpan Sesi Absensi'}
                    </button>
                  </div>
                </form>

                {/* Riwayat Absensi */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" /> Riwayat Sesi Absensi yang Telah Diinput
                  </h3>

                  {absensiHistory.length === 0 ? (
                    <p className="text-xs text-slate-400">Belum ada sesi absensi yang disimpan.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase">
                          <tr>
                            <th className="p-3">Pertemuan</th>
                            <th className="p-3">Tanggal</th>
                            <th className="p-3">Kelas</th>
                            <th className="p-3">Mata Pelajaran</th>
                            <th className="p-3">Materi / Keterangan</th>
                            <th className="p-3 text-center">Rekap Kehadiran</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {absensiHistory.map((sesi) => {
                            const details = sesi.details || []
                            const had = details.filter((d) => d.status === 'HADIR').length
                            const izn = details.filter((d) => d.status === 'IZIN').length
                            const skt = details.filter((d) => d.status === 'SAKIT').length
                            const alf = details.filter((d) => d.status === 'ALFA').length

                            return (
                              <tr key={sesi.id} className="hover:bg-slate-50/50">
                                <td className="p-3 font-bold text-blue-600">Ke-{sesi.pertemuanKe}</td>
                                <td className="p-3 text-slate-700">{sesi.tanggal}</td>
                                <td className="p-3 font-semibold text-slate-800">{sesi.kelas?.namaKelas || '-'}</td>
                                <td className="p-3 text-slate-700">{sesi.mapel?.namaMapel || '-'}</td>
                                <td className="p-3 text-slate-500 italic">{sesi.keterangan || '-'}</td>
                                <td className="p-3 text-center">
                                  <div className="inline-flex gap-1.5 font-bold">
                                    <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">H: {had}</span>
                                    <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">I: {izn}</span>
                                    <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">S: {skt}</span>
                                    <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">A: {alf}</span>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: INPUT & MERUBAH NILAI SISWA (Input dan merubah nilai siswa) */}
            {/* ========================================================================= */}
            {activeTab === 'nilai' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Award className="w-5 h-5 text-blue-600" /> Input & Merubah Nilai Siswa
                      </h2>
                      <p className="text-sm text-slate-500 mt-0.5">
                        Input dan edit nilai Tugas (20%), UTS (25%), UAS (30%), Praktik (15%), dan Sikap (10%). Nilai akhir & predikat dihitung otomatis!
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveAllGrades}
                      disabled={submittingNilai}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-50 shrink-0"
                    >
                      <Save className="w-4 h-4" />
                      {submittingNilai ? 'Menyimpan...' : 'Simpan Semua Nilai'}
                    </button>
                  </div>

                  {/* Filter Kelas & Mapel */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                        Pilih Kelas:
                      </label>
                      <select
                        value={selectedKelasNilai}
                        onChange={(e) => handleKelasNilaiChange(e.target.value, selectedMapelNilai)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                      >
                        {kelasList.map((k) => (
                          <option key={k.id} value={k.id}>
                            {k.namaKelas} (Tingkat {k.tingkat})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                        Mata Pelajaran:
                      </label>
                      <select
                        value={selectedMapelNilai}
                        onChange={(e) => handleKelasNilaiChange(selectedKelasNilai, e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                      >
                        {mapelList.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.namaMapel} (KKM: {m.kkm})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Grades Table */}
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                        <tr>
                          <th className="p-3 w-8">No</th>
                          <th className="p-3">Nama Siswa</th>
                          <th className="p-3 text-center w-24">Tugas (20%)</th>
                          <th className="p-3 text-center w-24">UTS (25%)</th>
                          <th className="p-3 text-center w-24">UAS (30%)</th>
                          <th className="p-3 text-center w-24">Praktik (15%)</th>
                          <th className="p-3 text-center w-24">Sikap (10%)</th>
                          <th className="p-3 text-center w-28">Nilai Akhir</th>
                          <th className="p-3 text-center w-20">Predikat</th>
                          <th className="p-3">Catatan Perkembangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {nilaiRows.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="p-8 text-center text-slate-400">
                              Tidak ada siswa yang terdaftar di kelas ini.
                            </td>
                          </tr>
                        ) : (
                          nilaiRows.map((row, index) => (
                            <tr key={row.siswaId} className="hover:bg-slate-50/60 transition-colors">
                              <td className="p-3 text-slate-400 font-bold text-center">{index + 1}</td>
                              <td className="p-3">
                                <div className="font-bold text-slate-800 text-sm">{row.namaLengkap}</div>
                                <div className="text-[11px] text-slate-400">NIS: {row.nis}</div>
                              </td>
                              <td className="p-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={row.nilaiTugas}
                                  onChange={(e) => handleGradeChange(index, 'nilaiTugas', e.target.value)}
                                  className="w-18 px-2 py-1.5 text-center font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={row.nilaiUts}
                                  onChange={(e) => handleGradeChange(index, 'nilaiUts', e.target.value)}
                                  className="w-18 px-2 py-1.5 text-center font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={row.nilaiUas}
                                  onChange={(e) => handleGradeChange(index, 'nilaiUas', e.target.value)}
                                  className="w-18 px-2 py-1.5 text-center font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={row.nilaiPraktik}
                                  onChange={(e) => handleGradeChange(index, 'nilaiPraktik', e.target.value)}
                                  className="w-18 px-2 py-1.5 text-center font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={row.nilaiSikap}
                                  onChange={(e) => handleGradeChange(index, 'nilaiSikap', e.target.value)}
                                  className="w-18 px-2 py-1.5 text-center font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500"
                                />
                              </td>
                              <td className="p-3 text-center">
                                <span className="font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg text-sm border border-blue-100">
                                  {row.nilaiAkhir}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <span
                                  className={`px-2.5 py-1 font-bold text-xs rounded-lg ${
                                    row.predikat === 'A'
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
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder="Catatan guru..."
                                  value={row.catatan}
                                  onChange={(e) => handleGradeChange(index, 'catatan', e.target.value)}
                                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:ring-1 focus:ring-blue-500"
                                />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <p className="text-xs text-slate-400">
                      * Perubahan nilai langsung dihitung ulang otomatis di tabel. Klik tombol di kanan untuk menyimpan permanen.
                    </p>
                    <button
                      type="button"
                      onClick={handleSaveAllGrades}
                      disabled={submittingNilai}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {submittingNilai ? 'Menyimpan...' : 'Simpan Semua Nilai'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
