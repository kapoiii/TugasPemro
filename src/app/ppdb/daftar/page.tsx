'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { School, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'

interface PPDBSuccessData {
  noPendaftaran: string
  namaLengkap: string
  nisn: string
  pilihanJurusan: string
}

export default function PPDBDaftarPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    namaLengkap: '',
    nisn: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: 'L',
    agama: 'Islam',
    alamat: '',
    namaAyah: '',
    namaIbu: '',
    noHp: '',
    pilihanJurusan: 'IPA',
    berkasIjazahUrl: '',
    berkasKkUrl: '',
    berkasAkteUrl: '',
  })

  const [loading, setLoading] = useState(false)
  const [successData, setSuccessData] = useState<PPDBSuccessData | null>(null)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/ppdb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await res.json()
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Gagal mengajukan pendaftaran PPDB')
      }

      setSuccessData(result.data as PPDBSuccessData)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-blue-600 mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </button>

        {successData ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Pendaftaran Berhasil Dikirim!</h2>
            <p className="text-slate-600 mb-6">
              Simpan Nomor Pendaftaran Anda di bawah ini untuk mengecek status seleksi PPDB:
            </p>
            <div className="bg-slate-100 p-4 rounded-xl font-mono text-2xl font-bold text-blue-600 inline-block mb-6 tracking-wider">
              {successData.noPendaftaran}
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <p>Nama: <strong>{successData.namaLengkap}</strong></p>
              <p>NISN: <strong>{successData.nisn}</strong></p>
              <p>Jurusan: <strong>{successData.pilihanJurusan}</strong></p>
            </div>
            <div className="mt-8">
              <a
                href="/login"
                className="inline-block py-3 px-6 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all"
              >
                Masuk ke Portal Login
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            <div className="border-b border-slate-100 pb-6 mb-8">
              <div className="flex items-center gap-3 mb-2">
                <School className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-slate-800">Formulir Pendaftaran PPDB Online</h1>
              </div>
              <p className="text-sm text-slate-500">
                Isi data calon siswa secara lengkap dan akurat sesuai ijazah/akta kelahiran.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Data Diri Calon Siswa */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                  1. Data Diri Calon Siswa
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nama Lengkap *</label>
                    <input
                      type="text"
                      name="namaLengkap"
                      required
                      value={formData.namaLengkap}
                      onChange={handleChange}
                      placeholder="Sesuai Ijazah"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">NISN *</label>
                    <input
                      type="text"
                      name="nisn"
                      required
                      value={formData.nisn}
                      onChange={handleChange}
                      placeholder="10 Digit NISN"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tempat Lahir *</label>
                    <input
                      type="text"
                      name="tempatLahir"
                      required
                      value={formData.tempatLahir}
                      onChange={handleChange}
                      placeholder="Kota Lahir"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tanggal Lahir *</label>
                    <input
                      type="date"
                      name="tanggalLahir"
                      required
                      value={formData.tanggalLahir}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Jenis Kelamin *</label>
                    <select
                      name="jenisKelamin"
                      value={formData.jenisKelamin}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Pilihan Jurusan *</label>
                    <select
                      name="pilihanJurusan"
                      value={formData.pilihanJurusan}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold text-blue-600"
                    >
                      <option value="IPA">MIPA (Matematika & IPA)</option>
                      <option value="IPS">IPS (Ilmu Pengetahuan Sosial)</option>
                      <option value="BAHASA">Bahasa & Budaya</option>
                      <option value="REKAYASA_PERANGKAT_LUNAK">RPL (Rekayasa Perangkat Lunak)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Data Orang Tua & Kontak */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                  2. Data Orang Tua & Kontak
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nama Ayah *</label>
                    <input
                      type="text"
                      name="namaAyah"
                      required
                      value={formData.namaAyah}
                      onChange={handleChange}
                      placeholder="Nama Lengkap Ayah"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nama Ibu *</label>
                    <input
                      type="text"
                      name="namaIbu"
                      required
                      value={formData.namaIbu}
                      onChange={handleChange}
                      placeholder="Nama Lengkap Ibu"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nomor WhatsApp / HP *</label>
                    <input
                      type="tel"
                      name="noHp"
                      required
                      value={formData.noHp}
                      onChange={handleChange}
                      placeholder="0812XXXXXXXX"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Alamat Rumah Lengkap *</label>
                    <textarea
                      name="alamat"
                      required
                      rows={3}
                      value={formData.alamat}
                      onChange={handleChange}
                      placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Upload Berkas / Dokumen Link */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                  3. Link Berkas Dokumen (Opsional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">URL Ijazah / SKL</label>
                    <input
                      type="url"
                      name="berkasIjazahUrl"
                      value={formData.berkasIjazahUrl}
                      onChange={handleChange}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">URL Kartu Keluarga (KK)</label>
                    <input
                      type="url"
                      name="berkasKkUrl"
                      value={formData.berkasKkUrl}
                      onChange={handleChange}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">URL Akta Kelahiran</label>
                    <input
                      type="url"
                      name="berkasAkteUrl"
                      value={formData.berkasAkteUrl}
                      onChange={handleChange}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Mengirim Pendaftaran...' : 'Kirim Pendaftaran PPDB'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
