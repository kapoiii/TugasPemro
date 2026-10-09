import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PPDB",
  description: "Informasi Penerimaan Peserta Didik Baru (PPDB) SMA Nusantara Bangsa.",
};

const alur = [
  { step: 1, title: "Pendaftaran Online", desc: "Mengisi formulir pendaftaran melalui website resmi atau scan QR code yang tersedia." },
  { step: 2, title: "Verifikasi Berkas", desc: "Mengunggah berkas persyaratan (KK, Akta, Rapor) untuk diverifikasi panitia." },
  { step: 3, title: "Tes Seleksi", desc: "Mengikuti tes potensi akademik dan wawancara sesuai jadwal yang ditentukan." },
  { step: 4, title: "Pengumuman", desc: "Melihat hasil seleksi melalui website pada tanggal yang telah ditetapkan." },
  { step: 5, title: "Daftar Ulang", desc: "Melakukan proses daftar ulang bagi calon siswa yang dinyatakan diterima." },
];

export default function PPDBPage() {
  return (
    <>
      <div className="pt-32 pb-16 bg-white border-b border-[var(--border-light)]">
        <div className="max-w-[1000px] mx-auto px-6 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-[#E8F0FE] text-[var(--accent-blue)] px-4 py-1.5 rounded-full mb-6">
            <span className="text-sm font-semibold tracking-wide uppercase">Pendaftaran Dibuka</span>
          </div>
          <h1 className="text-[2.5rem] md:text-[4rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)] leading-tight mb-6">
            Penerimaan Peserta Didik Baru <br className="hidden md:block"/>
            <span className="gemini-text-gradient">Tahun Ajaran 2026/2027</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Bergabunglah bersama SMA Nusantara Bangsa. Tersedia jalur reguler, prestasi, dan afirmasi.
          </p>
          <div className="flex justify-center">
            <Link href="https://forms.google.com" target="_blank" rel="noopener noreferrer" className="btn-gemini btn-gemini-primary px-8 py-4 text-[1.0625rem]">
              Isi Formulir Pendaftaran
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] py-20">
        <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-2 gap-16">
          {/* Persyaratan */}
          <div>
            <h2 className="text-[2rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)] mb-8">Persyaratan Umum</h2>
            <div className="bg-white rounded-gemini p-8 gemini-border shadow-subtle">
              <ul className="flex flex-col gap-5">
                {[
                  "Lulusan SMP/MTs sederajat tahun 2025 atau 2026.",
                  "Berusia maksimal 21 tahun pada bulan Juli 2026.",
                  "Fotokopi Kartu Keluarga (KK) dan Akta Kelahiran.",
                  "Fotokopi Rapor SMP/MTs semester 1-5 yang dilegalisir.",
                  "Pas foto berwarna ukuran 3x4 (4 lembar).",
                  "Sertifikat prestasi akademik/non-akademik (khusus jalur prestasi)."
                ].map((syarat, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <div className="w-6 h-6 rounded-full bg-[#E8F0FE] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-[var(--accent-blue)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                    </div>
                    <span className="text-[var(--text-secondary)] text-[0.9375rem] leading-relaxed">{syarat}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-12">
               <h2 className="text-[2rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)] mb-8">Informasi Biaya</h2>
               <div className="bg-white rounded-gemini gemini-border overflow-hidden">
                 <table className="w-full text-left text-[0.9375rem]">
                   <thead>
                     <tr className="bg-[var(--bg-tertiary)] border-b border-[var(--border-light)]">
                       <th className="py-4 px-6 font-medium text-[var(--text-secondary)]">Komponen Biaya</th>
                       <th className="py-4 px-6 font-medium text-[var(--text-secondary)]">Jumlah</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-[var(--border-light)] text-[var(--text-primary)]">
                     <tr><td className="py-4 px-6">Formulir Pendaftaran</td><td className="py-4 px-6 font-medium">Rp 250.000</td></tr>
                     <tr><td className="py-4 px-6">Uang Pangkal (Gedung & Fasilitas)</td><td className="py-4 px-6 font-medium">Rp 5.000.000</td></tr>
                     <tr><td className="py-4 px-6">Seragam (5 stel)</td><td className="py-4 px-6 font-medium">Rp 1.500.000</td></tr>
                     <tr><td className="py-4 px-6">SPP Bulanan</td><td className="py-4 px-6 font-medium">Rp 500.000</td></tr>
                   </tbody>
                 </table>
               </div>
               <p className="text-sm text-[var(--text-tertiary)] mt-4">* Tersedia keringanan/beasiswa untuk siswa berprestasi dan jalur afirmasi.</p>
            </div>
          </div>

          {/* Alur */}
          <div>
            <h2 className="text-[2rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)] mb-8">Alur Pendaftaran</h2>
            <div className="relative border-l-2 border-[var(--border-light)] ml-6 pl-8 pb-4 space-y-12">
              {alur.map((item) => (
                <div key={item.step} className="relative">
                  <div className="absolute -left-[2.85rem] w-10 h-10 bg-white border-2 border-[var(--border-light)] rounded-full flex items-center justify-center font-[var(--font-outfit)] font-medium text-[var(--text-primary)] shadow-sm">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-medium text-[var(--text-primary)] mb-2 pt-1">{item.title}</h3>
                  <p className="text-[var(--text-secondary)] text-[0.9375rem] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
