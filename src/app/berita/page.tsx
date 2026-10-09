import type { Metadata } from "next";
import { berita } from "@/lib/data";
import BeritaClient from "./BeritaClient";

export const metadata: Metadata = {
  title: "Berita",
  description: "Berita terbaru SMA Nusantara Bangsa – prestasi, kegiatan, dan informasi akademik.",
};

export default function BeritaPage() {
  return (
    <>
      <div className="pt-32 pb-16 bg-[var(--bg-secondary)] border-b border-[var(--border-light)]">
        <div className="max-w-[1000px] mx-auto px-6 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-white gemini-border px-4 py-1.5 rounded-full shadow-sm mb-6">
            <svg className="w-4 h-4 text-[var(--accent-blue)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
            <span className="text-sm font-medium text-[var(--text-secondary)]">Kabar Sekolah</span>
          </div>
          <h1 className="text-[2.5rem] md:text-[4rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)] leading-tight mb-6">
            Berita &amp; <span className="gemini-text-gradient">Artikel</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto leading-relaxed">
            Ikuti terus perkembangan, prestasi, dan kegiatan terbaru dari seluruh civitas akademika.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <BeritaClient allBerita={berita} />
      </div>
    </>
  );
}
