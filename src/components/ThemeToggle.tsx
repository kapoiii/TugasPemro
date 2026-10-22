'use client'

import React, { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle({ className = '', showLabel = false }: { className?: string; showLabel?: boolean }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const syncThemeFromDom = () => {
      const isDark =
        document.documentElement.classList.contains('dark') ||
        document.documentElement.getAttribute('data-theme') === 'dark' ||
        localStorage.getItem('theme') === 'dark'
      setTheme(isDark ? 'dark' : 'light')
    }

    syncThemeFromDom()

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<'light' | 'dark'>
      if (customEvent.detail) {
        setTheme(customEvent.detail)
      } else {
        syncThemeFromDom()
      }
    }

    window.addEventListener('theme-change', handleThemeChange)
    window.addEventListener('storage', syncThemeFromDom)
    return () => {
      window.removeEventListener('theme-change', handleThemeChange)
      window.removeEventListener('storage', syncThemeFromDom)
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
    }

    window.dispatchEvent(new CustomEvent('theme-change', { detail: nextTheme }))
  }

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-full bg-slate-100/60 dark:bg-slate-800/60 ${className}`} />
    )
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
      title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
      className={`inline-flex items-center justify-center gap-1.5 p-2 rounded-full transition-all duration-200 border cursor-pointer ${
        theme === 'dark'
          ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700 shadow-sm'
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
      } ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-90" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 -rotate-12 hover:rotate-0" />
      )}
      {showLabel && (
        <span className="text-xs font-semibold pr-1">
          {theme === 'dark' ? 'Mode Gelap' : 'Mode Terang'}
        </span>
      )}
    </button>
  )
}
