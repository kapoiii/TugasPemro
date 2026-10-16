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
  LayoutDashboard,
  Save,
  Award,
  Calendar,
  Sparkles,
  Globe,
  Clock,
  Lock,
  Unlock,
} from 'lucide-react'
import WebsiteContentManager from '@/components/admin/WebsiteContentManager'

interface UserItem {
  id: string
  username: string
  email: string
  role: 'ADMIN' | 'GURU' | 'SISWA'
  createdAt: string
  siswaProfile?: {
    id: string
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
  mapel?: { namaMapel: string }
  guru?: { namaLengkap: string }
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
  createdAt: string
  user?: { username: string; role: string }
}

interface SiswaSelectorItem {
  id: string
  namaLengkap: string
  nis: string
  nisn: string
  kelas?: { namaKelas: string }
}

interface GradeEditorItem {
  mapelId: string
  mapelName: string
  nilaiTugas: number
  nilaiUts: number
  nilaiUas: number
  nilaiPraktik: number
  nilaiSikap: number
  nilaiAkhir: number
  predikat: string
  catatan?: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'website-content' | 'users' | 'user-dashboard' | 'master' | 'logs'>('overview')
  const [loading, setLoading] = useState(true)

  // Data states
  const [stats, setStats] = useState<StatsData | null>(null)
  const [users, setUsers] = useState<UserItem[]>([])
  const [kelasList, setKelasList] = useState<KelasItem[]>([])
  const [mapelList, setMapelList] = useState<MapelItem[]>([])
  const [jadwalList, setJadwalList] = useState<JadwalItem[]>([])
  const [guruList, setGuruList] = useState<GuruSimple[]>([])
  const [logs, setLogs] = useState<AuditLogItem[]>([])
  const [settings, setSettings] = useState({
    pembagianRaportDibuka: false,
    tanggalPembagianRaport: '2026-12-15',
  })

  // User Filter & Search
  const [userSearch, setUserSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'GURU' | 'SISWA'>('ALL')

  // Modals
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [showAddKelasModal, setShowAddKelasModal] = useState(false)
  const [showAddMapelModal, setShowAddMapelModal] = useState(false)
  const [showAddJadwalModal, setShowAddJadwalModal] = useState(false)

  // Feedback Notification
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Siswa Dashboard Manager States
  const [allSiswaList, setAllSiswaList] = useState<SiswaSelectorItem[]>([])
  const [selectedSiswaId, setSelectedSiswaId] = useState<string>('')
  const [siswaDetailLoading, setSiswaDetailLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  const [editorProfile, setEditorProfile] = useState({
    namaLengkap: '',
    nisn: '',
    nis: '',
    kelasId: '',
    alamat: '',
    noHp: '',
  })

  const [editorAttendance, setEditorAttendance] = useState({
    HADIR: 18,
    IZIN: 1,
    SAKIT: 1,
    ALFA: 0,
  })

  const [editorGrades, setEditorGrades] = useState<GradeEditorItem[]>([])
  const [editorRaport, setEditorRaport] = useState({
    catatanWaliKelas: 'Pertahankan prestasi belajar dan tingkatkan keaktifan di kelas.',
    status: 'PUBLISHED',
  })

  const [newMapelSelection, setNewMapelSelection] = useState('')

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

  const [jadwalForm, setJadwalForm] = useState({
    hari: 'Senin',
    jamMulai: '07:30',
    jamSelesai: '09:00',
    kelasId: 'kelas-10-mipa1',
    mapelId: 'mapel-mtk',
    guruId: 'guru-profile-01',
    ruangan: 'Ruang 101',
  })

  // Fetch Siswa Dashboard Details
  const fetchSiswaDashboardData = useCallback(async (siswaId: string) => {
    if (!siswaId) return
    setSiswaDetailLoading(true)
    try {
      const res = await fetch(`/api/admin/siswa-dashboard?siswaId=${siswaId}`)
      const json = await res.json()
      if (json.success && json.data) {
        const { siswa, attendanceSummary, nilais, raport } = json.data

        setEditorProfile({
          namaLengkap: siswa.namaLengkap || '',
          nisn: siswa.nisn || '',
          nis: siswa.nis || '',
          kelasId: siswa.kelasId || '',
          alamat: siswa.alamat || '',
          noHp: siswa.noHp || '',
        })

        if (attendanceSummary) {
          setEditorAttendance({
            HADIR: Number(attendanceSummary.HADIR || 0),
            IZIN: Number(attendanceSummary.IZIN || 0),
            SAKIT: Number(attendanceSummary.SAKIT || 0),
            ALFA: Number(attendanceSummary.ALFA || 0),
          })
        }

        if (nilais && Array.isArray(nilais)) {
          interface RawNilai {
            mapelId: string
            mapel?: { namaMapel: string }
            nilaiTugas: number
            nilaiUts: number
            nilaiUas: number
            nilaiPraktik: number
            nilaiSikap: number
            nilaiAkhir: number
            predikat: string
            catatan?: string
          }
          const mappedGrades: GradeEditorItem[] = nilais.map((n: RawNilai) => ({
            mapelId: n.mapelId,
            mapelName: n.mapel?.namaMapel || n.mapelId,
            nilaiTugas: n.nilaiTugas,
            nilaiUts: n.nilaiUas,
            nilaiUas: n.nilaiUas,
            nilaiPraktik: n.nilaiPraktik,
            nilaiSikap: n.nilaiSikap,
            nilaiAkhir: n.nilaiAkhir,
            predikat: n.predikat,
            catatan: n.catatan || '',
          }))
          setEditorGrades(mappedGrades)
        } else {
          setEditorGrades([])
        }

        if (raport) {
          setEditorRaport({
            catatanWaliKelas: raport.catatanWaliKelas || 'Pertahankan prestasi belajar.',
            status: raport.status || 'PUBLISHED',
          })
        }
      }
    } catch {
      setFeedback({ type: 'error', message: 'Gagal memuat detail dashboard siswa' })
    } finally {
      setSiswaDetailLoading(false)
    }
  }, [])

  // Load All Data
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [resStats, resUsers, resMaster, resLogs, resAllSiswa, resJadwal] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/master'),
        fetch('/api/admin/logs?limit=50'),
        fetch('/api/admin/siswa-dashboard'),
        fetch('/api/jadwal'),
      ])

