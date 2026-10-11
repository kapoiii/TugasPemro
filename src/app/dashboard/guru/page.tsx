'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  CheckCircle,
  FileText,
  TrendingUp,
  AlertTriangle,
  Calendar,
  LogOut,
  ChevronRight,
  School,
  ClipboardList,
  Award,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function GuruDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalPendaftarPPDB: 12,
    pendingPPDB: 4,
    totalSiswaAktif: 120,
    rataRataNilaiSekolah: 82.4,
    persentaseKehadiran: 94.5,
  })

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-6 shrink-0 hidden md:flex">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <School className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-wide">PORTAL GURU</h2>
              <p className="text-xs text-slate-400">Admin & Akademik</p>
            </div>
          </div>

          <nav className="space-y-2">
            <Link
              href="/dashboard/guru"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-lg shadow-blue-600/30"
            >
              <TrendingUp className="w-4 h-4" /> Dashboard Monitoring
            </Link>
            <Link
              href="/dashboard/guru/ppdb"
              className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium transition-all"
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" /> Seleksi PPDB
              </div>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full">
                {stats.pendingPPDB}
              </span>
            </Link>
            <Link
              href="/dashboard/guru/absensi"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium transition-all"
            >
              <Calendar className="w-4 h-4" /> Modul Absensi
            </Link>
            <Link
              href="/dashboard/guru/nilai"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium transition-all"
            >
              <ClipboardList className="w-4 h-4" /> Input & Bobot Nilai
            </Link>
            <Link
              href="/dashboard/guru/raport"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium transition-all"
            >
              <Award className="w-4 h-4" /> Raport Digital
            </Link>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 font-semibold text-sm transition-all"
        >
          <LogOut className="w-4 h-4" /> Keluar (Logout)
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard Monitoring Sekolah</h1>
            <p className="text-sm text-slate-500">Ringkasan statistik akademik, PPDB, absensi, dan performa siswa</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-full">
              Sistem Aktif (Production)
            </span>
          </div>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase">Pending PPDB</span>
              <Users className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-800">{stats.pendingPPDB}</div>
            <p className="text-xs text-slate-500">Dari total {stats.totalPendaftarPPDB} pendaftar</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase">Total Siswa Aktif</span>
              <School className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-800">{stats.totalSiswaAktif}</div>
            <p className="text-xs text-slate-500">Terdaftar dalam 6 kelas</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase">Kehadiran Rata-Rata</span>
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-800">{stats.persentaseKehadiran}%</div>
            <p className="text-xs text-green-600 font-semibold">+1.2% bulan ini</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase">Rata-Rata Nilai</span>
              <Award className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-800">{stats.rataRataNilaiSekolah}</div>
            <p className="text-xs text-slate-500">Skala 0 - 100 (Predikat B+)</p>
          </div>
        </div>

        {/* Quick Moduls Access Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Akses Cepat Modul Utama</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/dashboard/guru/ppdb"
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 flex items-center justify-between">
                Verifikasi PPDB <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 mt-1">Verifikasi berkas dan persetujuan calon siswa baru</p>
            </Link>

            <Link
              href="/dashboard/guru/absensi"
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 flex items-center justify-between">
                Modul Absensi <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 mt-1">Buat sesi absensi dan rekap kehadiran harian/bulanan</p>
            </Link>

            <Link
              href="/dashboard/guru/nilai"
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ClipboardList className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 flex items-center justify-between">
                Penilaian Akademik <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 mt-1">Input nilai Tugas, UTS, UAS, Praktik, dan Sikap</p>
            </Link>

            <Link
              href="/dashboard/guru/raport"
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 flex items-center justify-between">
                Raport Digital <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-500 mt-1">Generate PDF raport digital dan cetak massal per kelas</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
