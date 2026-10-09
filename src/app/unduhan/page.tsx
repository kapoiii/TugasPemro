import type { Metadata } from "next";
import { unduhan } from "@/lib/data";

export const metadata: Metadata = {
  title: "Unduhan",
  description: "Pusat unduhan dokumen resmi, formulir, dan kalender akademik SMA Nusantara Bangsa.",
};

export default function UnduhanPage() {
  return (
    <>
      <div className="pt-32 pb-16 bg-[var(--bg-secondary)] border-b border-[var(--border-light)]">
        <div className="max-w-[1000px] mx-auto px-6 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-white gemini-border px-4 py-1.5 rounded-full shadow-sm mb-6">
            <svg className="w-4 h-4 text-[var(--accent-blue)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3"/></svg>
            <span className="text-sm font-medium text-[var(--text-secondary)]">Dokumen Resmi</span>
          </div>
          <h1 className="text-[2.5rem] md:text-[4rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)] leading-tight mb-6">
            Pusat <span className="gemini-text-gradient">Unduhan</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto leading-relaxed">
            Temukan formulir, panduan, kalender akademik, dan dokumen penting lainnya di sini.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-20">
        <div className="bg-white rounded-gemini gemini-border shadow-subtle overflow-hidden">
          {/* Header (desktop only) */}
          <div className="hidden md:grid grid-cols-[1fr_150px_150px_150px] gap-4 p-6 bg-[var(--bg-secondary)] border-b border-[var(--border-light)]">
            <span className="font-medium text-[var(--text-secondary)] text-sm uppercase tracking-wider">Nama Dokumen</span>
            <span className="font-medium text-[var(--text-secondary)] text-sm uppercase tracking-wider text-center">Kategori</span>
            <span className="font-medium text-[var(--text-secondary)] text-sm uppercase tracking-wider text-center">Ukuran</span>
            <span className="font-medium text-[var(--text-secondary)] text-sm uppercase tracking-wider text-center">Aksi</span>
          </div>
          
          {/* List */}
          <div className="divide-y divide-[var(--border-light)]">
            {unduhan.map((u) => (
              <div key={u.id} className="grid grid-cols-1 md:grid-cols-[1fr_150px_150px_150px] gap-4 p-6 items-center gemini-card-hover hover:bg-[var(--bg-tertiary)] group transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--accent-blue)] group-hover:bg-white group-hover:shadow-sm transition-all">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--text-primary)] text-[0.9375rem]">{u.nama}</h3>
                    <div className="flex md:hidden gap-3 mt-1 text-xs text-[var(--text-tertiary)]">
                      <span className="bg-[#E8F0FE] text-[var(--accent-blue)] px-2 py-0.5 rounded font-medium">{u.kategori}</span>
                      <span>{u.ukuran} • {u.format}</span>
                    </div>
                  </div>
                </div>
                <div className="hidden md:flex justify-center">
                  <span className="bg-[#E8F0FE] text-[var(--accent-blue)] px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                    {u.kategori}
                  </span>
                </div>
                <div className="hidden md:flex justify-center text-[0.9375rem] text-[var(--text-secondary)]">
                  {u.ukuran} <span className="uppercase text-[var(--text-tertiary)] ml-1">({u.format})</span>
                </div>
                <div className="flex justify-start md:justify-center mt-2 md:mt-0">
                  <a href={u.url} className="btn-gemini btn-gemini-secondary px-5 py-2 text-sm w-full md:w-auto" aria-label={`Unduh ${u.nama}`}>
                    Unduh
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3"/></svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
