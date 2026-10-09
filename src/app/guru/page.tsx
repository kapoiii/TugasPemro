import type { Metadata } from "next";
import Image from "next/image";
import { guru } from "@/lib/data";

export const metadata: Metadata = {
  title: "Guru & Staf",
  description: "Daftar guru dan staf SMA Nusantara Bangsa beserta jabatan dan mata pelajaran.",
};

export default function GuruPage() {
  const kepala = guru.filter((g) => g.jabatan === "Kepala Sekolah");
  const wakil  = guru.filter((g) => g.jabatan.startsWith("Wakil"));
  const guruBiasa = guru.filter((g) => g.jabatan === "Guru");

  return (
    <>
      <div className="pt-32 pb-16 bg-[var(--bg-secondary)] border-b border-[var(--border-light)]">
        <div className="max-w-[1000px] mx-auto px-6 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-white gemini-border px-4 py-1.5 rounded-full shadow-sm mb-6">
            <svg className="w-4 h-4 text-[var(--accent-purple)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75"/></svg>
            <span className="text-sm font-medium text-[var(--text-secondary)]">Tenaga Pendidik</span>
          </div>
          <h1 className="text-[2.5rem] md:text-[4rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)] leading-tight mb-6">
            Guru &amp; <span className="gemini-text-gradient">Staf</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto leading-relaxed">
            Mengenal para pendidik berdedikasi yang membimbing siswa-siswi SMA Nusantara Bangsa menuju prestasi.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-20 space-y-24">
        {/* Pimpinan */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-[2rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)]">Pimpinan Sekolah</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center sm:items-stretch">
            {[...kepala, ...wakil].map((g) => (
              <div key={g.id} className="bg-white rounded-gemini gemini-border shadow-subtle p-6 w-full max-w-[280px] text-center flex flex-col items-center gemini-card-hover group">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-[var(--bg-secondary)] group-hover:border-[var(--accent-blue)] transition-colors">
                  <Image src={g.foto} alt={g.nama} width={128} height={128} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-medium text-[1.125rem] text-[var(--text-primary)] mb-1 leading-snug">{g.nama}</h3>
                <p className="text-[var(--accent-blue)] text-[0.9375rem] font-medium mb-1">{g.jabatan}</p>
                {g.mapel && <p className="text-[var(--text-tertiary)] text-sm">{g.mapel}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Guru */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-[2rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)]">Dewan Guru</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {guruBiasa.map((g) => (
              <div key={g.id} className="bg-white rounded-gemini gemini-border p-5 text-center flex flex-col items-center gemini-card-hover group">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-[var(--bg-secondary)] group-hover:border-[#E8F0FE] transition-colors">
                  <Image src={g.foto} alt={g.nama} width={96} height={96} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-medium text-[1.0625rem] text-[var(--text-primary)] mb-1 leading-snug">{g.nama}</h3>
                <p className="text-[var(--text-secondary)] text-sm mb-1">{g.jabatan}</p>
                {g.mapel && <p className="text-[var(--accent-blue)] text-sm font-medium">{g.mapel}</p>}
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <p className="text-[var(--text-secondary)] bg-[var(--bg-secondary)] inline-block px-6 py-3 rounded-full text-sm">
              Menampilkan {guruBiasa.length} dari total 78 pendidik. Data lengkap tersedia di tata usaha sekolah.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
