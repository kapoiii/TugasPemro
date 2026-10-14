'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, User, LogIn, School, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'SISWA' | 'GURU' | 'ADMIN'>('SISWA')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login gagal. Periksa kembali username dan password Anda.')
      }

      if (data.data.role === 'ADMIN') {
        router.push('/dashboard/admin')
      } else if (data.data.role === 'GURU') {
        router.push('/dashboard/guru')
      } else {
        router.push('/dashboard/siswa')
      }
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat login.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-4 shadow-xs">
            <School className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Portal Akademik Terpadu</h2>
          <p className="text-sm text-slate-500 mt-1">
            Masuk sesuai dengan hak akses Anda (Siswa, Guru, atau Admin)
          </p>
        </div>

        {/* Kebijakan Akun Resmi Sekolah */}
        <div className="mb-5 p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
          <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block text-amber-800">Kebijakan Akun Resmi Sekolah:</span>
            Pembuatan akun baru (Admin, Guru, Siswa) <strong>hanya dapat diterbitkan secara resmi oleh Administrator Sekolah</strong> di dalam sistem. Publik/orang luar tidak dapat membuat akun secara mandiri demi menjaga integritas data akademik.
          </div>
        </div>

        {/* Role Selector Tabs (3 Roles) */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setRole('SISWA')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              role === 'SISWA' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Siswa
          </button>
          <button
            type="button"
            onClick={() => setRole('GURU')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              role === 'GURU' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Guru
          </button>
          <button
            type="button"
            onClick={() => setRole('ADMIN')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              role === 'ADMIN' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Admin
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              {role === 'SISWA' ? 'NISN / Username' : role === 'GURU' ? 'NIP / Username' : 'Username / Email Admin'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={
                  role === 'SISWA'
                    ? 'Masukkan NISN atau Username'
                    : role === 'GURU'
                    ? 'Masukkan NIP atau Username'
                    : 'admin atau email administrator'
                }
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 text-sm transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
              role === 'ADMIN'
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
            }`}
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Masuk ke {role === 'ADMIN' ? 'Portal Admin' : role === 'GURU' ? 'Portal Guru' : 'Portal Siswa'}</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
            Akun Demo (Klik untuk auto-fill):
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => {
                setRole('ADMIN')
                setUsername('admin')
                setPassword('admin123')
              }}
              className="py-1 px-2 bg-white hover:bg-rose-50 hover:text-rose-600 border border-slate-200 rounded text-slate-700 font-medium text-center transition-colors"
            >
              Admin<br /><span className="text-[10px] text-slate-400">admin / admin123</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('GURU')
                setUsername('guru1')
                setPassword('guru123')
              }}
              className="py-1 px-2 bg-white hover:bg-blue-50 hover:text-blue-600 border border-slate-200 rounded text-slate-700 font-medium text-center transition-colors"
            >
              Guru<br /><span className="text-[10px] text-slate-400">guru1 / guru123</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('SISWA')
                setUsername('siswa1')
                setPassword('siswa123')
              }}
              className="py-1 px-2 bg-white hover:bg-emerald-50 hover:text-emerald-600 border border-slate-200 rounded text-slate-700 font-medium text-center transition-colors"
            >
              Siswa<br /><span className="text-[10px] text-slate-400">siswa1 / siswa123</span>
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-3">
          <p className="text-xs text-slate-500">
            Calon Siswa Baru?{' '}
            <a href="/ppdb/daftar" className="text-blue-600 font-semibold hover:underline">
              Pendaftaran PPDB Online
            </a>
            <span className="block text-[11px] text-slate-400 mt-0.5">
              (Akun portal akademik akan diterbitkan resmi oleh Admin Sekolah setelah dinyatakan lolos seleksi)
            </span>
          </p>
          <div className="pt-2">
            <a href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors">
              ← Kembali ke Website Utama
            </a>
          </div>
          <p className="text-[11px] text-slate-400">
            Protected by Role-Based Access Control (RBAC) & Next.js Secure Cookies
          </p>
        </div>
      </div>
    </div>
  )
}
