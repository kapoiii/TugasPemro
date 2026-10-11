'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Check, X, Clock, Search } from 'lucide-react'

interface PPDBItem {
  id: string
  noPendaftaran: string
  namaLengkap: string
  nisn: string
  pilihanJurusan: string
  createdAt: string
  status: 'PENDING' | 'DITERIMA' | 'DITOLAK'
  noHp: string
  tempatLahir: string
  tanggalLahir: string
  namaAyah: string
  namaIbu: string
  alamat: string
}

export default function GuruPPDBPage() {
  const [listPPDB, setListPPDB] = useState<PPDBItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [selectedItem, setSelectedItem] = useState<PPDBItem | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [catatan, setCatatan] = useState('')

  const fetchPPDB = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ppdb')
      const data = await res.json()
      if (data.success) {
        setListPPDB(data.data)
      }
    } catch {
      // ignore fetch error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPPDB()
  }, [fetchPPDB])

  const handleVerify = async (id: string, status: 'DITERIMA' | 'DITOLAK') => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/ppdb/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, catatan }),
      })
      const data = await res.json()
      if (data.success) {
        setSelectedItem(null)
        setCatatan('')
        fetchPPDB()
      } else {
        alert(data.message)
      }
    } catch {
      alert('Gagal memproses verifikasi')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredData = listPPDB.filter((item) => {
    const matchesSearch =
      item.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
      item.noPendaftaran.toLowerCase().includes(search.toLowerCase()) ||
      item.nisn.includes(search)
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Verifikasi Penerimaan Siswa Baru (PPDB)</h1>
          <p className="text-sm text-slate-500">Kelola dan verifikasi berkas calon siswa baru</p>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Nama / NISN / No Reg..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700"
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING">PENDING</option>
            <option value="DITERIMA">DITERIMA</option>
            <option value="DITOLAK">DITOLAK</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Memuat data PPDB...</div>
        ) : filteredData.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Tidak ada pendaftar ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">No. Reg</th>
                  <th className="py-3 px-4">Nama & NISN</th>
                  <th className="py-3 px-4">Jurusan</th>
                  <th className="py-3 px-4">Tgl Daftar</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600">{item.noPendaftaran}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{item.namaLengkap}</div>
                      <div className="text-xs text-slate-400">NISN: {item.nisn} | HP: {item.noHp}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                        {item.pilihanJurusan}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {new Date(item.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          item.status === 'DITERIMA'
                            ? 'bg-green-100 text-green-700'
                            : item.status === 'DITOLAK'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {item.status === 'DITERIMA' && <Check className="w-3.5 h-3.5" />}
                        {item.status === 'DITOLAK' && <X className="w-3.5 h-3.5" />}
                        {item.status === 'PENDING' && <Clock className="w-3.5 h-3.5" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-all text-xs"
                      >
                        Detail & Verifikasi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail & Verifikasi */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-bold text-slate-800">Detail Pendaftar PPDB</h2>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs">No Pendaftaran</p>
                <p className="font-semibold text-blue-600">{selectedItem.noPendaftaran}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">NISN</p>
                <p className="font-semibold text-slate-800">{selectedItem.nisn}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Nama Lengkap</p>
                <p className="font-semibold text-slate-800">{selectedItem.namaLengkap}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Pilihan Jurusan</p>
                <p className="font-semibold text-slate-800">{selectedItem.pilihanJurusan}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Tempat, Tgl Lahir</p>
                <p className="font-medium text-slate-800">
                  {selectedItem.tempatLahir}, {new Date(selectedItem.tanggalLahir).toLocaleDateString('id-ID')}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">No WhatsApp</p>
                <p className="font-medium text-slate-800">{selectedItem.noHp}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Orang Tua (Ayah / Ibu)</p>
                <p className="font-medium text-slate-800">{selectedItem.namaAyah} / {selectedItem.namaIbu}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-400 text-xs">Alamat Rumah</p>
                <p className="font-medium text-slate-800">{selectedItem.alamat}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                Catatan Verifikator (Wali / Guru)
              </label>
              <textarea
                rows={2}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Alasan penerimaan / penolakan..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                disabled={actionLoading}
                onClick={() => handleVerify(selectedItem.id, 'DITOLAK')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition-all"
              >
                Tolak Pendaftaran
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleVerify(selectedItem.id, 'DITERIMA')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition-all"
              >
                Terima Pendaftaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
