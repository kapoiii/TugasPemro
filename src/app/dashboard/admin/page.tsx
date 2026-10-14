'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShieldAlert,
  Users,
  School,
  BookOpen,
  ClipboardList,
  LogOut,
  UserPlus,
  RefreshCw,
  Search,
  Key,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  Activity,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'

interface UserItem {
  id: string
  username: string
  email: string
  role: 'ADMIN' | 'GURU' | 'SISWA'
  createdAt: string
  siswaProfile?: {
    nis: string
    nisn: string
    namaLengkap: string
    kelas?: { namaKelas: string }
  }
  guruProfile?: {
    nip: string
    namaLengkap: string
    mataPelajaranUtama?: string
  }
}

interface StatsData {
  users: { total: number; admin: number; guru: number; siswa: number }
  academic: { kelas: number; mapel: number; sesiAbsensi: number; nilai: number }
  ppdb: { pending: number; diterima: number; ditolak: number; total: number }
  recentLogs: Array<{
    id: string
    action: string
    detail: string
    createdAt: string
    user?: { username: string; role: string }
  }>
}

interface KelasItem {
  id: string
  namaKelas: string
  tingkat: string
  waliKelas?: { namaLengkap: string }
  _count?: { siswas: number }
}

interface MapelItem {
  id: string
  kodeMapel: string
  namaMapel: string
  kkm: number
}

interface GuruSimple {
  id: string
  namaLengkap: string
  nip: string
}

interface AuditLogItem {
  id: string
  action: string
  detail: string
  ipAddress?: string
  createdAt: string
  user?: { username: string; role: string }
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'master' | 'logs'>('overview')
  const [loading, setLoading] = useState(true)

  // Data states
  const [stats, setStats] = useState<StatsData | null>(null)
  const [users, setUsers] = useState<UserItem[]>([])
  const [kelasList, setKelasList] = useState<KelasItem[]>([])
  const [mapelList, setMapelList] = useState<MapelItem[]>([])
  const [guruList, setGuruList] = useState<GuruSimple[]>([])
  const [logs, setLogs] = useState<AuditLogItem[]>([])

