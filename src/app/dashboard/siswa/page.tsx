'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Award,
  LogOut,
  School,
  Download,
} from 'lucide-react'

interface SiswaProfile {
  namaLengkap: string
  nisn: string
  kelas: string
}

interface NilaiItem {
  mapel: string
  nilaiAkhir: number
  predikat: string
}

export default function SiswaDashboardPage() {
  const router = useRouter()
  const [profile] = useState<SiswaProfile>({
    namaLengkap: 'Ahmad Fauzi',
    nisn: '0051234567',
    kelas: 'X MIPA 1',
  })

  const [absensiSummary] = useState({
    HADIR: 18,
    IZIN: 1,
    SAKIT: 1,
    ALFA: 0,
  })

  const [nilais] = useState<NilaiItem[]>([
    { mapel: 'Matematika', nilaiAkhir: 88, predikat: 'A' },
    { mapel: 'Bahasa Indonesia', nilaiAkhir: 92, predikat: 'A' },
    { mapel: 'Fisika', nilaiAkhir: 84, predikat: 'B' },
    { mapel: 'Kimia', nilaiAkhir: 80, predikat: 'B' },
  ])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-xl">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-sm">Portal Akademik Siswa</h1>
            <p className="text-xs text-slate-500">{profile.namaLengkap} ({profile.kelas})</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 rounded-2xl shadow-xl shadow-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold">
              Semester Ganjil 2025/2026
            </span>
            <h2 className="text-2xl font-bold">Selamat Datang, {profile.namaLengkap}!</h2>
            <p className="text-sm text-blue-100">
              Pantau rekap kehadiran, nilai akademik, dan unduh Raport Digital Anda kapan saja.
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="px-5 py-3 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:bg-blue-50 flex items-center gap-2 text-sm shrink-0 transition-all"
          >
            <Download className="w-4 h-4" /> Unduh Raport Digital
          </button>
        </div>

        {/* 2 Column Section: Absensi & Nilai */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Kehadiran Summary Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-blue-600" /> Rekap Kehadiran
              </h3>
              <span className="text-xs text-green-600 font-bold">95% Kehadiran</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="bg-green-50 p-3 rounded-xl">
                <span className="text-xs text-green-600 font-semibold block">Hadir</span>
                <span className="text-2xl font-bold text-green-700">{absensiSummary.HADIR}</span>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl">
                <span className="text-xs text-blue-600 font-semibold block">Izin</span>
                <span className="text-2xl font-bold text-blue-700">{absensiSummary.IZIN}</span>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl">
                <span className="text-xs text-amber-600 font-semibold block">Sakit</span>
                <span className="text-2xl font-bold text-amber-700">{absensiSummary.SAKIT}</span>
              </div>
              <div className="bg-red-50 p-3 rounded-xl">
                <span className="text-xs text-red-600 font-semibold block">Alfa</span>
                <span className="text-2xl font-bold text-red-700">{absensiSummary.ALFA}</span>
              </div>
            </div>
          </div>

          {/* Nilai Akademik Summary */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <Award className="w-4 h-4 text-amber-500" /> Nilai Mata Pelajaran Terbaru
              </h3>
              <span className="text-xs text-slate-400">Rata-Rata: 86.0</span>
            </div>

            <div className="space-y-3">
              {nilais.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-sm">
                  <span className="font-semibold text-slate-800">{item.mapel}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-blue-600">{item.nilaiAkhir}</span>
                    <span className="px-2.5 py-0.5 bg-green-100 text-green-700 font-bold rounded-full text-xs">
                      {item.predikat}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
