"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Berita = {
  id: string;
  judul: string;
  tanggal: string;
  kategori: string;
  gambar: string;
  ringkasan: string;
  isi: string;
};

const CATEGORIES = ["Semua", "Prestasi", "Kegiatan", "Akademik"];
const PER_PAGE = 6;

export default function BeritaClient({ allBerita }: { allBerita: Berita[] }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Semua");
  const [page, setPage] = useState(1);

  const filtered = allBerita.filter((b) => {
    const matchQ = b.judul.toLowerCase().includes(query.toLowerCase()) ||
      b.ringkasan.toLowerCase().includes(query.toLowerCase());
    const matchC = cat === "Semua" || b.kategori === cat;
    return matchQ && matchC;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-12">
        <div className="flex gap-2 flex-wrap w-full md:w-auto">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => { setCat(c); setPage(1); }}
              className={`px-5 py-2.5 text-[0.9375rem] font-medium rounded-full transition-all border ${cat === c ? "bg-[var(--text-primary)] text-white border-[var(--text-primary)] shadow-sm" : "bg-white text-[var(--text-secondary)] border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Cari berita..."
            className="w-full pl-12 pr-5 py-3 bg-white border border-[var(--border-color)] rounded-full text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)] focus:ring-1 focus:ring-[var(--accent-blue)] transition-all placeholder-[var(--text-tertiary)]"
          />
        </div>
      </div>

      {/* Grid */}
      {paginated.length === 0 ? (
        <div className="text-center py-20 bg-[var(--bg-secondary)] rounded-gemini gemini-border">
          <svg className="w-12 h-12 mx-auto mb-4 text-[var(--text-tertiary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <p className="text-[var(--text-secondary)] font-medium text-lg">Tidak ada berita yang ditemukan.</p>
          <p className="text-[var(--text-tertiary)] mt-2">Coba ubah kata kunci atau kategori pencarian.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginated.map((b) => (
            <article key={b.id} className="bg-white gemini-border rounded-gemini overflow-hidden flex flex-col gemini-card-hover group">
              <Link href={`/berita/${b.id}`} className="block overflow-hidden relative aspect-[4/3] bg-[var(--bg-tertiary)]">
                <Image src={b.gambar} alt={b.judul} width={400} height={300} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-md text-[var(--text-primary)] text-xs font-semibold px-3 py-1.5 rounded-full">
                    {b.kategori}
                  </span>
                </div>
              </Link>
              <div className="p-6 flex flex-col flex-1">
                <span className="text-xs text-[var(--text-tertiary)] mb-3">{b.tanggal}</span>
                <h3 className="text-[1.25rem] font-medium font-[var(--font-outfit)] text-[var(--text-primary)] leading-snug mb-3">
                  <Link href={`/berita/${b.id}`} className="hover:text-[var(--accent-blue)] transition-colors">{b.judul}</Link>
                </h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-3 mt-auto">
                  {b.ringkasan}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-16">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-10 h-10 rounded-full border border-[var(--border-color)] bg-white text-[var(--text-secondary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)] disabled:opacity-50 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-full font-medium transition-all ${p === page ? "bg-[var(--text-primary)] text-white" : "bg-white text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]"}`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-10 h-10 rounded-full border border-[var(--border-color)] bg-white text-[var(--text-secondary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)] disabled:opacity-50 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      )}
    </>
  );
}