  // User Filter & Search
  const [userSearch, setUserSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'GURU' | 'SISWA'>('ALL')

  // Modals
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [showAddKelasModal, setShowAddKelasModal] = useState(false)
  const [showAddMapelModal, setShowAddMapelModal] = useState(false)

  // Notification message
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Form states
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'GURU' as 'ADMIN' | 'GURU' | 'SISWA',
    namaLengkap: '',
    nip: '',
    nis: '',
    nisn: '',
    kelasId: '',
    jenisKelamin: 'L',
  })

  const [editUserForm, setEditUserForm] = useState({
    userId: '',
    username: '',
    newRole: 'GURU' as 'ADMIN' | 'GURU' | 'SISWA',
    newPassword: '',
  })

  const [kelasForm, setKelasForm] = useState({
    namaKelas: '',
    tingkat: '10',
    waliKelasId: '',
  })

  const [mapelForm, setMapelForm] = useState({
    kodeMapel: '',
    namaMapel: '',
    kkm: 75,
  })

  // Load All Data
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [resStats, resUsers, resMaster, resLogs] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/master'),
        fetch('/api/admin/logs?limit=50'),
      ])

      const dataStats = await resStats.json()
      const dataUsers = await resUsers.json()
      const dataMaster = await resMaster.json()
      const dataLogs = await resLogs.json()

      if (dataStats.success) setStats(dataStats.data)
      if (dataUsers.success) setUsers(dataUsers.data)
      if (dataMaster.success) {
        setKelasList(dataMaster.data.kelas || [])
        setMapelList(dataMaster.data.mapel || [])
        setGuruList(dataMaster.data.guru || [])
      }
      if (dataLogs.success) setLogs(dataLogs.data)
    } catch {
      setFeedback({ type: 'error', message: 'Gagal memuat data admin dashboard' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    const initData = async () => {
      try {
        const [resStats, resUsers, resMaster, resLogs] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/users'),
          fetch('/api/admin/master'),
          fetch('/api/admin/logs?limit=50'),
        ])

        const dataStats = await resStats.json()
        const dataUsers = await resUsers.json()
        const dataMaster = await resMaster.json()
        const dataLogs = await resLogs.json()

        if (!ignore) {
          if (dataStats.success) setStats(dataStats.data)
          if (dataUsers.success) setUsers(dataUsers.data)
          if (dataMaster.success) {
            setKelasList(dataMaster.data.kelas || [])
            setMapelList(dataMaster.data.mapel || [])
            setGuruList(dataMaster.data.guru || [])
          }
          if (dataLogs.success) setLogs(dataLogs.data)
          setLoading(false)
        }
      } catch {
        if (!ignore) {
          setFeedback({ type: 'error', message: 'Gagal memuat data admin dashboard' })
          setLoading(false)
        }
      }
    }
    initData()
    return () => {
      ignore = true
    }
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  // Handle Add User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: 'success', message: data.message })
        setShowAddUserModal(false)
        setUserForm({
          username: '',
          email: '',
          password: '',
          role: 'GURU',
          namaLengkap: '',
          nip: '',
          nis: '',
          nisn: '',
          kelasId: '',
          jenisKelamin: 'L',
        })
        loadData()
      } else {
        setFeedback({ type: 'error', message: data.message })
      }
    } catch {
      setFeedback({ type: 'error', message: 'Gagal menambahkan user' })
    }
  }

  // Handle Edit User
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUserForm),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: 'success', message: data.message })
        setShowEditUserModal(false)
        loadData()
      } else {
        setFeedback({ type: 'error', message: data.message })
      }
    } catch {
      setFeedback({ type: 'error', message: 'Gagal memperbarui user' })
    }
  }

  // Handle Delete User
  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus user "${username}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return
    }
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: 'success', message: data.message })
        loadData()
      } else {
        setFeedback({ type: 'error', message: data.message })
      }
    } catch {
      setFeedback({ type: 'error', message: 'Gagal menghapus user' })
    }
  }

  // Handle Add Kelas
  const handleAddKelas = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'KELAS', ...kelasForm }),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: 'success', message: data.message })
        setShowAddKelasModal(false)
        setKelasForm({ namaKelas: '', tingkat: '10', waliKelasId: '' })
        loadData()
      } else {
        setFeedback({ type: 'error', message: data.message })
      }
    } catch {
      setFeedback({ type: 'error', message: 'Gagal menambahkan kelas' })
    }
  }

  // Handle Add Mapel
  const handleAddMapel = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'MAPEL', ...mapelForm }),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: 'success', message: data.message })
        setShowAddMapelModal(false)
        setMapelForm({ kodeMapel: '', namaMapel: '', kkm: 75 })
        loadData()
      } else {
        setFeedback({ type: 'error', message: data.message })
      }
    } catch {
      setFeedback({ type: 'error', message: 'Gagal menambahkan mata pelajaran' })
    }
  }

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.siswaProfile?.namaLengkap || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.guruProfile?.namaLengkap || '').toLowerCase().includes(userSearch.toLowerCase())
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar Admin */}
      <aside className="w-full md:w-72 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-rose-600 to-red-500 rounded-2xl shadow-lg shadow-rose-600/30 text-white">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wide text-white">ADMIN ROOT</span>
                <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-400 font-mono text-[10px] font-bold rounded">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Pusat Kendali Terpadu</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Activity className="w-4 h-4" /> Ringkasan Sistem
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'users'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" /> Manajemen Akun
              </div>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs rounded-full font-mono">
                {users.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('master')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'master'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <School className="w-4 h-4" /> Master Akademik
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'logs'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ClipboardList className="w-4 h-4" /> Audit Log & Keamanan
            </button>
          </nav>

          {/* Cross-Portal Switcher */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2">
              Supervisi Portal
            </p>
            <Link
              href="/dashboard/guru"
              className="flex items-center justify-between px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-medium transition-all group"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" /> Buka Portal Guru
              </span>
              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400" />
            </Link>
            <Link
              href="/dashboard/siswa"
              className="flex items-center justify-between px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-medium transition-all group"
            >
              <span className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-green-400" /> Buka Portal Siswa
              </span>
              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-green-400" />
            </Link>
          </div>
        </div>

        {/* User Session & Logout */}
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <div className="px-2">
            <span className="text-[11px] text-slate-500 block">Sesi Login Aktif</span>
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Role: SUPERADMIN
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 font-semibold text-xs transition-all"
          >
            <LogOut className="w-4 h-4" /> Keluar dari Admin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {activeTab === 'overview' && 'Ringkasan Sistem & Infrastruktur'}
              {activeTab === 'users' && 'Manajemen Akun & Hak Akses (RBAC)'}
              {activeTab === 'master' && 'Master Data Kelas & Mata Pelajaran'}
              {activeTab === 'logs' && 'Audit Trail & Rekam Jejak Keamanan'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Pusat konfigurasi akun, hak akses role, data master akademik, dan audit log Vercel.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-400' : ''}`} />
              Segarkan
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between text-sm transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedback.type === 'success' ? (
                <CheckCircle className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs font-bold underline ml-4 hover:opacity-80"
            >
              Tutup
            </button>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Stat Cards 4 Column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Akun Pengguna</span>
                  <Users className="w-5 h-5 text-rose-500" />
                </div>
                <div className="text-3xl font-extrabold text-white">{stats.users.total}</div>
                <div className="text-xs text-slate-400 flex items-center gap-2 pt-1">
                  <span className="text-rose-400 font-semibold">{stats.users.admin} Admin</span> •{' '}
                  <span className="text-blue-400 font-semibold">{stats.users.guru} Guru</span> •{' '}
                  <span className="text-emerald-400 font-semibold">{stats.users.siswa} Siswa</span>
                </div>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Kelas & Mapel</span>
                  <School className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-3xl font-extrabold text-white">{stats.academic.kelas} Kelas</div>
                <p className="text-xs text-slate-400">
                  Mengelola <strong className="text-slate-200">{stats.academic.mapel} mata pelajaran</strong> kurikulum
                </p>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Pendaftar PPDB</span>
                  <UserPlus className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-3xl font-extrabold text-amber-400">{stats.ppdb.pending} Pending</div>
                <p className="text-xs text-slate-400">
                  Dari total {stats.ppdb.total} calon siswa mendaftar
                </p>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Sesi Absensi & Nilai</span>
                  <ClipboardList className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-3xl font-extrabold text-emerald-400">{stats.academic.sesiAbsensi} Sesi</div>
                <p className="text-xs text-slate-400">
                  Total <strong className="text-slate-200">{stats.academic.nilai} entri nilai</strong> tersimpan
                </p>
              </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="font-bold text-white text-base">Tindakan Cepat Administrator</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setActiveTab('users')
                      setShowAddUserModal(true)
                    }}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-900 hover:bg-slate-850 hover:border-rose-500 border border-slate-800 rounded-xl text-sm font-semibold transition-all group"
                  >
                    <span className="flex items-center gap-3">
                      <UserPlus className="w-4 h-4 text-rose-500" /> Tambah Akun Baru
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('master')
                      setShowAddKelasModal(true)
                    }}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-900 hover:bg-slate-850 hover:border-blue-500 border border-slate-800 rounded-xl text-sm font-semibold transition-all group"
                  >
                    <span className="flex items-center gap-3">
                      <School className="w-4 h-4 text-blue-500" /> Tambah Kelas Baru
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('master')
                      setShowAddMapelModal(true)
                    }}
                    className="w-full flex items-center justify-between p-3.5 bg-slate-900 hover:bg-slate-850 hover:border-emerald-500 border border-slate-800 rounded-xl text-sm font-semibold transition-all group"
                  >
                    <span className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-emerald-500" /> Tambah Mata Pelajaran
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Recent Audit Logs Mini */}
              <div className="lg:col-span-2 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-base">Aktivitas Terakhir Sistem</h3>
                  <button
                    onClick={() => setActiveTab('logs')}
                    className="text-xs font-semibold text-rose-400 hover:underline"
                  >
                    Lihat Semua Log
                  </button>
                </div>

                <div className="space-y-3">
                  {stats.recentLogs.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">Belum ada aktivitas tercatat.</p>
                  ) : (
                    stats.recentLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start justify-between p-3 bg-slate-900 rounded-xl text-xs border border-slate-850"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 font-mono font-bold rounded">
                              {log.action}
                            </span>
                            <span className="text-slate-400">
                              Oleh: <strong className="text-slate-200">{log.user?.username || 'Sistem'}</strong> (
                              {log.user?.role || 'AUTO'})
                            </span>
                          </div>
                          <p className="text-slate-300">{log.detail}</p>
                        </div>
                        <span className="text-[11px] text-slate-500 whitespace-nowrap ml-3">
                          {new Date(log.createdAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAJEMEN AKUN & USER */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari Username, Email, Nama..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500 w-64"
                  />
                </div>

                {/* Role Filter */}
                <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs">
                  {(['ALL', 'ADMIN', 'GURU', 'SISWA'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        roleFilter === r ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30 flex items-center gap-2 text-xs transition-all"
              >
                <UserPlus className="w-4 h-4" /> Tambah Pengguna Baru
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Pengguna</th>
                      <th className="py-3 px-4">Role Akses</th>
                      <th className="py-3 px-4">Nama Lengkap & Profil</th>
                      <th className="py-3 px-4">Tanggal Dibuat</th>
                      <th className="py-3 px-4 text-right">Kelola</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-500">
                          Tidak ada pengguna ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-900/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-white text-sm">{u.username}</div>
                            <div className="text-slate-400 text-[11px]">{u.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-lg font-mono font-bold text-[10px] ${
                                u.role === 'ADMIN'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : u.role === 'GURU'
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {u.role === 'SISWA' && u.siswaProfile && (
                              <div>
                                <span className="font-semibold text-white">{u.siswaProfile.namaLengkap}</span>
                                <span className="block text-[11px] text-slate-400">
                                  NIS: {u.siswaProfile.nis} | Kelas: {u.siswaProfile.kelas?.namaKelas || '-'}
                                </span>
                              </div>
                            )}
                            {u.role === 'GURU' && u.guruProfile && (
                              <div>
                                <span className="font-semibold text-white">{u.guruProfile.namaLengkap}</span>
                                <span className="block text-[11px] text-slate-400">
                                  NIP: {u.guruProfile.nip}
                                </span>
                              </div>
                            )}
                            {u.role === 'ADMIN' && (
                              <span className="text-slate-400 italic">Akun Administrator Sistem</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            {new Date(u.createdAt).toLocaleDateString('id-ID')}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditUserForm({
                                    userId: u.id,
                                    username: u.username,
                                    newRole: u.role,
                                    newPassword: '',
                                  })
                                  setShowEditUserModal(true)
                                }}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg flex items-center gap-1.5 transition-all text-xs"
                              >
                                <Key className="w-3.5 h-3.5 text-amber-400" /> Edit / Reset
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id, u.username)}
                                className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                                title="Hapus User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MASTER AKADEMIK */}
        {activeTab === 'master' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Kelas Master */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold text-white text-base">Daftar Kelas</h3>
                  <p className="text-xs text-slate-400">Tingkat dan penugasan wali kelas</p>
                </div>
                <button
                  onClick={() => setShowAddKelasModal(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Kelas
                </button>
              </div>

              <div className="space-y-2.5 max-h-96 overflow-y-auto">
                {kelasList.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">Belum ada data kelas.</p>
                ) : (
                  kelasList.map((k) => (
                    <div
                      key={k.id}
                      className="p-3.5 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white text-sm">{k.namaKelas}</div>
                        <div className="text-slate-400 mt-0.5">
                          Tingkat: {k.tingkat} • Wali: {k.waliKelas?.namaLengkap || 'Belum ditugaskan'}
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 font-mono rounded-lg">
                        {k._count?.siswas || 0} Siswa
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Mapel Master */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold text-white text-base">Mata Pelajaran</h3>
                  <p className="text-xs text-slate-400">Kode mata pelajaran dan Kriteria Ketuntasan Minimal (KKM)</p>
                </div>
                <button
                  onClick={() => setShowAddMapelModal(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Mapel
                </button>
              </div>

              <div className="space-y-2.5 max-h-96 overflow-y-auto">
                {mapelList.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">Belum ada data mata pelajaran.</p>
                ) : (
                  mapelList.map((m) => (
                    <div
                      key={m.id}
                      className="p-3.5 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white text-sm">{m.namaMapel}</div>
                        <div className="text-slate-400 font-mono mt-0.5">Kode: {m.kodeMapel}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase">KKM</span>
                        <span className="font-bold text-emerald-400 text-sm font-mono">{m.kkm}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold text-white text-base">Rekam Jejak Aktivitas & Audit Keamanan</h3>
                  <p className="text-xs text-slate-400">
                    Mencatat login, perubahan nilai, pembuatan user, dan verifikasi PPDB
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-mono">Menampilkan {logs.length} catatan</span>
              </div>

              <div className="divide-y divide-slate-850 max-h-[600px] overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-xs text-slate-500 py-12 text-center">Belum ada audit log.</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="py-3 flex items-start justify-between text-xs gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 font-mono font-bold rounded">
                            {log.action}
                          </span>
                          <span className="text-slate-400">
                            User: <strong className="text-white">{log.user?.username || 'System'}</strong> (
                            {log.user?.role || 'AUTO'})
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm">{log.detail}</p>
                      </div>
                      <div className="text-right whitespace-nowrap text-slate-500 text-[11px]">
                        <div>{new Date(log.createdAt).toLocaleDateString('id-ID')}</div>
                        <div>{new Date(log.createdAt).toLocaleTimeString('id-ID')}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: TAMBAH USER BARU */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-rose-500" /> Tambah Pengguna Baru
            </h2>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Peran Akses (Role)</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ADMIN', 'GURU', 'SISWA'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setUserForm({ ...userForm, role: r })}
                      className={`py-2 rounded-xl font-bold border transition-all ${
                        userForm.role === r
                          ? 'bg-rose-600 border-rose-500 text-white'
                          : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="misal: ahmad_fauzi"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="user@sekolah.sch.id"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Password Awal</label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap pengguna"
                  value={userForm.namaLengkap}
                  onChange={(e) => setUserForm({ ...userForm, namaLengkap: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              {/* Conditional Guru / Siswa fields */}
              {userForm.role === 'GURU' && (
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">NIP (Nomor Induk Pegawai)</label>
                  <input
                    type="text"
                    placeholder="198501012010011001"
                    value={userForm.nip}
                    onChange={(e) => setUserForm({ ...userForm, nip: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              )}

              {userForm.role === 'SISWA' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">NIS / NISN</label>
                    <input
                      type="text"
                      placeholder="NIS"
                      value={userForm.nis}
                      onChange={(e) => setUserForm({ ...userForm, nis: e.target.value, nisn: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Kelas</label>
                    <select
                      value={userForm.kelasId}
                      onChange={(e) => setUserForm({ ...userForm, kelasId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    >
                      <option value="">Pilih Kelas...</option>
                      {kelasList.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.namaKelas}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 border border-slate-800 rounded-xl text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / RESET USER */}
      {showEditUserModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" /> Edit User: {editUserForm.username}
            </h2>

            <form onSubmit={handleEditUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Ubah Role</label>
                <select
                  value={editUserForm.newRole}
                  onChange={(e) =>
                    setEditUserForm({
                      ...editUserForm,
                      newRole: e.target.value as 'ADMIN' | 'GURU' | 'SISWA',
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="GURU">GURU</option>
                  <option value="SISWA">SISWA</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Reset Password Baru (Kosongkan jika tidak diubah)
                </label>
                <input
                  type="password"
                  placeholder="Password baru min 6 karakter"
                  value={editUserForm.newPassword}
                  onChange={(e) => setEditUserForm({ ...editUserForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="px-4 py-2 border border-slate-800 rounded-xl text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-600/30"
                >
                  Terapkan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH KELAS */}
      {showAddKelasModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <School className="w-5 h-5 text-blue-500" /> Tambah Kelas Baru
            </h2>

            <form onSubmit={handleAddKelas} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nama Kelas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: X IPA 1, XI IPS 2"
                  value={kelasForm.namaKelas}
                  onChange={(e) => setKelasForm({ ...kelasForm, namaKelas: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Tingkat</label>
                <select
                  value={kelasForm.tingkat}
                  onChange={(e) => setKelasForm({ ...kelasForm, tingkat: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="10">Kelas 10</option>
                  <option value="11">Kelas 11</option>
                  <option value="12">Kelas 12</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Wali Kelas (Opsional)</label>
                <select
                  value={kelasForm.waliKelasId}
                  onChange={(e) => setKelasForm({ ...kelasForm, waliKelasId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Pilih Wali Kelas...</option>
                  {guruList.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.namaLengkap} (NIP: {g.nip})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddKelasModal(false)}
                  className="px-4 py-2 border border-slate-800 rounded-xl text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30"
                >
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH MAPEL */}
      {showAddMapelModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-500" /> Tambah Mata Pelajaran
            </h2>

            <form onSubmit={handleAddMapel} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Kode Mapel</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: MTK-10, BIN-10"
                  value={mapelForm.kodeMapel}
                  onChange={(e) => setMapelForm({ ...mapelForm, kodeMapel: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nama Mata Pelajaran</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Matematika Wajib"
                  value={mapelForm.namaMapel}
                  onChange={(e) => setMapelForm({ ...mapelForm, namaMapel: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">KKM (Kriteria Ketuntasan Minimal)</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={100}
                  value={mapelForm.kkm}
                  onChange={(e) => setMapelForm({ ...mapelForm, kkm: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddMapelModal(false)}
                  className="px-4 py-2 border border-slate-800 rounded-xl text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30"
                >
                  Simpan Mapel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
