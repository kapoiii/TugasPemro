import type { Metadata } from "next";
import { pengumuman } from "@/lib/data";

export const metadata: Metadata = {
  title: "Pengumuman",
  description: "Daftar pengumuman resmi SMA Nusantara Bangsa.",
};

export default function PengumumanPage() {
  return (
    <>
      <div className="pt-32 pb-16 bg-[var(--bg-secondary)] border-b border-[var(--border-light)]">
        <div className="max-w-[1000px] mx-auto px-6 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-white gemini-border px-4 py-1.5 rounded-full shadow-sm mb-6">
            <svg className="w-4 h-4 text-[var(--accent-orange)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            <span className="text-sm font-medium text-[var(--text-secondary)]">Informasi Penting</span>
          </div>
          <h1 className="text-[2.5rem] md:text-[4rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)] leading-tight mb-6">
            Pengumuman <span className="gemini-text-gradient">Sekolah</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto leading-relaxed">
            Dapatkan informasi terbaru mengenai jadwal, kegiatan, dan kebijakan sekolah.
          </p>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 py-20">
        <div className="flex flex-col gap-6">
          {pengumuman.map((ann) => (
            <div
              key={ann.id}
              className={`bg-white rounded-gemini p-8 gemini-border gemini-card-hover flex flex-col gap-4 relative overflow-hidden group ${ann.penting ? 'border-l-4 border-l-[#F29900]' : ''}`}
            >
              {ann.penting && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#FEF7E0] rounded-bl-[64px] flex items-start justify-end p-3 -z-0">
                  <svg className="w-5 h-5 text-[#B06000]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L1 21h22M12 6l7.53 13H4.47M11 10v4h2v-4m-2 6v2h2v-2"/></svg>
                </div>
              )}
              <div className="relative z-10 flex flex-col items-start">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  {ann.penting && (
                    <span className="bg-[#FEF7E0] text-[#B06000] text-xs font-semibold px-3 py-1.5 rounded-full">Penting</span>
                  )}
                  <span className="text-[var(--text-tertiary)] text-sm font-medium">{ann.tanggal}</span>
                </div>
                <h2 className="text-2xl font-medium font-[var(--font-outfit)] text-[var(--text-primary)] mb-4">{ann.judul}</h2>
                <p className="text-[var(--text-secondary)] text-[1.0625rem] leading-relaxed">{ann.isi}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
