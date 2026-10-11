'use client'

import React, { useState, useEffect } from 'react'
import { Calculator, Save, Plus } from 'lucide-react'

interface NilaiRecord {
  id: string
  siswaId: string
  mapelId: string
  nilaiTugas: number
  nilaiUts: number
  nilaiUas: number
  nilaiPraktik: number
  nilaiSikap: number
  nilaiAkhir: number
  predikat: string
  siswa?: { namaLengkap: string }
  mapel?: { namaMapel: string }
}

export default function GuruNilaiPage() {
  const [nilaiList, setNilaiList] = useState<NilaiRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const [formNilai, setFormNilai] = useState({
    siswaId: 'siswa-1',
    kelasId: 'X-IPA-1',
    mapelId: 'MTK-10',
    semester: '1',
    tahunAjaran: '2025/2026',
    nilaiTugas: 85,
    nilaiUts: 80,
    nilaiUas: 90,
    nilaiPraktik: 88,
    nilaiSikap: 90,
    catatan: 'Sangat baik dalam pemahaman aljabar',
  })

  useEffect(() => {
    let isMounted = true
    fetch('/api/nilai')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success) {
          setNilaiList(data.data)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const handleSaveNilai = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/nilai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formNilai),
      })
      const data = await res.json()
      if (data.success) {
        setShowModal(false)
        const updatedRes = await fetch('/api/nilai')
        const updatedData = await updatedRes.json()
        if (updatedData.success) {
          setNilaiList(updatedData.data)
        }
      } else {
        alert(data.message)
      }
    } catch {
      alert('Gagal menyimpan nilai')
    }
  }

  const hitungSimulasiAkhir = () => {
    const { nilaiTugas, nilaiUts, nilaiUas, nilaiPraktik, nilaiSikap } = formNilai
    const total =
      Number(nilaiTugas) * 0.2 +
      Number(nilaiUts) * 0.25 +
      Number(nilaiUas) * 0.3 +
      Number(nilaiPraktik) * 0.15 +
      Number(nilaiSikap) * 0.1
    return total.toFixed(2)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Penilaian Akademik</h1>
          <p className="text-sm text-slate-500">Input nilai Tugas, UTS, UAS, Praktik, dan Sikap dengan kalkulasi otomatis</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 text-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Input Nilai Siswa
        </button>
      </div>

      {/* Info Bobot Nilai */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-wrap items-center justify-between text-xs text-blue-800">
        <div className="font-bold text-sm flex items-center gap-2">
          <Calculator className="w-4 h-4" /> Bobot Penilaian Konfigurasi:
        </div>
        <div className="flex gap-4">
          <span>Tugas: <strong>20%</strong></span>
          <span>UTS: <strong>25%</strong></span>
          <span>UAS: <strong>30%</strong></span>
          <span>Praktik: <strong>15%</strong></span>
          <span>Sikap: <strong>10%</strong></span>
        </div>
      </div>

      {/* Table Data Nilai */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Memuat data nilai...</div>
        ) : nilaiList.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Belum ada nilai yang diinput. Klik &quot;Input Nilai Siswa&quot; di atas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Mapel</th>
                  <th className="py-3 px-4">Tugas</th>
                  <th className="py-3 px-4">UTS</th>
                  <th className="py-3 px-4">UAS</th>
                  <th className="py-3 px-4">Praktik</th>
                  <th className="py-3 px-4">Sikap</th>
                  <th className="py-3 px-4">Nilai Akhir</th>
                  <th className="py-3 px-4">Predikat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {nilaiList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-800">{item.siswa?.namaLengkap || item.siswaId}</td>
                    <td className="py-3 px-4 font-medium text-slate-600">{item.mapel?.namaMapel || item.mapelId}</td>
                    <td className="py-3 px-4 text-slate-600">{item.nilaiTugas}</td>
                    <td className="py-3 px-4 text-slate-600">{item.nilaiUts}</td>
                    <td className="py-3 px-4 text-slate-600">{item.nilaiUas}</td>
                    <td className="py-3 px-4 text-slate-600">{item.nilaiPraktik}</td>
                    <td className="py-3 px-4 text-slate-600">{item.nilaiSikap}</td>
                    <td className="py-3 px-4 font-bold text-blue-600">{item.nilaiAkhir}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        item.predikat === 'A' ? 'bg-green-100 text-green-700' :
                        item.predikat === 'B' ? 'bg-blue-100 text-blue-700' :
                        item.predikat === 'C' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        Predikat {item.predikat}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Input Nilai */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-6">
            <h2 className="text-xl font-bold text-slate-800 border-b pb-3">Form Input Nilai Siswa</h2>

            <form onSubmit={handleSaveNilai} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">ID Siswa</label>
                  <input
                    type="text"
                    value={formNilai.siswaId}
                    onChange={(e) => setFormNilai({ ...formNilai, siswaId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">ID Mapel</label>
                  <input
                    type="text"
                    value={formNilai.mapelId}
                    onChange={(e) => setFormNilai({ ...formNilai, mapelId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nilai Tugas (20%)</label>
                  <input
                    type="number"
                    value={formNilai.nilaiTugas}
                    onChange={(e) => setFormNilai({ ...formNilai, nilaiTugas: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nilai UTS (25%)</label>
                  <input
                    type="number"
                    value={formNilai.nilaiUts}
                    onChange={(e) => setFormNilai({ ...formNilai, nilaiUts: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nilai UAS (30%)</label>
                  <input
                    type="number"
                    value={formNilai.nilaiUas}
                    onChange={(e) => setFormNilai({ ...formNilai, nilaiUas: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nilai Praktik (15%)</label>
                  <input
                    type="number"
                    value={formNilai.nilaiPraktik}
                    onChange={(e) => setFormNilai({ ...formNilai, nilaiPraktik: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nilai Sikap (10%)</label>
                  <input
                    type="number"
                    value={formNilai.nilaiSikap}
                    onChange={(e) => setFormNilai({ ...formNilai, nilaiSikap: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div className="bg-blue-50 p-3 rounded-xl flex flex-col justify-center text-center">
                  <span className="text-xs text-blue-600 font-semibold">Estimasi Nilai Akhir:</span>
                  <span className="text-2xl font-bold text-blue-700">{hitungSimulasiAkhir()}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Simpan Nilai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
