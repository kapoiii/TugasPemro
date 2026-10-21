'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function GuruNilaiRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/guru?tab=nilai')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-800">Membuka Tab Penilaian Guru...</p>
        <p className="text-xs text-slate-500 mt-1">Mengalihkan ke modul penilaian terintegrasi</p>
      </div>
    </div>
  )
}
