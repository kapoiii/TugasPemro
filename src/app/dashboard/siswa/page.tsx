'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Award,
  LogOut,
  School,
  Download,
  FileCheck,
  Sparkles,
} from 'lucide-react'

interface SiswaProfile {
  namaLengkap: string
  nisn: string
  kelas: string
}

interface NilaiItem {
  id?: string
  mapel: string
  nilaiAkhir: number
  predikat: string
  nilaiTugas?: number
  nilaiUts?: number
  nilaiUas?: number
}

interface RaportInfo {
  status: string
  catatanWaliKelas?: string
  rataRataNilai: number
  semester: string
  tahunAjaran: string
}

export default function SiswaDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  const [profile, setProfile] = useState<SiswaProfile>({
    namaLengkap: 'Memuat...',
    nisn: '-',
    kelas: '-',
  })

  const [absensiSummary, setAbsensiSummary] = useState({
    HADIR: 0,
    IZIN: 0,
    SAKIT: 0,
    ALFA: 0,
  })

  const [nilais, setNilais] = useState<NilaiItem[]>([])
  const [raport, setRaport] = useState<RaportInfo | null>(null)

  useEffect(() => {
    let ignore = false

    const fetchSiswaData = async () => {
      try {
        const [resMe, resAbsensi, resNilai, resRaport] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/absensi'),
          fetch('/api/nilai'),
          fetch('/api/raport'),
        ])

        const dataMe = await resMe.json()
        const dataAbsensi = await resAbsensi.json()
        const dataNilai = await resNilai.json()
        const dataRaport = await resRaport.json()

        if (!ignore) {
          // 1. Profile
          if (dataMe.success && dataMe.data) {
            const profileData = dataMe.data.details?.siswaProfile || {}
            setProfile({
              namaLengkap: profileData.namaLengkap || dataMe.data.namaLengkap || 'Siswa',
              nisn: profileData.nisn || '-',
              kelas: profileData.kelas?.namaKelas || 'Kelas Belum Ditentukan',
            })
          }

          // 2. Raport & Attendance
          if (dataRaport.success && dataRaport.data && dataRaport.data.length > 0) {
            const r = dataRaport.data[0]
            setRaport({
              status: r.status,
              catatanWaliKelas: r.catatanWaliKelas,
              rataRataNilai: r.rataRataNilai,
              semester: r.semester,
              tahunAjaran: r.tahunAjaran,
            })
            setAbsensiSummary({
              HADIR: r.totalHadir,
              IZIN: r.totalIzin,
              SAKIT: r.totalSakit,
              ALFA: r.totalAlfa,
            })
          } else if (dataAbsensi.success && dataAbsensi.data?.summary) {
            setAbsensiSummary(dataAbsensi.data.summary)
          }

          // 3. Grades
          if (dataNilai.success && dataNilai.data && dataNilai.data.length > 0) {
            interface ApiNilai {
              id: string
              mapel?: { namaMapel: string }
              mapelId: string
              nilaiAkhir: number
              predikat: string
              nilaiTugas: number
              nilaiUts: number
              nilaiUas: number
            }
            const mapped = dataNilai.data.map((n: ApiNilai) => ({
              id: n.id,
              mapel: n.mapel?.namaMapel || n.mapelId,
              nilaiAkhir: n.nilaiAkhir,
              predikat: n.predikat,
              nilaiTugas: n.nilaiTugas,
              nilaiUts: n.nilaiUts,
              nilaiUas: n.nilaiUas,
            }))
            setNilais(mapped)
          } else {
            // Default sample view if fresh
            setNilais([
              { mapel: 'Matematika Wajib', nilaiAkhir: 88, predikat: 'A' },
              { mapel: 'Bahasa Indonesia', nilaiAkhir: 90, predikat: 'A' },
              { mapel: 'Bahasa Inggris', nilaiAkhir: 84, predikat: 'B' },
              { mapel: 'Fisika', nilaiAkhir: 82, predikat: 'B' },
            ])
          }
          setLoading(false)
        }
      } catch {
        if (!ignore) setLoading(false)
      }
    }

    fetchSiswaData()
    return () => {
      ignore = true
    }
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const totalPertemuan = absensiSummary.HADIR + absensiSummary.IZIN + absensiSummary.SAKIT + absensiSummary.ALFA
  const persentaseKehadiran =
    totalPertemuan > 0 ? Math.round((absensiSummary.HADIR / totalPertemuan) * 100) : 100

  const averageGrade =
    nilais.length > 0
      ? (nilais.reduce((sum, n) => sum + n.nilaiAkhir, 0) / nilais.length).toFixed(1)
      : '0.0'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-sm">Portal Akademik Siswa</h1>
            <p className="text-xs text-slate-500">
              {profile.namaLengkap} • {profile.kelas} (NISN: {profile.nisn})
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all border border-red-100"
        >
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 text-white p-8 rounded-3xl shadow-xl shadow-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wide">
                Semester Ganjil 2025/2026
              </span>
              <span className="px-3 py-1 bg-emerald-400/20 text-emerald-200 backdrop-blur-md rounded-full text-xs font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Akun Aktif
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Selamat Datang, {profile.namaLengkap}!
            </h2>
            <p className="text-sm text-blue-100 max-w-xl">
              Pantau rekap kehadiran kelas, riwayat nilai seluruh mata pelajaran, dan unduh Raport Digital Anda secara resmi.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 relative z-10">
            <button
              onClick={() => window.print()}
              className="px-5 py-3 bg-white text-blue-600 font-bold rounded-2xl shadow-lg hover:bg-blue-50 active:scale-95 flex items-center gap-2 text-sm transition-all"
            >
              <Download className="w-4 h-4" /> Unduh Raport Digital (PDF)
            </button>
          </div>
        </div>

        {/* Wali Kelas Catatan Alert (if available) */}
        {raport?.catatanWaliKelas && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-sm text-blue-900 shadow-xs">
            <FileCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-blue-700 block">
                Catatan Wali Kelas (Semester {raport.semester} {raport.tahunAjaran}):
              </span>
              <p className="text-sm mt-1 italic">&quot;{raport.catatanWaliKelas}&quot;</p>
            </div>
          </div>
        )}

        {/* 2 Column Section: Absensi & Nilai */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Kehadiran Summary Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-blue-600" /> Rekap Kehadiran
              </h3>
              <span className="px-2.5 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-full">
                {persentaseKehadiran}% Hadir
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100/60">
                <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider block">Hadir</span>
                <span className="text-2xl font-extrabold text-emerald-700">{absensiSummary.HADIR}</span>
                <span className="text-[10px] text-emerald-500 block">Pertemuan</span>
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100/60">
                <span className="text-xs text-blue-600 font-bold uppercase tracking-wider block">Izin</span>
                <span className="text-2xl font-extrabold text-blue-700">{absensiSummary.IZIN}</span>
                <span className="text-[10px] text-blue-500 block">Pertemuan</span>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100/60">
                <span className="text-xs text-amber-600 font-bold uppercase tracking-wider block">Sakit</span>
                <span className="text-2xl font-extrabold text-amber-700">{absensiSummary.SAKIT}</span>
                <span className="text-[10px] text-amber-500 block">Pertemuan</span>
              </div>
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100/60">
                <span className="text-xs text-rose-600 font-bold uppercase tracking-wider block">Alfa</span>
                <span className="text-2xl font-extrabold text-rose-700">{absensiSummary.ALFA}</span>
                <span className="text-[10px] text-rose-500 block">Pertemuan</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center">
              Total Sesi Kelas: <strong>{totalPertemuan}</strong> Pertemuan
            </p>
          </div>

          {/* Nilai Akademik Summary */}
          <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-amber-500" /> Nilai Mata Pelajaran
                </h3>
                <p className="text-xs text-slate-400">Nilai akhir tugas, ujian, dan praktik</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Rata-Rata Nilai</span>
                <span className="font-extrabold text-blue-600 text-lg">{averageGrade}</span>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Memuat data nilai...</div>
            ) : nilais.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Belum ada nilai yang dipublikasikan.
              </div>
            ) : (
              <div className="space-y-2.5">
                {nilais.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 text-sm transition-all"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">{item.mapel}</span>
                      <span className="text-xs text-slate-400">
                        {item.nilaiTugas !== undefined && `Tugas: ${item.nilaiTugas} • UTS: ${item.nilaiUts} • UAS: ${item.nilaiUas}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-blue-600 text-base">{item.nilaiAkhir}</span>
                      <span
                        className={`px-3 py-1 font-bold rounded-full text-xs ${
                          item.predikat === 'A'
                            ? 'bg-emerald-100 text-emerald-700'
                            : item.predikat === 'B'
                            ? 'bg-blue-100 text-blue-700'
                            : item.predikat === 'C'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        Predikat {item.predikat}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
