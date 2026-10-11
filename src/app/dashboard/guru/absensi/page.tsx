'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Calendar, Save, Plus } from 'lucide-react'

interface DetailAbsensiItem {
  id: string
  status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA'
}

interface SesiAbsensiItem {
  id: string
  pertemuanKe: number
  tanggal: string
  keterangan?: string
  mapel?: { namaMapel: string }
  kelas?: { namaKelas: string }
  details?: DetailAbsensiItem[]
}

export default function GuruAbsensiPage() {
  const [sesiList, setSesiList] = useState<SesiAbsensiItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  // Dummy Siswa list for session input demo
  const [dummySiswas] = useState([
    { id: 'siswa-1', nama: 'Ahmad Fauzi', nis: '1001' },
    { id: 'siswa-2', nama: 'Budi Santoso', nis: '1002' },
    { id: 'siswa-3', nama: 'Citra Dewi', nis: '1003' },
    { id: 'siswa-4', nama: 'Dian Permata', nis: '1004' },
    { id: 'siswa-5', nama: 'Eko Prasetyo', nis: '1005' },
  ])

  const [formSesi, setFormSesi] = useState({
    kelasId: 'X-IPA-1',
    mapelId: 'MTK-10',
    pertemuanKe: 1,
    keterangan: 'Materi Persamaan Kuadrat',
  })

  const [records, setRecords] = useState<{ [key: string]: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALFA' }>({
    'siswa-1': 'HADIR',
    'siswa-2': 'HADIR',
    'siswa-3': 'IZIN',
    'siswa-4': 'HADIR',
    'siswa-5': 'ALFA',
  })

  const fetchAbsensi = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/absensi')
      const data = await res.json()
      if (data.success) {
        setSesiList(data.data)
      }
    } catch {
      // ignore error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAbsensi()
  }, [fetchAbsensi])

  const handleSaveAbsensi = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const formattedRecords = Object.keys(records).map((siswaId) => ({
        siswaId,
        status: records[siswaId],
      }))

      const res = await fetch('/api/absensi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formSesi,
          records: formattedRecords,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setShowModal(false)
        fetchAbsensi()
      } else {
        alert(data.message)
      }
    } catch {
      alert('Gagal menyimpan sesi absensi')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Absensi & Kehadiran Kelas</h1>
          <p className="text-sm text-slate-500">Buat sesi absensi dan rekap kehadiran siswa per mata pelajaran</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 text-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Buat Sesi Absensi Baru
        </button>
      </div>

      {/* Sesi List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Memuat sesi absensi...</div>
        ) : sesiList.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            Belum ada sesi absensi yang dibuat hari ini. Klik &quot;Buat Sesi Absensi Baru&quot; di atas.
          </div>
        ) : (
          sesiList.map((sesi) => (
            <div key={sesi.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 font-bold rounded-lg text-xs">
                  Pertemuan {sesi.pertemuanKe}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(sesi.tanggal).toLocaleDateString('id-ID')}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{sesi.mapel?.namaMapel || 'Mata Pelajaran'}</h3>
                <p className="text-xs text-slate-500">{sesi.kelas?.namaKelas || 'Kelas X IPA 1'}</p>
                <p className="text-xs text-slate-600 mt-1 italic">&quot;{sesi.keterangan || '-'}&quot;</p>
              </div>
              <div className="pt-4 border-t grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-green-50 p-2 rounded-lg text-green-700">
                  <div className="font-bold text-sm">
                    {sesi.details?.filter((d) => d.status === 'HADIR').length || 0}
                  </div>
                  Hadir
                </div>
                <div className="bg-blue-50 p-2 rounded-lg text-blue-700">
                  <div className="font-bold text-sm">
                    {sesi.details?.filter((d) => d.status === 'IZIN').length || 0}
                  </div>
                  Izin
                </div>
                <div className="bg-amber-50 p-2 rounded-lg text-amber-700">
                  <div className="font-bold text-sm">
                    {sesi.details?.filter((d) => d.status === 'SAKIT').length || 0}
                  </div>
                  Sakit
                </div>
                <div className="bg-red-50 p-2 rounded-lg text-red-700">
                  <div className="font-bold text-sm">
                    {sesi.details?.filter((d) => d.status === 'ALFA').length || 0}
                  </div>
                  Alfa
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Buat Sesi Baru */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-800 border-b pb-3">Input Sesi Absensi Siswa</h2>

            <form onSubmit={handleSaveAbsensi} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kelas</label>
                  <input
                    type="text"
                    value={formSesi.kelasId}
                    onChange={(e) => setFormSesi({ ...formSesi, kelasId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mata Pelajaran</label>
                  <input
                    type="text"
                    value={formSesi.mapelId}
                    onChange={(e) => setFormSesi({ ...formSesi, mapelId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pertemuan Ke-</label>
                  <input
                    type="number"
                    value={formSesi.pertemuanKe}
                    onChange={(e) => setFormSesi({ ...formSesi, pertemuanKe: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Keterangan Materi</label>
                  <input
                    type="text"
                    value={formSesi.keterangan}
                    onChange={(e) => setFormSesi({ ...formSesi, keterangan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">Daftar Kehadiran Siswa</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-xl p-3">
                  {dummySiswas.map((siswa) => (
                    <div
                      key={siswa.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-sm"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">{siswa.nama}</div>
                        <div className="text-xs text-slate-400">NIS: {siswa.nis}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        {(['HADIR', 'IZIN', 'SAKIT', 'ALFA'] as const).map((st) => (
                          <button
                            type="button"
                            key={st}
                            onClick={() => setRecords({ ...records, [siswa.id]: st })}
                            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                              records[siswa.id] === st
                                ? st === 'HADIR'
                                  ? 'bg-green-600 text-white'
                                  : st === 'IZIN'
                                  ? 'bg-blue-600 text-white'
                                  : st === 'SAKIT'
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-red-600 text-white'
                                : 'bg-white text-slate-600 border border-slate-200'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Simpan Absensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
