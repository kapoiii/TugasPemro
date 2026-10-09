import type { Metadata } from "next";
import Link from "next/link";
import { galeri } from "@/lib/data";
import GaleriClient from "./GaleriClient";

export const metadata: Metadata = {
  title: "Galeri",
  description: "Galeri foto kegiatan SMA Nusantara Bangsa.",
};

export default function GaleriPage() {
  return (
    <>
      <div className="pt-32 pb-16 bg-[var(--bg-secondary)] border-b border-[var(--border-light)]">
        <div className="max-w-[1000px] mx-auto px-6 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-white gemini-border px-4 py-1.5 rounded-full shadow-sm mb-6">
            <svg className="w-4 h-4 text-[var(--accent-pink)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            <span className="text-sm font-medium text-[var(--text-secondary)]">Dokumentasi</span>
          </div>
          <h1 className="text-[2.5rem] md:text-[4rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)] leading-tight mb-6">
            Galeri <span className="gemini-text-gradient">Kegiatan</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto leading-relaxed">
            Kumpulan momen berharga dan aktivitas seru siswa-siswi SMA Nusantara Bangsa.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-20">
        <GaleriClient items={galeri} />
      </div>
    </>
  );
}
