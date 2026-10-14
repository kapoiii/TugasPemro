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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-4">
            <School className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Portal Akademik Terpadu</h2>
          <p className="text-sm text-slate-500 mt-1">
            Masuk sesuai dengan hak akses Anda (Siswa, Guru, atau Admin)
          </p>
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

        <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-2">
          <p className="text-xs text-slate-500">
            Belum mendaftar sebagai Siswa Baru?{' '}
            <a href="/ppdb/daftar" className="text-blue-600 font-semibold hover:underline">
              Daftar PPDB Online
            </a>
          </p>
          <p className="text-[11px] text-slate-400">
            Protected by Role-Based Access Control (RBAC) & Next.js Secure Cookies
          </p>
        </div>
      </div>
    </div>
  )
}
