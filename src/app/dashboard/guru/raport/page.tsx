'use client'

import React, { useState, useEffect } from 'react'
import { FileCheck, Printer, Plus, Award } from 'lucide-react'

interface RaportItem {
  id: string
  siswaId: string
  kelasId: string
  semester: string
  tahunAjaran: string
  rataRataNilai: number
  totalHadir: number
  totalIzin: number
  totalSakit: number
  totalAlfa: number
  catatanWaliKelas?: string
  siswa?: { namaLengkap: string }
  kelas?: { namaKelas: string }
}

export default function GuruRaportPage() {
  const [raportList, setRaportList] = useState<RaportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const [formRaport, setFormRaport] = useState({
    siswaId: 'siswa-1',
    kelasId: 'X-IPA-1',
    semester: '1',
    tahunAjaran: '2025/2026',
    catatanWaliKelas: 'Pertahankan prestasi dan tingkatkan keaktifan di kelas.',
  })

  useEffect(() => {
    let isMounted = true
    fetch('/api/raport')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success) {
          setRaportList(data.data)
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

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/raport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formRaport),
      })
      const data = await res.json()
      if (data.success) {
        setShowModal(false)
        const updatedRes = await fetch('/api/raport')
        const updatedData = await updatedRes.json()
        if (updatedData.success) {
          setRaportList(updatedData.data)
        }
      } else {
        alert(data.message)
      }
    } catch {
      alert('Gagal me-generate raport')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Penerbitan Raport Digital</h1>
          <p className="text-sm text-slate-500">Generate & Publikasi Raport Digital Semester per Kelas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 text-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Generate Raport Baru
        </button>
      </div>

      {/* List Raport Cards */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Memuat data raport...</div>
        ) : raportList.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Belum ada raport yang diterbitkan. Klik &quot;Generate Raport Baru&quot; di atas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Kelas / Semester</th>
                  <th className="py-3 px-4">Rata-Rata Nilai</th>
                  <th className="py-3 px-4">Rekap Absensi (H/I/S/A)</th>
                  <th className="py-3 px-4">Catatan Wali Kelas</th>
                  <th className="py-3 px-4 text-right">Cetak / Export</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {raportList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {item.siswa?.namaLengkap || item.siswaId}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.kelas?.namaKelas || item.kelasId} | Sem {item.semester} ({item.tahunAjaran})
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-600 flex items-center gap-1">
                      <Award className="w-4 h-4 text-amber-500" />
                      {item.rataRataNilai}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono">
                      <span className="text-green-600 font-bold">{item.totalHadir}H</span> /{' '}
                      <span className="text-blue-600">{item.totalIzin}I</span> /{' '}
                      <span className="text-amber-600">{item.totalSakit}S</span> /{' '}
                      <span className="text-red-600">{item.totalAlfa}A</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 italic max-w-xs truncate">
                      &quot;{item.catatanWaliKelas || '-'}&quot;
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => window.print()}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 ml-auto"
                      >
                        <Printer className="w-3.5 h-3.5" /> Cetak PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Generate Raport */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6">
            <h2 className="text-xl font-bold text-slate-800 border-b pb-3">Generate Raport Digital</h2>

            <form onSubmit={handleGenerate} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ID Siswa</label>
                <input
                  type="text"
                  value={formRaport.siswaId}
                  onChange={(e) => setFormRaport({ ...formRaport, siswaId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ID Kelas</label>
                <input
                  type="text"
                  value={formRaport.kelasId}
                  onChange={(e) => setFormRaport({ ...formRaport, kelasId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Catatan Wali Kelas</label>
                <textarea
                  rows={3}
                  value={formRaport.catatanWaliKelas}
                  onChange={(e) => setFormRaport({ ...formRaport, catatanWaliKelas: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs"
                />
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
                  <FileCheck className="w-4 h-4" /> Publish Raport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