      const dataStats = await resStats.json()
      const dataUsers = await resUsers.json()
      const dataMaster = await resMaster.json()
      const dataLogs = await resLogs.json()
      const dataAllSiswa = await resAllSiswa.json()
      const dataJadwal = await resJadwal.json()

      if (dataStats.success) setStats(dataStats.data)
      if (dataUsers.success) setUsers(dataUsers.data)
      if (dataMaster.success) {
        setKelasList(dataMaster.data.kelas || [])
        setMapelList(dataMaster.data.mapel || [])
        setGuruList(dataMaster.data.guru || [])
        if (dataMaster.data.settings) {
          setSettings(dataMaster.data.settings)
        }
      }
      if (dataJadwal.success && Array.isArray(dataJadwal.data)) {
        setJadwalList(dataJadwal.data)
      }
      if (dataLogs.success) setLogs(dataLogs.data)
      if (dataAllSiswa.success && Array.isArray(dataAllSiswa.data)) {
        setAllSiswaList(dataAllSiswa.data)
        if (!selectedSiswaId && dataAllSiswa.data.length > 0) {
          setSelectedSiswaId(dataAllSiswa.data[0].id)
          fetchSiswaDashboardData(dataAllSiswa.data[0].id)
        }
      }
    } catch {
      setFeedback({ type: 'error', message: 'Gagal memuat data admin dashboard' })
    } finally {
      setLoading(false)
    }
  }, [selectedSiswaId, fetchSiswaDashboardData])

  useEffect(() => {
    loadData()
  }, [loadData])

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
    if (!confirm(`Hapus akun "${username}"? Tindakan ini tidak dapat dibatalkan.`)) return
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

  // Handle Add Jadwal
  const handleAddJadwal = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'JADWAL', ...jadwalForm }),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: 'success', message: 'Jadwal pelajaran berhasil ditambahkan' })
        setShowAddJadwalModal(false)
        loadData()
      } else {
        setFeedback({ type: 'error', message: data.message })
      }
    } catch {
      setFeedback({ type: 'error', message: 'Gagal menambahkan jadwal' })
    }
  }

  // Handle Delete Jadwal
  const handleDeleteJadwal = async (id: string) => {
    if (!confirm('Hapus jadwal pelajaran ini?')) return
    try {
      const res = await fetch(`/api/jadwal?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: 'success', message: 'Jadwal berhasil dihapus' })
        loadData()
      }
    } catch {
      setFeedback({ type: 'error', message: 'Gagal menghapus jadwal' })
    }
  }

  // Toggle Pembagian Raport (Buka / Tutup Pembagian Raport)
  const handleTogglePembagianRaport = async () => {
    const nextStatus = !settings.pembagianRaportDibuka
    try {
      const res = await fetch('/api/admin/master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'SETTINGS',
          pembagianRaportDibuka: nextStatus,
          tanggalPembagianRaport: settings.tanggalPembagianRaport,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSettings((prev) => ({ ...prev, pembagianRaportDibuka: nextStatus }))
        setFeedback({
          type: 'success',
          message: nextStatus
            ? 'Pembagian Raport DIBUKA! Siswa sekarang dapat melihat hasil raport.'
            : 'Pembagian Raport DIKUNCI! Hasil raport disembunyikan dari siswa hingga hari pembagian.',
        })
      }
    } catch {
      setFeedback({ type: 'error', message: 'Gagal memperbarui status pembagian raport' })
    }
  }

  // Grade Change in Editor
  const handleGradeChange = (
    index: number,
    field: 'nilaiTugas' | 'nilaiUts' | 'nilaiUas' | 'nilaiPraktik' | 'nilaiSikap',
    val: number
  ) => {
    const updated = [...editorGrades]
    updated[index][field] = Number(val)

    const t = updated[index].nilaiTugas || 0
    const uts = updated[index].nilaiUts || 0
    const uas = updated[index].nilaiUas || 0
    const prk = updated[index].nilaiPraktik || 0
    const skp = updated[index].nilaiSikap || 0

    const finalScore = Number((t * 0.2 + uts * 0.25 + uas * 0.3 + prk * 0.15 + skp * 0.1).toFixed(2))
    updated[index].nilaiAkhir = finalScore

    let predikat = 'D'
    if (finalScore >= 88) predikat = 'A'
    else if (finalScore >= 78) predikat = 'B'
    else if (finalScore >= 68) predikat = 'C'
    updated[index].predikat = predikat

    setEditorGrades(updated)
  }

  // Add new subject grade to this student
  const handleAddNewMapelGrade = () => {
    if (!newMapelSelection) return
    const mapel = mapelList.find((m) => m.id === newMapelSelection)
    if (!mapel) return

    const exists = editorGrades.some((g) => g.mapelId === mapel.id)
    if (exists) {
      alert('Mata pelajaran ini sudah ada dalam daftar nilai.')
      return
    }

    setEditorGrades([
      ...editorGrades,
      {
        mapelId: mapel.id,
        mapelName: mapel.namaMapel,
        nilaiTugas: 85,
        nilaiUts: 80,
        nilaiUas: 85,
        nilaiPraktik: 85,
        nilaiSikap: 90,
        nilaiAkhir: 84.5,
        predikat: 'B',
      },
    ])
    setNewMapelSelection('')
  }

  // Remove subject grade
  const handleRemoveGrade = (index: number) => {
    const updated = editorGrades.filter((_, i) => i !== index)
    setEditorGrades(updated)
  }

  // Save Siswa Dashboard Changes
  const handleSaveSiswaDashboard = async () => {
    if (!selectedSiswaId) {
      alert('Pilih siswa terlebih dahulu.')
      return
    }

    setSaveLoading(true)
    try {
      const payload = {
        siswaId: selectedSiswaId,
        namaLengkap: editorProfile.namaLengkap,
        nisn: editorProfile.nisn,
        nis: editorProfile.nis,
        kelasId: editorProfile.kelasId,
        alamat: editorProfile.alamat,
        noHp: editorProfile.noHp,
        attendance: editorAttendance,
        grades: editorGrades,
        catatanWaliKelas: editorRaport.catatanWaliKelas,
        raportStatus: editorRaport.status,
      }

      const res = await fetch('/api/admin/siswa-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: 'success', message: data.message })
        loadData()
      } else {
        setFeedback({ type: 'error', message: data.message })
      }
    } catch {
      setFeedback({ type: 'error', message: 'Gagal menyimpan perubahan dashboard siswa' })
    } finally {
      setSaveLoading(false)
    }
  }

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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans">
      {/* Sidebar Admin - Clean White Theme */}
      <aside className="w-full md:w-68 bg-white border-r border-slate-200 p-6 flex flex-col justify-between shrink-0 shadow-xs">
        <div className="space-y-6">
          {/* Logo & School Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wide text-slate-800">ADMIN SEKOLAH</span>
              </div>
              <p className="text-xs text-slate-400">Pusat Kendali Sistem</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Activity className="w-4 h-4" /> Ringkasan Sistem
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" /> Manajemen Akun
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'users' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {users.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('master')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'master'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <School className="w-4 h-4" /> Master Akademik & Jadwal
            </button>

            <button
              onClick={() => setActiveTab('user-dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'user-dashboard'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" /> Editor Dashboard Siswa
              </div>
              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                Live
              </span>
            </button>

            <button
              onClick={() => setActiveTab('website-content')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'website-content'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4" /> Konten & Foto Website
              </div>
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
                CMS
              </span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'logs'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-4 h-4" /> Audit Log
            </button>
          </nav>

          {/* Quick Cross-Portal Links */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
              Supervisi Portal
            </p>
            <Link
              href="/dashboard/guru"
              className="flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-medium transition-all border border-slate-200/80"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Buka Portal Guru
              </span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
            <Link
              href="/dashboard/siswa"
              className="flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl text-xs font-medium transition-all border border-slate-200/80"
            >
              <span className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-emerald-600" /> Buka Portal Siswa
              </span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-rose-100 mt-6"
        >
          <LogOut className="w-4 h-4" /> Keluar (Logout)
        </button>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
        {/* Notification Feedback */}
        {feedback && (
          <div
            className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 border shadow-xs ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Pusat Informasi & Statistik Sekolah</h2>
                <p className="text-xs text-slate-500 mt-0.5">Ringkasan seluruh data pengguna, master akademik, dan sistem</p>
              </div>
              <button
                onClick={loadData}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Segarkan Data
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase">Total Pengguna</span>
                <div className="text-3xl font-extrabold text-blue-600">{users.length}</div>
                <p className="text-xs text-slate-500">
                  {users.filter(u => u.role === 'GURU').length} Guru • {users.filter(u => u.role === 'SISWA').length} Siswa
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase">Total Kelas</span>
                <div className="text-3xl font-extrabold text-emerald-600">{kelasList.length}</div>
                <p className="text-xs text-slate-500">Tingkat 10, 11, 12</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase">Mata Pelajaran</span>
                <div className="text-3xl font-extrabold text-purple-600">{mapelList.length}</div>
                <p className="text-xs text-slate-500">Kurikulum Merdeka</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase">Status Raport Siswa</span>
                <div className="text-sm font-extrabold text-slate-800 flex items-center gap-2 mt-2">
                  {settings.pembagianRaportDibuka ? (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg flex items-center gap-1 font-bold text-xs">
                      <Unlock className="w-3.5 h-3.5" /> DIBUKA
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg flex items-center gap-1 font-bold text-xs">
                      <Lock className="w-3.5 h-3.5" /> DIKUNCI (Draft)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">Tgl: {settings.tanggalPembagianRaport}</p>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Aksi Cepat Administrator</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="p-4 bg-blue-50/60 hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-200 text-left font-bold text-xs flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Terbitkan Akun Baru
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShowAddKelasModal(true)}
                  className="p-4 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 text-left font-bold text-xs flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Tambah Kelas Baru
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleTogglePembagianRaport}
                  className={`p-4 rounded-xl border text-left font-bold text-xs flex items-center justify-between transition-colors ${
                    settings.pembagianRaportDibuka
                      ? 'bg-amber-50/60 hover:bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-emerald-50/60 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {settings.pembagianRaportDibuka ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    {settings.pembagianRaportDibuka ? 'Kunci Pembagian Raport' : 'Buka Pembagian Raport'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAJEMEN AKUN & PENGGUNA */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari user, email, nama..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-60"
                  />
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl text-xs">
                  {(['ALL', 'ADMIN', 'GURU', 'SISWA'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        roleFilter === r ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs text-xs flex items-center gap-2 transition-all"
              >
                <UserPlus className="w-4 h-4" /> + Terbitkan Akun Baru
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Akun (Username & Email)</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Nama Lengkap & Info Profil</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400">
                        Tidak ada pengguna ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/60">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800 text-sm">{u.username}</div>
                          <div className="text-slate-400 text-[11px]">{u.email}</div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                              u.role === 'ADMIN'
                                ? 'bg-rose-100 text-rose-800'
                                : u.role === 'GURU'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-800">
                            {u.siswaProfile?.namaLengkap || u.guruProfile?.namaLengkap || '-'}
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            {u.role === 'GURU' && `NIP: ${u.guruProfile?.nip || '-'}`}
                            {u.role === 'SISWA' && `NISN: ${u.siswaProfile?.nisn || '-'} • Kelas: ${u.siswaProfile?.kelas?.namaKelas || '-'}`}
                          </div>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {u.role === 'SISWA' && u.siswaProfile && (
                              <button
                                onClick={() => {
                                  setSelectedSiswaId(u.siswaProfile!.id)
                                  setActiveTab('user-dashboard')
                                  fetchSiswaDashboardData(u.siswaProfile!.id)
                                }}
                                className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg text-xs"
                              >
                                Edit Dashboard
                              </button>
                            )}
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
                              className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded-lg text-xs"
                            >
                              Reset
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.username)}
                              className="p-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg"
                              title="Hapus"
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
        )}

        {/* TAB 3: MASTER AKADEMIK & JADWAL */}
        {activeTab === 'master' && (
          <div className="space-y-6">
            {/* Pembagian Raport Setting Banner */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pengaturan Akses Raport Siswa:</span>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mt-0.5">
                  {settings.pembagianRaportDibuka ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <Unlock className="w-4 h-4" /> Pembagian Raport Aktif (Siswa Dapat Melihat Hasil)
                    </span>
                  ) : (
                    <span className="text-amber-700 flex items-center gap-1">
                      <Lock className="w-4 h-4" /> Pembagian Raport Terkunci (Siswa Tidak Dapat Melihat Hasil)
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Jadwal Resmi Pembagian: <strong>{settings.tanggalPembagianRaport}</strong>. Siswa hanya dapat melihat raport jika status ini DIBUKA.
                </p>
              </div>

              <button
                onClick={handleTogglePembagianRaport}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-2 ${
                  settings.pembagianRaportDibuka
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {settings.pembagianRaportDibuka ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                {settings.pembagianRaportDibuka ? 'Kunci Pembagian Raport' : 'Buka Pembagian Raport Sekarang'}
              </button>
            </div>

            {/* Grid 2 Columns: Kelas & Mapel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Kelas Manager */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">Daftar Kelas</h3>
                    <p className="text-xs text-slate-400">Kelas dan penugasan wali kelas</p>
                  </div>
                  <button
                    onClick={() => setShowAddKelasModal(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Kelas
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {kelasList.map((k) => (
                    <div key={k.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800">{k.namaKelas}</div>
                        <div className="text-slate-400">Tingkat {k.tingkat} • Wali: {k.waliKelas?.namaLengkap || 'Belum ada'}</div>
                      </div>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded">
                        {k._count?.siswas || 0} Siswa
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mapel Manager */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">Mata Pelajaran</h3>
                    <p className="text-xs text-slate-400">Kode dan Kriteria Ketuntasan Minimal (KKM)</p>
                  </div>
                  <button
                    onClick={() => setShowAddMapelModal(true)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Mapel
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {mapelList.map((m) => (
                    <div key={m.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800">{m.namaMapel}</div>
                        <div className="text-slate-400 font-mono">Kode: {m.kodeMapel}</div>
                      </div>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        KKM: {m.kkm}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Jadwal Pelajaran Manager */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" /> Master Jadwal Pelajaran
                  </h3>
                  <p className="text-xs text-slate-400">Kelola jadwal hari, jam, guru, dan kelas yang diajar</p>
                </div>
                <button
                  onClick={() => setShowAddJadwalModal(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Jadwal Pelajaran
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Hari</th>
                      <th className="p-3">Jam</th>
                      <th className="p-3">Kelas</th>
                      <th className="p-3">Mata Pelajaran</th>
                      <th className="p-3">Guru Pengampu</th>
                      <th className="p-3">Ruangan</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {jadwalList.map((j) => (
                      <tr key={j.id} className="hover:bg-slate-50/60">
                        <td className="p-3 font-bold text-blue-700">{j.hari}</td>
                        <td className="p-3 font-semibold text-slate-700">{j.jamMulai} - {j.jamSelesai}</td>
                        <td className="p-3 font-bold text-slate-800">{j.kelas?.namaKelas || j.kelasId}</td>
                        <td className="p-3 text-slate-800 font-medium">{j.mapel?.namaMapel || j.mapelId}</td>
                        <td className="p-3 text-slate-600">{j.guru?.namaLengkap || 'Guru'}</td>
                        <td className="p-3 text-slate-600">{j.ruangan}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteJadwal(j.id)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                            title="Hapus Jadwal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EDITOR DASHBOARD SISWA */}
        {activeTab === 'user-dashboard' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5 text-blue-600" /> Editor Langsung Dashboard Siswa
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ubah profil, rekap absensi, input nilai mata pelajaran, dan catatan raport siswa secara instan
                </p>
              </div>

              {/* Siswa Selector Dropdown */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-600">Pilih Siswa:</span>
                <select
                  value={selectedSiswaId}
                  onChange={(e) => {
                    setSelectedSiswaId(e.target.value)
                    fetchSiswaDashboardData(e.target.value)
                  }}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                >
                  {allSiswaList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.namaLengkap} ({st.kelas?.namaKelas || 'Tanpa Kelas'}) - NISN: {st.nisn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {siswaDetailLoading ? (
              <div className="bg-white p-12 text-center text-slate-400 text-xs rounded-2xl border border-slate-200">
                Memuat data siswa...
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. Profile Editor */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm">1. Data Identitas Siswa</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        value={editorProfile.namaLengkap}
                        onChange={(e) => setEditorProfile({ ...editorProfile, namaLengkap: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">NISN</label>
                      <input
                        type="text"
                        value={editorProfile.nisn}
                        onChange={(e) => setEditorProfile({ ...editorProfile, nisn: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Kelas</label>
                      <select
                        value={editorProfile.kelasId}
                        onChange={(e) => setEditorProfile({ ...editorProfile, kelasId: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500"
                      >
                        {kelasList.map((k) => (
                          <option key={k.id} value={k.id}>
                            {k.namaKelas}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Attendance Override */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-800 text-sm">2. Rekap Kehadiran Siswa (Hari)</h3>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-700 uppercase mb-1">Hadir</label>
                      <input
                        type="number"
                        min="0"
                        value={editorAttendance.HADIR}
                        onChange={(e) => setEditorAttendance({ ...editorAttendance, HADIR: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-blue-700 uppercase mb-1">Izin</label>
                      <input
                        type="number"
                        min="0"
                        value={editorAttendance.IZIN}
                        onChange={(e) => setEditorAttendance({ ...editorAttendance, IZIN: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-amber-700 uppercase mb-1">Sakit</label>
                      <input
                        type="number"
                        min="0"
                        value={editorAttendance.SAKIT}
                        onChange={(e) => setEditorAttendance({ ...editorAttendance, SAKIT: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-rose-700 uppercase mb-1">Alfa</label>
                      <input
                        type="number"
                        min="0"
                        value={editorAttendance.ALFA}
                        onChange={(e) => setEditorAttendance({ ...editorAttendance, ALFA: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Grades Editor */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">3. Nilai Mata Pelajaran Siswa</h3>
                    <div className="flex items-center gap-2">
                      <select
                        value={newMapelSelection}
                        onChange={(e) => setNewMapelSelection(e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold"
                      >
                        <option value="">Pilih Mapel untuk Ditambahkan...</option>
                        {mapelList.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.namaMapel}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddNewMapelGrade}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                      >
                        + Tambah
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase">
                        <tr>
                          <th className="p-3">Mata Pelajaran</th>
                          <th className="p-2 text-center">Tugas (20%)</th>
                          <th className="p-2 text-center">UTS (25%)</th>
                          <th className="p-2 text-center">UAS (30%)</th>
                          <th className="p-2 text-center">Praktik (15%)</th>
                          <th className="p-2 text-center">Sikap (10%)</th>
                          <th className="p-2 text-center">Nilai Akhir</th>
                          <th className="p-2 text-center">Predikat</th>
                          <th className="p-2 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {editorGrades.map((g, idx) => (
                          <tr key={g.mapelId}>
                            <td className="p-3 font-bold text-slate-800">{g.mapelName}</td>
                            <td className="p-2 text-center">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={g.nilaiTugas}
                                onChange={(e) => handleGradeChange(idx, 'nilaiTugas', Number(e.target.value))}
                                className="w-16 px-1.5 py-1 text-center bg-slate-50 border rounded font-bold"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={g.nilaiUts}
                                onChange={(e) => handleGradeChange(idx, 'nilaiUts', Number(e.target.value))}
                                className="w-16 px-1.5 py-1 text-center bg-slate-50 border rounded font-bold"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={g.nilaiUas}
                                onChange={(e) => handleGradeChange(idx, 'nilaiUas', Number(e.target.value))}
                                className="w-16 px-1.5 py-1 text-center bg-slate-50 border rounded font-bold"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={g.nilaiPraktik}
                                onChange={(e) => handleGradeChange(idx, 'nilaiPraktik', Number(e.target.value))}
                                className="w-16 px-1.5 py-1 text-center bg-slate-50 border rounded font-bold"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={g.nilaiSikap}
                                onChange={(e) => handleGradeChange(idx, 'nilaiSikap', Number(e.target.value))}
                                className="w-16 px-1.5 py-1 text-center bg-slate-50 border rounded font-bold"
                              />
                            </td>
                            <td className="p-2 text-center font-extrabold text-blue-700">{g.nilaiAkhir}</td>
                            <td className="p-2 text-center font-bold">{g.predikat}</td>
                            <td className="p-2 text-right">
                              <button
                                onClick={() => handleRemoveGrade(idx)}
                                className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Raport Catatan */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <h3 className="font-bold text-slate-800 text-sm">4. Catatan Wali Kelas di Raport</h3>
                  <textarea
                    rows={2}
                    value={editorRaport.catatanWaliKelas}
                    onChange={(e) => setEditorRaport({ ...editorRaport, catatanWaliKelas: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveSiswaDashboard}
                    disabled={saveLoading}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saveLoading ? 'Menyimpan Perubahan...' : 'Simpan Perubahan Dashboard Siswa'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: WEBSITE CONTENT MANAGER */}
        {activeTab === 'website-content' && (
          <WebsiteContentManager />
        )}

        {/* TAB 6: AUDIT LOGS */}
        {activeTab === 'logs' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-600" /> Audit Log & Keamanan Sistem
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase">
                  <tr>
                    <th className="p-3">Waktu</th>
                    <th className="p-3">Aksi</th>
                    <th className="p-3">Detail Aktivitas</th>
                    <th className="p-3">Pengguna</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/60">
                      <td className="p-3 text-slate-500 whitespace-nowrap">
                        {new Date(l.createdAt).toLocaleString('id-ID')}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-mono font-bold rounded">
                          {l.action}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700">{l.detail}</td>
                      <td className="p-3 text-slate-600 font-semibold">{l.user?.username || 'Sistem'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ADD USER */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" /> Terbitkan Akun Resmi Baru
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Role Akun:</label>
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                  {(['GURU', 'SISWA', 'ADMIN'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setUserForm({ ...userForm, role: r })}
                      className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                        userForm.role === r ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="misal: budi_guru"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="user@sekolah.sch.id"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Password Awal</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimal 4 karakter"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap"
                    value={userForm.namaLengkap}
                    onChange={(e) => setUserForm({ ...userForm, namaLengkap: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {userForm.role === 'GURU' && (
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">NIP (Nomor Induk Pegawai)</label>
                  <input
                    type="text"
                    placeholder="198501012010011001"
                    value={userForm.nip}
                    onChange={(e) => setUserForm({ ...userForm, nip: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              {userForm.role === 'SISWA' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">NIS / NISN</label>
                    <input
                      type="text"
                      placeholder="NIS"
                      value={userForm.nis}
                      onChange={(e) => setUserForm({ ...userForm, nis: e.target.value, nisn: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Kelas</label>
                    <select
                      value={userForm.kelasId}
                      onChange={(e) => setUserForm({ ...userForm, kelasId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500"
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

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-500" /> Edit Akun: {editUserForm.username}
            </h3>

            <form onSubmit={handleEditUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Ubah Role</label>
                <select
                  value={editUserForm.newRole}
                  onChange={(e) =>
                    setEditUserForm({
                      ...editUserForm,
                      newRole: e.target.value as 'ADMIN' | 'GURU' | 'SISWA',
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="GURU">GURU</option>
                  <option value="SISWA">SISWA</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Reset Password Baru</label>
                <input
                  type="password"
                  placeholder="Password baru min 4 karakter"
                  value={editUserForm.newPassword}
                  onChange={(e) => setEditUserForm({ ...editUserForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD KELAS */}
      {showAddKelasModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <School className="w-5 h-5 text-blue-600" /> Tambah Kelas Baru
            </h3>

            <form onSubmit={handleAddKelas} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nama Kelas</label>
                <input
                  type="text"
                  required
                  placeholder="misal: X MIPA 3"
                  value={kelasForm.namaKelas}
                  onChange={(e) => setKelasForm({ ...kelasForm, namaKelas: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Tingkat</label>
                <select
                  value={kelasForm.tingkat}
                  onChange={(e) => setKelasForm({ ...kelasForm, tingkat: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="10">Kelas 10 (Sepuluh)</option>
                  <option value="11">Kelas 11 (Sebelas)</option>
                  <option value="12">Kelas 12 (Dua Belas)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddKelasModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD MAPEL */}
      {showAddMapelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" /> Tambah Mata Pelajaran Baru
            </h3>

            <form onSubmit={handleAddMapel} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Kode Mapel</label>
                  <input
                    type="text"
                    required
                    placeholder="misal: MTK-10"
                    value={mapelForm.kodeMapel}
                    onChange={(e) => setMapelForm({ ...mapelForm, kodeMapel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">KKM (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={mapelForm.kkm}
                    onChange={(e) => setMapelForm({ ...mapelForm, kkm: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nama Mata Pelajaran</label>
                <input
                  type="text"
                  required
                  placeholder="misal: Fisika Terapan"
                  value={mapelForm.namaMapel}
                  onChange={(e) => setMapelForm({ ...mapelForm, namaMapel: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMapelModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  Simpan Mapel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD JADWAL */}
      {showAddJadwalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" /> Tambah Jadwal Pelajaran
            </h3>

            <form onSubmit={handleAddJadwal} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Hari</label>
                  <select
                    value={jadwalForm.hari}
                    onChange={(e) => setJadwalForm({ ...jadwalForm, hari: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                  >
                    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    required
                    value={jadwalForm.jamMulai}
                    onChange={(e) => setJadwalForm({ ...jadwalForm, jamMulai: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    required
                    value={jadwalForm.jamSelesai}
                    onChange={(e) => setJadwalForm({ ...jadwalForm, jamSelesai: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Kelas</label>
                  <select
                    value={jadwalForm.kelasId}
                    onChange={(e) => setJadwalForm({ ...jadwalForm, kelasId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                  >
                    {kelasList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.namaKelas}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Mata Pelajaran</label>
                  <select
                    value={jadwalForm.mapelId}
                    onChange={(e) => setJadwalForm({ ...jadwalForm, mapelId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
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
                  <label className="block text-slate-600 font-semibold mb-1">Guru Pengajar</label>
                  <select
                    value={jadwalForm.guruId}
                    onChange={(e) => setJadwalForm({ ...jadwalForm, guruId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                  >
                    {guruList.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.namaLengkap}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Ruangan</label>
                  <input
                    type="text"
                    placeholder="misal: Ruang 101 / Lab IPA"
                    value={jadwalForm.ruangan}
                    onChange={(e) => setJadwalForm({ ...jadwalForm, ruangan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddJadwalModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
