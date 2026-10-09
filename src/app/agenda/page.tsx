import type { Metadata } from "next";
import Link from "next/link";
import { agenda } from "@/lib/data";

export const metadata: Metadata = {
  title: "Agenda",
  description: "Agenda dan kalender kegiatan SMA Nusantara Bangsa.",
};

const catColors: Record<string, string> = {
  Akademik: "bg-[#E8F0FE] text-[#1A73E8]",
  Kegiatan: "bg-[#E6F4EA] text-[#137333]",
  PPDB:     "bg-[#F3E8FD] text-[#A152F9]",
  Libur:    "bg-[#FCE8E6] text-[#C5221F]",
};

export default function AgendaPage() {
  return (
    <>
      <div className="pt-32 pb-16 bg-[var(--bg-secondary)] border-b border-[var(--border-light)]">
        <div className="max-w-[1000px] mx-auto px-6 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-white gemini-border px-4 py-1.5 rounded-full shadow-sm mb-6">
            <svg className="w-4 h-4 text-[var(--accent-blue)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span className="text-sm font-medium text-[var(--text-secondary)]">Kalender Sekolah</span>
          </div>
          <h1 className="text-[2.5rem] md:text-[4rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)] leading-tight mb-6">
            Agenda <span className="gemini-text-gradient">Kegiatan</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto leading-relaxed">
            Jadwal kegiatan akademik dan non-akademik SMA Nusantara Bangsa.
          </p>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 py-20">
        <div className="flex flex-col gap-5">
          {agenda.map((a) => {
            const d = new Date(a.tanggal);
            const day = d.toLocaleDateString("id-ID", { day: "numeric" });
            const month = d.toLocaleDateString("id-ID", { month: "short" });
            const year = d.getFullYear();
            return (
              <div key={a.id} className="flex gap-6 items-center bg-white rounded-gemini p-5 gemini-border gemini-card-hover group">
                {/* Date Box */}
                <div className="flex-shrink-0 w-[80px] h-[80px] flex flex-col items-center justify-center bg-[var(--bg-secondary)] rounded-gemini-sm border border-[var(--border-color)] group-hover:bg-[#E8F0FE] group-hover:border-[var(--accent-blue)] transition-colors">
                  <div className="text-2xl font-medium font-[var(--font-outfit)] text-[var(--text-primary)] leading-none">{day}</div>
                  <div className="text-sm font-medium text-[var(--text-secondary)] uppercase mt-1">{month}</div>
                </div>
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className={`text-[0.6875rem] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${catColors[a.kategori] ?? "bg-[#F8F9FA] text-[#5F6368]"}`}>{a.kategori}</span>
                  </div>
                  <h2 className="text-xl font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] transition-colors mb-2">{a.judul}</h2>
                  <div className="flex gap-5 text-[0.9375rem] text-[var(--text-secondary)] flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[var(--text-tertiary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {a.lokasi}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[var(--text-tertiary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {a.waktu}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
