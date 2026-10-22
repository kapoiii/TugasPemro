'use client'

import React, { useState, useRef } from 'react'
import { Upload, Link as LinkIcon, Image as ImageIcon, X, Check, FolderOpen } from 'lucide-react'

interface DualImageInputProps {
  label?: string
  value: string
  onChange: (newValue: string) => void
  placeholder?: string
  helperText?: string
  presets?: Array<{ label: string; url: string }>
  aspectRatioClass?: string
  className?: string
}

export default function DualImageInput({
  label = 'Pilih atau Masukkan Gambar',
  value,
  onChange,
  placeholder = 'https://images.unsplash.com/... atau pilih file',
  helperText,
  presets,
  aspectRatioClass = 'aspect-[16/9]',
  className = '',
}: DualImageInputProps) {
  const [activeMode, setActiveMode] = useState<'upload' | 'url'>('upload')
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (file: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar (.jpg, .jpeg, .png, .webp, .svg)')
      return
    }

    setFileName(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`)

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result) {
        onChange(result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
            {label}
          </label>
          <span className="text-[11px] text-slate-400">2 Pilihan: Folder / URL</span>
        </div>
      )}

      {/* Mode Selector Switch */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveMode('upload')}
          className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeMode === 'upload'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Dari Folder / Galeri</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMode('url')}
          className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeMode === 'url'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Dari URL Web</span>
        </button>
      </div>

      {/* Option 1: Upload from Folder / Gallery / Drag & Drop */}
      {activeMode === 'upload' && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[0.99]'
              : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0])
              }
            }}
          />

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Klik untuk Memilih File atau Drag &amp; Drop Gambar ke Sini
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Mendukung file dari galeri atau folder (.PNG, .JPG, .JPEG, .WEBP)
              </p>
            </div>
            {fileName && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold rounded-full border border-emerald-200 dark:border-emerald-800">
                <Check className="w-3 h-3" /> {fileName}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Option 2: Web URL Input */}
      {activeMode === 'url' && (
        <div className="space-y-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <LinkIcon className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={value.startsWith('data:') ? '' : value}
              onChange={(e) => {
                setFileName('')
                onChange(e.target.value)
              }}
              placeholder={placeholder}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
            {value && !value.startsWith('data:') && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-rose-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {helperText && (
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{helperText}</p>
          )}
        </div>
      )}

      {/* Image Preview & Quick Actions */}
      {value && (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900">
          <div className={`relative ${aspectRatioClass} w-full`}>
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLElement).style.display = 'none'
              }}
            />
          </div>
          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            <span className="px-2 py-0.5 bg-black/70 backdrop-blur-md text-[10px] text-white rounded font-mono">
              Live Preview
            </span>
            <button
              type="button"
              onClick={() => {
                onChange('')
                setFileName('')
              }}
              className="p-1 rounded-full bg-rose-600/90 text-white hover:bg-rose-700 shadow-xs cursor-pointer"
              title="Hapus Gambar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Presets if provided */}
      {presets && presets.length > 0 && (
        <div className="pt-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
            Atau Pilih Preset Gambar Cepat:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setFileName('')
                  onChange(p.url)
                }}
                className={`px-2.5 py-1 text-[11px] rounded-lg border transition-all cursor-pointer ${
                  value === p.url
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-400 text-blue-600 dark:text-blue-300 font-bold'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
