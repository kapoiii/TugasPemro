'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Globe,
  Image as ImageIcon,
  FileText,
  Megaphone,
  Calendar,
  Users,
  Building,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Edit2,
  Layers
} from 'lucide-react'
import type { SiteContent } from '@/lib/siteContent'
import DualImageInput from '@/components/common/DualImageInput'

// Curated preset photos for easy selection by admin
const PHOTO_PRESETS = {
  gedung: [
    { label: 'Gedung Utama Modern', url: 'https://prinsipbisnis.com/wp-content/uploads/2025/03/Gedung-Kelas-Ikhwan-scaled-1.jpg' },
    { label: 'Kampus Sekolah Hijau', url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200' },
    { label: 'Gedung Akademik', url: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1200' }
  ],
  fasilitas: [
    { label: 'Lab Sains / IPA', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800' },
    { label: 'Lab Komputer', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800' },
    { label: 'Perpustakaan Digital', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=800' },
    { label: 'Aula Serbaguna', url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=800' },
    { label: 'Lapangan Olahraga', url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800' },
    { label: 'Kantin Bersih & Sehat', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800' }
  ],
  berita: [
    { label: 'Prestasi & Juara', url: 'https://images.unsplash.com/photo-1567168544813-cc03465b4fa8?q=80&w=800' },
    { label: 'Pentas Seni & HUT', url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=800' },
    { label: 'Workshop / Belajar', url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800' },
    { label: 'Debat & Seminar', url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=800' }
  ],
  galeri: [
    { label: 'Upacara Bendera', url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800' },
    { label: 'Pramuka / Ekskul', url: 'https://images.unsplash.com/photo-1526976668912-1a811878dd37?q=80&w=800' },
    { label: 'Laboratorium & Riset', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800' },
    { label: 'Olahraga & Futsal', url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800' },
    { label: 'Wisuda & Pelepasan', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800' }
  ],
  guru: [
    { label: 'Kepala Sekolah (Jas)', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400' },
    { label: 'Guru Wanita (Formal)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400' },
    { label: 'Guru Pria (Formal)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400' },
    { label: 'Guru Pendidik (Kacamata)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400' }
  ]
}

export default function WebsiteContentManager() {
  const [content, setContent] = useState<SiteContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [activeSection, setActiveSection] = useState<
    'beranda' | 'fasilitas' | 'berita' | 'pengumuman' | 'agenda' | 'galeri' | 'guru' | 'profil'
  >('beranda')

  // Form states for adding items
  const [newFasilitas, setNewFasilitas] = useState({ nama: '', desc: '', img: '' })
  const [newBerita, setNewBerita] = useState({
    judul: '',
    kategori: 'Kegiatan',
    gambar: '',
    ringkasan: '',
    isi: '',
  })
  const [newPengumuman, setNewPengumuman] = useState({
    judul: '',
    tanggal: new Date().toISOString().split('T')[0],
    penting: false,
    isi: '',
  })
  const [newAgenda, setNewAgenda] = useState({
    judul: '',
    tanggal: new Date().toISOString().split('T')[0],
    lokasi: '',
    waktu: '08.00 - 12.00 WIB',
    kategori: 'Kegiatan',
  })
  const [newGaleri, setNewGaleri] = useState({ judul: '', album: 'Kegiatan', foto: '' })
  const [newGuru, setNewGuru] = useState({
    nama: '',
    jabatan: 'Guru',
    mapel: '',
    foto: '',
  })

  // Load content from API
  useEffect(() => {
    fetch('/api/content')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setContent(json.data)
        }
      })
      .catch((err) => {
        setNotification({ type: 'error', message: 'Gagal memuat konten website: ' + err.message })
      })
      .finally(() => setLoading(false))
  }, [])

  // Save changes to API
  const handleSaveAll = async () => {
    if (!content) return
    setSaving(true)
    setNotification(null)

    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      })
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Gagal menyimpan perubahan')
      }

      setNotification({
        type: 'success',
        message: 'Semua perubahan konten dan foto website berhasil disimpan & langsung aktif!',
      })
      setTimeout(() => setNotification(null), 6000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kegagalan saat menyimpan'
      setNotification({ type: 'error', message: msg })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-rose-500 mb-4" />
        <p className="text-sm">Memuat modul manajemen konten website...</p>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 text-center text-red-400">
        Gagal memuat data konten website. Silakan refresh halaman.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Banner and Quick Actions */}
      <div className="bg-gradient-to-r from-rose-950/60 via-slate-950 to-slate-900 border border-rose-900/50 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg">
              <Globe className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-wide">
              Pusat Kendali Konten &amp; Media Website (CMS)
            </h2>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/30">
              LIVE SYNC
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Sebagai Administrator Sekolah, Anda memiliki wewenang penuh untuk mengubah seluruh foto fasilitas, berita, pengumuman, agenda kegiatan, galeri, hingga teks utama di website secara instan.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Lihat Website
          </a>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
          </button>
        </div>
      </div>

      {/* Notification Alert */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-medium border ${
            notification.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300'
              : 'bg-red-950/80 border-red-800/80 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          {notification.type === 'success' && (
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-emerald-200 font-bold hover:text-white"
            >
              Buka Website Langsung ↗
            </a>
          )}
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2 text-xs border-b border-slate-800 scrollbar-none">
        {[
          { id: 'beranda', label: 'Beranda & Hero', icon: Building },
          { id: 'fasilitas', label: 'Fasilitas & Fitur Sekolah', icon: Layers },
          { id: 'berita', label: 'Berita & Artikel', icon: FileText },
          { id: 'pengumuman', label: 'Pengumuman Resmi', icon: Megaphone },
          { id: 'agenda', label: 'Agenda Kegiatan', icon: Calendar },
          { id: 'galeri', label: 'Galeri Foto', icon: ImageIcon },
          { id: 'guru', label: 'Dewan Guru', icon: Users },
          { id: 'profil', label: 'Profil & Kontak', icon: Sparkles },
        ].map((sec) => {
          const Icon = sec.icon
          const isActive = activeSection === sec.id
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as typeof activeSection)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-850'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sec.label}</span>
            </button>
          )
        })}
      </div>

      {/* SECTION 1: BERANDA & HERO */}
      {activeSection === 'beranda' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Building className="w-4 h-4 text-rose-400" /> Pengaturan Teks Utama Beranda
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1">Nama Sekolah</label>
                  <input
                    type="text"
                    value={content.general.schoolName}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        general: { ...content.general, schoolName: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1">Badge / Penghargaan</label>
                  <input
                    type="text"
                    value={content.general.heroBadge}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        general: { ...content.general, heroBadge: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Judul Hero Banner</label>
                <input
                  type="text"
                  value={content.general.heroTitle}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      general: { ...content.general, heroTitle: e.target.value },
                    })
                  }
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Deskripsi Ringkas Beranda</label>
                <textarea
                  rows={3}
                  value={content.general.heroSubtitle}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      general: { ...content.general, heroSubtitle: e.target.value },
                    })
                  }
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
            </div>

            {/* Statistik Sekolah */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> 4 Statistik Utama Beranda
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {content.general.stats.map((st, idx) => (
                  <div key={idx} className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-1">
                    <label className="block text-slate-400 text-[11px] font-semibold">{st.label}</label>
                    <input
                      type="text"
                      value={st.num}
                      onChange={(e) => {
                        const newStats = [...content.general.stats]
                        newStats[idx].num = e.target.value
                        setContent({
                          ...content,
                          general: { ...content.general, stats: newStats },
                        })
                      }}
                      className="w-full p-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-bold text-center text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hero Banner Image */}
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-400" /> Foto Utama Gedung / Hero Banner
            </h3>

            <DualImageInput
              label="Ganti Foto Gedung / Hero Banner"
              value={content.general.heroImage}
              onChange={(val) =>
                setContent({
                  ...content,
                  general: { ...content.general, heroImage: val },
                })
              }
              presets={PHOTO_PRESETS.gedung}
              aspectRatioClass="aspect-[16/9]"
            />
          </div>
        </div>
      )}

      {/* SECTION 2: FASILITAS & FITUR SEKOLAH */}
      {activeSection === 'fasilitas' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="font-bold text-white text-sm">Kelola Fasilitas &amp; Fitur Sekolah</h3>
              <p className="text-xs text-slate-400">
                Ganti foto, deskripsi, atau tambahkan fasilitas baru yang ditampilkan di halaman Profil sekolah.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Total: {content.fasilitas.length} Fasilitas
            </span>
          </div>

          {/* List of existing facilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.fasilitas.map((fas, idx) => (
              <div
                key={fas.id || idx}
                className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Photo with live preview */}
                  <div className="relative aspect-video w-full bg-slate-900 overflow-hidden group">
                    <Image
                      src={fas.img}
                      alt={fas.nama}
                      fill
                      className="object-cover group-hover:scale-105 transition-all"
                      unoptimized
                    />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-slate-200">
                      Fasilitas #{idx + 1}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <label className="block text-slate-400 text-[11px] font-semibold mb-1">Nama Fasilitas</label>
                      <input
                        type="text"
                        value={fas.nama}
                        onChange={(e) => {
                          const updated = [...content.fasilitas]
                          updated[idx].nama = e.target.value
                          setContent({ ...content, fasilitas: updated })
                        }}
                        className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] font-semibold mb-1">Deskripsi</label>
                      <textarea
                        rows={2}
                        value={fas.desc}
                        onChange={(e) => {
                          const updated = [...content.fasilitas]
                          updated[idx].desc = e.target.value
                          setContent({ ...content, fasilitas: updated })
                        }}
                        className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-850">
                      <DualImageInput
                        label="Ganti Foto Fasilitas"
                        value={fas.img}
                        onChange={(val) => {
                          const updated = [...content.fasilitas]
                          updated[idx].img = val
                          setContent({ ...content, fasilitas: updated })
                        }}
                        presets={PHOTO_PRESETS.fasilitas.slice(0, 4)}
                        aspectRatioClass="aspect-[16/9]"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-900 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Hapus fasilitas "${fas.nama}"?`)) {
                        const updated = content.fasilitas.filter((_, i) => i !== idx)
                        setContent({ ...content, fasilitas: updated })
                      }
                    }}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus Fasilitas
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Form Tambah Fasilitas Baru */}
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" /> Tambah Fasilitas / Fitur Baru
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Nama Fasilitas Baru</label>
                <input
                  type="text"
                  placeholder="Contoh: Studio Musik Digital"
                  value={newFasilitas.nama}
                  onChange={(e) => setNewFasilitas({ ...newFasilitas, nama: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Deskripsi Singkat</label>
                <input
                  type="text"
                  placeholder="Contoh: Alat musik lengkap dengan peredam suara"
                  value={newFasilitas.desc}
                  onChange={(e) => setNewFasilitas({ ...newFasilitas, desc: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
              <div className="md:col-span-2">
                <DualImageInput
                  label="Foto Fasilitas Baru (Folder / URL)"
                  value={newFasilitas.img}
                  onChange={(val) => setNewFasilitas({ ...newFasilitas, img: val })}
                  presets={PHOTO_PRESETS.fasilitas}
                  aspectRatioClass="aspect-[16/9]"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!newFasilitas.nama) {
                    alert('Nama fasilitas wajib diisi')
                    return
                  }
                  const added = {
                    id: `fas-${Date.now()}`,
                    nama: newFasilitas.nama,
                    desc: newFasilitas.desc || 'Fasilitas pendukung pembelajaran unggul.',
                    img:
                      newFasilitas.img ||
                      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800',
                  }
                  setContent({
                    ...content,
                    fasilitas: [...content.fasilitas, added],
                  })
                  setNewFasilitas({ nama: '', desc: '', img: '' })
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" /> Tambahkan Fasilitas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: BERITA & ARTIKEL */}
      {activeSection === 'berita' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="font-bold text-white text-sm">Kelola Berita &amp; Informasi Sekolah</h3>
              <p className="text-xs text-slate-400">
                Tambah berita baru, perbarui artikel lama, atau ganti foto berita yang tampil di website.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Total: {content.berita.length} Berita
            </span>
          </div>

          {/* Form Tambah Berita Baru */}
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-500" /> Publikasikan Berita / Informasi Baru
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-slate-400 text-xs font-semibold mb-1">Judul Berita</label>
                <input
                  type="text"
                  placeholder="Judul artikel atau pengumuman..."
                  value={newBerita.judul}
                  onChange={(e) => setNewBerita({ ...newBerita, judul: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Kategori</label>
                <select
                  value={newBerita.kategori}
                  onChange={(e) => setNewBerita({ ...newBerita, kategori: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                >
                  <option value="Prestasi">Prestasi</option>
                  <option value="Kegiatan">Kegiatan</option>
                  <option value="Akademik">Akademik</option>
                  <option value="Pengumuman">Pengumuman</option>
                </select>
              </div>
            </div>

            <div>
              <DualImageInput
                label="Foto Berita / Dokumentasi (Folder / Galeri atau URL)"
                value={newBerita.gambar}
                onChange={(val) => setNewBerita({ ...newBerita, gambar: val })}
                presets={PHOTO_PRESETS.berita}
                aspectRatioClass="aspect-[16/9]"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1">Ringkasan Singkat</label>
              <textarea
                rows={2}
                placeholder="Ringkasan 1-2 kalimat untuk kartu berita..."
                value={newBerita.ringkasan}
                onChange={(e) => setNewBerita({ ...newBerita, ringkasan: e.target.value })}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1">Isi Lengkap Artikel</label>
              <textarea
                rows={4}
                placeholder="Tuliskan isi berita lengkap di sini..."
                value={newBerita.isi}
                onChange={(e) => setNewBerita({ ...newBerita, isi: e.target.value })}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!newBerita.judul || !newBerita.isi) {
                    alert('Judul dan isi berita wajib diisi!')
                    return
                  }
                  const slug = newBerita.judul
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)+/g, '')
                  const created = {
                    id: `${slug}-${Date.now().toString().slice(-4)}`,
                    judul: newBerita.judul,
                    tanggal: new Date().toISOString().split('T')[0],
                    kategori: newBerita.kategori,
                    gambar:
                      newBerita.gambar ||
                      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800',
                    ringkasan: newBerita.ringkasan || newBerita.judul,
                    isi: newBerita.isi,
                  }
                  setContent({
                    ...content,
                    berita: [created, ...content.berita],
                  })
                  setNewBerita({
                    judul: '',
                    kategori: 'Kegiatan',
                    gambar: '',
                    ringkasan: '',
                    isi: '',
                  })
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" /> Publikasikan Berita
              </button>
            </div>
          </div>

          {/* Existing Berita List */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
              Daftar Berita yang Telah Terbit:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.berita.map((b, idx) => (
                <div
                  key={b.id || idx}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex gap-4 items-start"
                >
                  <div className="relative w-28 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                    <Image src={b.gambar} alt={b.judul} fill className="object-cover" unoptimized />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-semibold">
                        {b.kategori}
                      </span>
                      <span className="text-[10px] text-slate-500">{b.tanggal}</span>
                    </div>

                    <h5 className="font-bold text-white text-xs line-clamp-1">{b.judul}</h5>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{b.ringkasan}</p>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-900 text-[11px]">
                      <span className="text-slate-500 truncate max-w-[140px]">ID: {b.id}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Hapus berita "${b.judul}"?`)) {
                            const updated = content.berita.filter((_, i) => i !== idx)
                            setContent({ ...content, berita: updated })
                          }
                        }}
                        className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: PENGUMUMAN */}
      {activeSection === 'pengumuman' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="font-bold text-white text-sm">Kelola Pengumuman Resmi Sekolah</h3>
              <p className="text-xs text-slate-400">
                Pengumuman penting dan jadwal akademik yang muncul di halaman beranda dan pengumuman.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Total: {content.pengumuman.length} Pengumuman
            </span>
          </div>

          {/* Form Tambah Pengumuman */}
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" /> Buat Pengumuman Baru
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-slate-400 text-xs font-semibold mb-1">Judul Pengumuman</label>
                <input
                  type="text"
                  placeholder="Contoh: Jadwal Libur Semester Genap"
                  value={newPengumuman.judul}
                  onChange={(e) => setNewPengumuman({ ...newPengumuman, judul: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Tanggal Rilis</label>
                <input
                  type="date"
                  value={newPengumuman.tanggal}
                  onChange={(e) => setNewPengumuman({ ...newPengumuman, tanggal: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1">Isi Pengumuman</label>
              <textarea
                rows={3}
                placeholder="Rincian informasi pengumuman..."
                value={newPengumuman.isi}
                onChange={(e) => setNewPengumuman({ ...newPengumuman, isi: e.target.value })}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPengumuman.penting}
                  onChange={(e) => setNewPengumuman({ ...newPengumuman, penting: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-0"
                />
                <span className="font-semibold text-amber-400">Tandai sebagai Pengumuman PENTING (Highlight)</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  if (!newPengumuman.judul || !newPengumuman.isi) {
                    alert('Judul dan isi pengumuman wajib diisi!')
                    return
                  }
                  const created = {
                    id: Date.now(),
                    judul: newPengumuman.judul,
                    tanggal: newPengumuman.tanggal,
                    penting: newPengumuman.penting,
                    isi: newPengumuman.isi,
                  }
                  setContent({
                    ...content,
                    pengumuman: [created, ...content.pengumuman],
                  })
                  setNewPengumuman({
                    judul: '',
                    tanggal: new Date().toISOString().split('T')[0],
                    penting: false,
                    isi: '',
                  })
                }}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" /> Terbitkan Pengumuman
              </button>
            </div>
          </div>

          {/* List Pengumuman */}
          <div className="space-y-3">
            {content.pengumuman.map((ann, idx) => (
              <div
                key={ann.id || idx}
                className={`bg-slate-950 border p-5 rounded-2xl flex items-start justify-between gap-4 ${
                  ann.penting ? 'border-amber-500/50 bg-amber-950/10' : 'border-slate-800'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    {ann.penting && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded">
                        PENTING
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400">{ann.tanggal}</span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{ann.judul}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{ann.isi}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Hapus pengumuman "${ann.judul}"?`)) {
                      const updated = content.pengumuman.filter((_, i) => i !== idx)
                      setContent({ ...content, pengumuman: updated })
                    }
                  }}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: AGENDA KEGIATAN */}
      {activeSection === 'agenda' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="font-bold text-white text-sm">Kelola Agenda Kegiatan Sekolah</h3>
              <p className="text-xs text-slate-400">
                Kalender agenda kegiatan, rapat, perlombaan, dan ujian sekolah.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Total: {content.agenda.length} Agenda</span>
          </div>

          {/* Form Tambah Agenda */}
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-400" /> Tambah Agenda Baru
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-slate-400 text-xs font-semibold mb-1">Nama Kegiatan / Agenda</label>
                <input
                  type="text"
                  placeholder="Contoh: Seleksi OSN 2027"
                  value={newAgenda.judul}
                  onChange={(e) => setNewAgenda({ ...newAgenda, judul: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Tanggal</label>
                <input
                  type="date"
                  value={newAgenda.tanggal}
                  onChange={(e) => setNewAgenda({ ...newAgenda, tanggal: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Waktu</label>
                <input
                  type="text"
                  placeholder="08.00 - 12.00 WIB"
                  value={newAgenda.waktu}
                  onChange={(e) => setNewAgenda({ ...newAgenda, waktu: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Lokasi</label>
                <input
                  type="text"
                  placeholder="Aula / Lapangan / Lab IPA"
                  value={newAgenda.lokasi}
                  onChange={(e) => setNewAgenda({ ...newAgenda, lokasi: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Kategori</label>
                <select
                  value={newAgenda.kategori}
                  onChange={(e) => setNewAgenda({ ...newAgenda, kategori: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                >
                  <option value="Akademik">Akademik</option>
                  <option value="Kegiatan">Kegiatan</option>
                  <option value="PPDB">PPDB</option>
                  <option value="Libur">Libur</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!newAgenda.judul) {
                    alert('Judul agenda wajib diisi!')
                    return
                  }
                  const created = {
                    id: Date.now(),
                    judul: newAgenda.judul,
                    tanggal: newAgenda.tanggal,
                    lokasi: newAgenda.lokasi || 'Lingkungan Sekolah',
                    waktu: newAgenda.waktu,
                    kategori: newAgenda.kategori,
                  }
                  setContent({
                    ...content,
                    agenda: [...content.agenda, created],
                  })
                  setNewAgenda({
                    judul: '',
                    tanggal: new Date().toISOString().split('T')[0],
                    lokasi: '',
                    waktu: '08.00 - 12.00 WIB',
                    kategori: 'Kegiatan',
                  })
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" /> Simpan Agenda
              </button>
            </div>
          </div>

          {/* List Agenda */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.agenda.map((ag, idx) => (
              <div
                key={ag.id || idx}
                className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-bold rounded text-[10px]">
                      {ag.kategori}
                    </span>
                    <span className="text-[11px] text-slate-400">{ag.tanggal}</span>
                  </div>
                  <h4 className="font-bold text-white text-xs">{ag.judul}</h4>
                  <p className="text-[11px] text-slate-400">
                    📍 {ag.lokasi} • ⏰ {ag.waktu}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Hapus agenda "${ag.judul}"?`)) {
                      const updated = content.agenda.filter((_, i) => i !== idx)
                      setContent({ ...content, agenda: updated })
                    }
                  }}
                  className="p-2 text-red-400 hover:text-red-300 rounded-lg cursor-pointer"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 6: GALERI FOTO */}
      {activeSection === 'galeri' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="font-bold text-white text-sm">Kelola Galeri Foto Sekolah</h3>
              <p className="text-xs text-slate-400">
                Unggah dan kelola foto kegiatan, momen upacara, ekstrakurikuler, dan prestasi sekolah.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Total: {content.galeri.length} Foto</span>
          </div>

          {/* Form Tambah Foto */}
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-400" /> Tambah Foto Dokumentasi Baru
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Judul / Keterangan Foto</label>
                <input
                  type="text"
                  placeholder="Contoh: Juara 1 Turnamen Futsal"
                  value={newGaleri.judul}
                  onChange={(e) => setNewGaleri({ ...newGaleri, judul: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Album / Kategori</label>
                <select
                  value={newGaleri.album}
                  onChange={(e) => setNewGaleri({ ...newGaleri, album: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                >
                  <option value="Kegiatan Rutin">Kegiatan Rutin</option>
                  <option value="Kegiatan Ekskul">Kegiatan Ekskul</option>
                  <option value="Prestasi">Prestasi</option>
                  <option value="Olahraga">Olahraga</option>
                  <option value="Akademik">Akademik</option>
                  <option value="Wisuda">Wisuda</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <DualImageInput
                  label="Pilih Foto Galeri Dokumentasi (Folder / Galeri atau URL)"
                  value={newGaleri.foto}
                  onChange={(val) => setNewGaleri({ ...newGaleri, foto: val })}
                  presets={PHOTO_PRESETS.galeri}
                  aspectRatioClass="aspect-[4/3]"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!newGaleri.judul) {
                    alert('Judul foto wajib diisi!')
                    return
                  }
                  const created = {
                    id: Date.now(),
                    judul: newGaleri.judul,
                    album: newGaleri.album,
                    foto:
                      newGaleri.foto ||
                      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800',
                  }
                  setContent({
                    ...content,
                    galeri: [created, ...content.galeri],
                  })
                  setNewGaleri({ judul: '', album: 'Kegiatan', foto: '' })
                }}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" /> Masukkan ke Galeri
              </button>
            </div>
          </div>

          {/* List Foto Galeri */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {content.galeri.map((g, idx) => (
              <div
                key={g.id || idx}
                className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                <div className="relative aspect-video w-full bg-slate-900">
                  <Image src={g.foto} alt={g.judul} fill className="object-cover" unoptimized />
                </div>
                <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-900 text-purple-400 rounded font-semibold">
                      {g.album}
                    </span>
                    <h5 className="font-bold text-white text-xs mt-1 line-clamp-1">{g.judul}</h5>
                  </div>
                  <div className="flex justify-end pt-2 border-t border-slate-900">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus foto "${g.judul}"?`)) {
                          const updated = content.galeri.filter((_, i) => i !== idx)
                          setContent({ ...content, galeri: updated })
                        }
                      }}
                      className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 7: DEWAN GURU & PENDIDIK */}
      {activeSection === 'guru' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="font-bold text-white text-sm">Kelola Dewan Guru &amp; Tenaga Pendidik</h3>
              <p className="text-xs text-slate-400">
                Ganti foto guru, perbarui jabatan, mata pelajaran yang diampu, atau tambah pendidik baru.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Total: {content.guru.length} Guru</span>
          </div>

          {/* Form Tambah Guru */}
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" /> Tambah Data Guru / Staf Baru
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Nama Lengkap &amp; Gelar</label>
                <input
                  type="text"
                  placeholder="Drs. ..."
                  value={newGuru.nama}
                  onChange={(e) => setNewGuru({ ...newGuru, nama: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Jabatan</label>
                <input
                  type="text"
                  placeholder="Guru / Kepala Sekolah / Wakil"
                  value={newGuru.jabatan}
                  onChange={(e) => setNewGuru({ ...newGuru, jabatan: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Mata Pelajaran Utama</label>
                <input
                  type="text"
                  placeholder="Matematika / Fisika..."
                  value={newGuru.mapel}
                  onChange={(e) => setNewGuru({ ...newGuru, mapel: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div className="md:col-span-4">
                <DualImageInput
                  label="Foto Guru / Pendidik Baru (Folder / Galeri atau URL)"
                  value={newGuru.foto}
                  onChange={(val) => setNewGuru({ ...newGuru, foto: val })}
                  aspectRatioClass="aspect-square"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!newGuru.nama) {
                    alert('Nama guru wajib diisi!')
                    return
                  }
                  const created = {
                    id: Date.now(),
                    nama: newGuru.nama,
                    jabatan: newGuru.jabatan || 'Guru',
                    mapel: newGuru.mapel,
                    foto:
                      newGuru.foto ||
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400',
                  }
                  setContent({
                    ...content,
                    guru: [...content.guru, created],
                  })
                  setNewGuru({ nama: '', jabatan: 'Guru', mapel: '', foto: '' })
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" /> Simpan Guru
              </button>
            </div>
          </div>

          {/* List Guru */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {content.guru.map((g, idx) => (
              <div
                key={g.id || idx}
                className="bg-slate-950 border border-slate-800 p-4 rounded-3xl flex flex-col items-center text-center space-y-3 justify-between"
              >
                <div className="flex flex-col items-center w-full">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-900 mb-2">
                    <Image src={g.foto} alt={g.nama} fill className="object-cover" unoptimized />
                  </div>

                  <h5 className="font-bold text-white text-xs">{g.nama}</h5>
                  <p className="text-[11px] text-rose-400 font-semibold">{g.jabatan}</p>
                  {g.mapel && <p className="text-[10px] text-slate-400">{g.mapel}</p>}

                  {/* Input Ganti Foto Guru */}
                  <div className="w-full mt-3 text-left">
                    <DualImageInput
                      label="Ganti Foto"
                      value={g.foto}
                      onChange={(val) => {
                        const updated = [...content.guru]
                        updated[idx].foto = val
                        setContent({ ...content, guru: updated })
                      }}
                      aspectRatioClass="aspect-square"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Hapus data ${g.nama}?`)) {
                      const updated = content.guru.filter((_, i) => i !== idx)
                      setContent({ ...content, guru: updated })
                    }
                  }}
                  className="text-xs text-red-400 hover:text-red-300 pt-2 border-t border-slate-900 w-full flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Hapus
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 8: PROFIL & KONTAK */}
      {activeSection === 'profil' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visi & Misi */}
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> Visi &amp; Misi Sekolah
            </h3>

            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1">Visi Sekolah</label>
              <textarea
                rows={3}
                value={content.profil.visi}
                onChange={(e) =>
                  setContent({
                    ...content,
                    profil: { ...content.profil, visi: e.target.value },
                  })
                }
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-slate-400 text-xs font-semibold">Butir-Butir Misi</label>
                <button
                  type="button"
                  onClick={() => {
                    setContent({
                      ...content,
                      profil: {
                        ...content.profil,
                        misi: [...content.profil.misi, 'Misi baru sekolah...'],
                      },
                    })
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Butir
                </button>
              </div>

              <div className="space-y-2">
                {content.profil.misi.map((m, mIdx) => (
                  <div key={mIdx} className="flex gap-2 items-center">
                    <span className="text-slate-500 font-bold text-xs">{mIdx + 1}.</span>
                    <input
                      type="text"
                      value={m}
                      onChange={(e) => {
                        const updated = [...content.profil.misi]
                        updated[mIdx] = e.target.value
                        setContent({
                          ...content,
                          profil: { ...content.profil, misi: updated },
                        })
                      }}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = content.profil.misi.filter((_, i) => i !== mIdx)
                        setContent({
                          ...content,
                          profil: { ...content.profil, misi: updated },
                        })
                      }}
                      className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-850">
              <div>
                <label className="block text-slate-500 text-[10px] uppercase font-bold mb-1">Tahun Berdiri</label>
                <input
                  type="text"
                  value={content.profil.tahunBerdiri}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      profil: { ...content.profil, tahunBerdiri: e.target.value },
                    })
                  }
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[10px] uppercase font-bold mb-1">Akreditasi</label>
                <input
                  type="text"
                  value={content.profil.akreditasi}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      profil: { ...content.profil, akreditasi: e.target.value },
                    })
                  }
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[10px] uppercase font-bold mb-1">Total Alumni</label>
                <input
                  type="text"
                  value={content.profil.totalAlumni}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      profil: { ...content.profil, totalAlumni: e.target.value },
                    })
                  }
                  className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-bold"
                />
              </div>
            </div>
          </div>

          {/* Sejarah & Kontak */}
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" /> Teks Sejarah Singkat
              </h3>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Paragraf 1</label>
                <textarea
                  rows={3}
                  value={content.profil.sejarahP1}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      profil: { ...content.profil, sejarahP1: e.target.value },
                    })
                  }
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Paragraf 2</label>
                <textarea
                  rows={3}
                  value={content.profil.sejarahP2}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      profil: { ...content.profil, sejarahP2: e.target.value },
                    })
                  }
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" /> Informasi Kontak &amp; Pelayanan
              </h3>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Alamat Sekolah</label>
                <input
                  type="text"
                  value={content.kontak.alamat}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      kontak: { ...content.kontak, alamat: e.target.value },
                    })
                  }
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1">Telepon Kantor</label>
                  <input
                    type="text"
                    value={content.kontak.telepon}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        kontak: { ...content.kontak, telepon: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1">WhatsApp Resmi</label>
                  <input
                    type="text"
                    value={content.kontak.whatsapp}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        kontak: { ...content.kontak, whatsapp: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1">Email Resmi</label>
                  <input
                    type="email"
                    value={content.kontak.email}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        kontak: { ...content.kontak, email: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-1">Jam Kerja</label>
                  <input
                    type="text"
                    value={content.kontak.jamKerja}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        kontak: { ...content.kontak, jamKerja: e.target.value },
                      })
                    }
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Button at bottom */}
      <div className="sticky bottom-6 p-4 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-2xl flex items-center justify-between shadow-2xl z-30">
        <div className="text-xs text-slate-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" />
          <span>Perubahan pada foto dan teks akan langsung muncul di halaman website pengunjung.</span>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30 text-xs flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Menyimpan ke Website...' : 'Simpan Perubahan Konten & Foto'}
        </button>
      </div>
    </div>
  )
}
