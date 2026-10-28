import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSiteContent } from "@/lib/siteContent";

export const metadata: Metadata = {
  title: "SMA Nusantara Bangsa – Website Resmi Sekolah",
  description:
    "Website resmi SMA Nusantara Bangsa: profil, PPDB, berita, pengumuman, akademik, dan kontak sekolah.",
};

export default function BerandaPage() {
  const content = getSiteContent();
  const stats = content.general.stats;
  const latestBerita = content.berita.slice(0, 3);
  const latestAnn = content.pengumuman.slice(0, 3);
  const kepsek = content.guru.find((g) => g.jabatan.toLowerCase().includes("kepala sekolah")) || content.guru[0];

  return (
    <>
      {/* ======= HERO ======= */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-[var(--bg-primary)]">
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[var(--bg-secondary)] via-[var(--bg-primary)]/80 to-[var(--bg-primary)] pointer-events-none" />

        <div className="relative max-w-[1200px] mx-auto px-6 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-[var(--bg-primary)] dark:bg-slate-800 border border-[var(--border-light)] dark:border-slate-700 px-4 py-1.5 rounded-full shadow-sm mb-8">
            <svg className="w-4 h-4 text-[var(--accent-blue)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>
            <span className="text-sm font-medium text-[var(--text-secondary)]">{content.general.heroBadge}</span>
          </div>

          <h1 className="font-[var(--font-outfit)] text-[2.75rem] md:text-[4rem] lg:text-[5rem] font-medium leading-[1.1] tracking-tight text-[var(--text-primary)] mb-6 max-w-4xl mx-auto">
            {content.general.heroTitle}
          </h1>

          <p className="text-[var(--text-secondary)] text-[1.125rem] leading-relaxed mb-10 max-w-2xl mx-auto">
            {content.general.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/ppdb" className="btn-gemini btn-gemini-primary w-full sm:w-auto px-8 py-3.5 text-base">
              Info PPDB 2026
            </Link>
            <Link href="/profil" className="btn-gemini btn-gemini-secondary w-full sm:w-auto px-8 py-3.5 text-base">
              Jelajahi Profil
            </Link>
          </div>

          <div className="relative max-w-5xl mx-auto rounded-gemini overflow-hidden border border-[var(--border-light)] dark:border-slate-700 shadow-elevated group aspect-[2/1]">
            <Image
              src={content.general.heroImage}
              alt={content.general.schoolName}
              fill
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-in-out"
              priority
              unoptimized
            />
          </div>
        </div>
      </section>

      {/* ======= STATS ======= */}
      <section className="py-16 bg-[var(--bg-primary)] border-b border-[var(--border-light)] dark:border-slate-800">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 divide-x divide-[var(--border-light)] dark:divide-slate-800">
            {stats.map((s, i) => (
              <div key={s.label} className={`text-center ${i % 2 === 0 ? 'border-none md:border-solid' : 'border-none'}`}>
                <div className="text-[2.5rem] md:text-[3rem] font-[var(--font-outfit)] font-light text-[var(--text-primary)] leading-tight">{s.num}</div>
                <div className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======= PENGUMUMAN ======= */}
      <section className="py-24 bg-[var(--bg-secondary)]">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-baseline justify-between gap-4 mb-12">
            <h2 className="text-[2rem] md:text-[2.5rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)]">
              Pengumuman
            </h2>
            <Link href="/pengumuman" className="text-[var(--accent-blue)] font-medium hover:underline flex items-center gap-1">
              Lihat semua pengumuman <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {latestAnn.map((ann) => (
              <Link
                key={ann.id}
                href="/pengumuman"
                className="bg-[var(--bg-primary)] dark:bg-slate-800/90 rounded-gemini p-6 md:p-8 gemini-border dark:border-slate-700 gemini-card-hover flex flex-col md:flex-row gap-4 justify-between items-start md:items-center group"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {ann.penting && (
                      <span className="bg-[#FEF7E0] dark:bg-amber-950/60 text-[#B06000] dark:text-amber-300 border border-amber-300/40 text-xs font-semibold px-3 py-1 rounded-full">
                        Penting
                      </span>
                    )}
                    <span className="text-[var(--text-tertiary)] text-sm">{ann.tanggal}</span>
                  </div>
                  <h3 className="text-xl font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] transition-colors">
                    {ann.judul}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0 group-hover:bg-[#E8F0FE] dark:group-hover:bg-slate-700 transition-colors">
                  <svg className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--accent-blue)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ======= BERITA ======= */}
      <section className="py-24 bg-[var(--bg-primary)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-baseline justify-between gap-4 mb-12">
            <h2 className="text-[2rem] md:text-[2.5rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)]">
              Kabar Terbaru
            </h2>
            <Link href="/berita" className="text-[var(--accent-blue)] font-medium hover:underline flex items-center gap-1">
              Telusuri berita <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestBerita.map((b) => (
              <article key={b.id} className="bg-[var(--bg-primary)] dark:bg-slate-800/90 gemini-border dark:border-slate-700 rounded-gemini overflow-hidden flex flex-col gemini-card-hover group">
                <Link href={`/berita/${b.id}`} className="block overflow-hidden relative aspect-[4/3] bg-[var(--bg-tertiary)]">
                  <Image
                    src={b.gambar}
                    alt={b.judul}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[var(--text-primary)] text-xs font-semibold px-3 py-1.5 rounded-full shadow-xs">
                      {b.kategori}
                    </span>
                  </div>
                </Link>
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-xs text-[var(--text-tertiary)] mb-3">{b.tanggal}</span>
                  <h3 className="text-[1.25rem] font-medium font-[var(--font-outfit)] text-[var(--text-primary)] leading-snug mb-3">
                    <Link href={`/berita/${b.id}`} className="hover:text-[var(--accent-blue)] transition-colors">
                      {b.judul}
                    </Link>
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-2 mt-auto">
                    {b.ringkasan}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ======= SAMBUTAN ======= */}
      <section className="py-24 bg-[var(--bg-secondary)] border-y border-[var(--border-light)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid md:grid-cols-[auto_1fr] gap-12 lg:gap-20 items-center">
            <div className="mx-auto md:mx-0 w-64 h-64 md:w-80 md:h-80 relative rounded-gemini-full overflow-hidden gemini-border shadow-elevated">
              <Image
                src={kepsek.foto}
                alt={kepsek.nama}
                width={400}
                height={400}
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                unoptimized
              />
            </div>
            <div>
              <h2 className="text-[2rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)] mb-6">
                &quot;Kami hadir untuk mendukung setiap siswa meraih potensi terbaiknya.&quot;
              </h2>
              <p className="text-[var(--text-secondary)] text-[1.0625rem] leading-relaxed mb-8 max-w-2xl">
                Selamat datang di SMA Nusantara Bangsa. Kami berkomitmen untuk mencetak generasi muda yang tidak hanya cerdas secara intelektual, tetapi juga memiliki karakter mulia dan siap menghadapi tantangan global melalui lingkungan belajar yang inovatif.
              </p>
              <div>
                <p className="font-semibold text-[var(--text-primary)] text-lg">{kepsek.nama}</p>
                <p className="text-[var(--text-tertiary)]">{kepsek.jabatan}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======= CTA PPDB ======= */}
      <section className="py-24 bg-[var(--bg-primary)] relative overflow-hidden border-t border-[var(--border-light)] dark:border-slate-800">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[#E8F0FE] to-[#F3E8FD] dark:from-blue-900/20 dark:to-purple-900/20 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="relative max-w-[800px] mx-auto px-6 text-center">
          <h2 className="font-[var(--font-outfit)] text-[2.5rem] md:text-[3.5rem] font-medium text-[var(--text-primary)] leading-tight mb-6">
            Siap menjadi bagian dari <br />
            <span className="gemini-text-gradient">Nusantara Bangsa?</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-lg mb-10 max-w-xl mx-auto">
            Pendaftaran peserta didik baru gelombang pertama tahun ajaran 2026/2027 telah dibuka.
          </p>
          <Link href="/ppdb" className="btn-gemini btn-gemini-primary px-10 py-4 text-lg">
            Mulai Pendaftaran
          </Link>
        </div>
      </section>
    </>
  );
}
