import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Profil Sekolah",
  description: "Profil SMA Nusantara Bangsa: sejarah, visi misi, sambutan kepala sekolah, struktur organisasi, dan fasilitas.",
};

const fasilitas = [
  { nama: "Laboratorium IPA", desc: "3 lab lengkap: Fisika, Kimia, dan Biologi", img: "https://placehold.co/400x300/1A73E8/FFFFFF?text=Lab+IPA" },
  { nama: "Laboratorium Komputer", desc: "2 lab dengan 60 unit komputer ber-internet", img: "https://placehold.co/400x300/A152F9/FFFFFF?text=Lab+Komputer" },
  { nama: "Perpustakaan Digital", desc: "15.000+ buku fisik dan akses e-book", img: "https://placehold.co/400x300/F748A5/FFFFFF?text=Perpus" },
  { nama: "Aula Serbaguna", desc: "Kapasitas 800 orang dengan AV modern", img: "https://placehold.co/400x300/FF8D50/FFFFFF?text=Aula" },
  { nama: "Lapangan Olahraga", desc: "Basket, voli, badminton, futsal indoor", img: "https://placehold.co/400x300/34A853/FFFFFF?text=Olahraga" },
  { nama: "Kantin Sehat", desc: "Kantin bersih dengan menu bergizi terjangkau", img: "https://placehold.co/400x300/EA4335/FFFFFF?text=Kantin" },
];

export default function ProfilPage() {
  return (
    <>
      {/* Page Header */}
      <div className="pt-32 pb-16 bg-[var(--bg-secondary)] border-b border-[var(--border-light)]">
        <div className="max-w-[1000px] mx-auto px-6 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-white gemini-border px-4 py-1.5 rounded-full shadow-sm mb-6">
            <svg className="w-4 h-4 text-[var(--accent-blue)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            <span className="text-sm font-medium text-[var(--text-secondary)]">Tentang Kami</span>
          </div>
          <h1 className="text-[2.5rem] md:text-[4rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)] leading-tight mb-6">
            Profil <span className="gemini-text-gradient">Sekolah</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto leading-relaxed">
            Mengenal lebih dekat sejarah, visi, misi, dan fasilitas unggulan SMA Nusantara Bangsa.
          </p>
        </div>
      </div>

      {/* Sejarah */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="rounded-gemini overflow-hidden shadow-elevated">
            <Image src="https://prinsipbisnis.com/wp-content/uploads/2025/03/Gedung-Kelas-Ikhwan-scaled-1.jpg" alt="Gedung SMA Nusantara Bangsa" width={800} height={600} className="w-full object-cover aspect-[4/3]" />
          </div>
          <div>
            <h2 className="text-[2rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)] mb-6">Sejarah Singkat</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed text-[1.0625rem] mb-4">
              SMA Nusantara Bangsa didirikan pada tahun 1996 oleh Yayasan Pendidikan Nusantara sebagai respons atas kebutuhan masyarakat akan lembaga pendidikan menengah berkualitas di Kota Cerdas. Berawal dari 3 kelas dan 87 siswa, kini sekolah ini telah berkembang pesat.
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed text-[1.0625rem] mb-10">
              Selama 30 tahun perjalanannya, kami telah menghasilkan ribuan alumni yang tersebar di berbagai penjuru Indonesia dan mancanegara, berkiprah di bidang pemerintahan, pendidikan, industri, dan kewirausahaan.
            </p>
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[var(--border-light)]">
              {[["1996", "Didirikan"], ["A", "Akreditasi"], ["5000+", "Alumni"]].map(([num, lbl]) => (
                <div key={lbl}>
                  <div className="text-[2rem] font-medium font-[var(--font-outfit)] text-[var(--accent-blue)] leading-tight">{num}</div>
                  <div className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wider mt-1">{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Visi Misi */}
      <section className="py-20 bg-[var(--bg-secondary)] border-y border-[var(--border-light)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-[2.5rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)]">Visi &amp; Misi</h2>
          </div>
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-8">
            <div className="bg-white p-10 rounded-gemini gemini-border gemini-card-hover text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-tr from-[#4285f4] to-[#9b72cb] rounded-full flex items-center justify-center mb-6 shadow-md">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </div>
              <h3 className="text-[1.75rem] font-medium font-[var(--font-outfit)] text-[var(--text-primary)] mb-4">Visi</h3>
              <p className="text-[var(--text-secondary)] text-[1.125rem] leading-relaxed italic">
                "Menjadi sekolah unggul yang melahirkan generasi cerdas, berkarakter mulia, berwawasan global, dan berdaya saing tinggi."
              </p>
            </div>
            <div className="bg-white p-10 rounded-gemini gemini-border gemini-card-hover">
              <h3 className="text-[1.75rem] font-medium font-[var(--font-outfit)] text-[var(--text-primary)] mb-6 flex items-center gap-3">
                <div className="w-12 h-12 bg-[#F0F4F8] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-[var(--accent-purple)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                </div>
                Misi
              </h3>
              <ul className="space-y-4">
                {["Menyelenggarakan pembelajaran inovatif berbasis Kurikulum Merdeka.", "Mengembangkan karakter dan akhlak mulia seluruh warga sekolah.", "Memfasilitasi pengembangan bakat dan minat melalui ekstrakurikuler.", "Menjalin kemitraan dengan dunia industri dan perguruan tinggi.", "Menciptakan lingkungan belajar yang aman, nyaman, dan inklusif."].map((m) => (
                  <li key={m} className="flex gap-4 items-start">
                    <div className="w-6 h-6 rounded-full bg-[#E8F0FE] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-[var(--accent-blue)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    </div>
                    <span className="text-[var(--text-secondary)] text-[1.0625rem] leading-relaxed">{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Fasilitas */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-[2.5rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)]">Fasilitas Unggulan</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fasilitas.map((f) => (
              <div key={f.nama} className="bg-[var(--bg-secondary)] rounded-gemini overflow-hidden border border-[var(--border-light)] gemini-card-hover group">
                <div className="aspect-[4/3] relative overflow-hidden bg-white">
                  <Image src={f.img} alt={f.nama} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <h3 className="font-medium text-lg text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-blue)] transition-colors">{f.nama}</h3>
                  <p className="text-[0.9375rem] text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
