import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Akademik",
  description: "Informasi kurikulum, jadwal pelajaran, dan program unggulan SMA Nusantara Bangsa.",
};

const kurikulum = [
  { nama: "Kurikulum Merdeka", text: "Implementasi penuh Kurikulum Merdeka yang memberikan keleluasaan bagi pendidik untuk menciptakan pembelajaran berkualitas yang sesuai dengan kebutuhan dan lingkungan belajar peserta didik." },
  { nama: "Pembelajaran Berbasis Proyek (PBL)", text: "Fokus pada pengembangan soft skills dan karakter sesuai profil pelajar Pancasila melalui proyek kokurikuler lintas mata pelajaran." },
  { nama: "Bimbingan Karir & Konseling", text: "Pendampingan intensif bagi siswa kelas XII dalam merencanakan studi lanjut ke perguruan tinggi negeri maupun luar negeri." },
];

export default function AkademikPage() {
  return (
    <>
      <div className="pt-32 pb-16 bg-gradient-to-b from-[var(--bg-secondary)] to-white">
        <div className="max-w-[1000px] mx-auto px-6 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-white gemini-border px-4 py-1.5 rounded-full shadow-sm mb-6">
            <svg className="w-4 h-4 text-[var(--accent-blue)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l10 6.5v7L12 22 2 15.5v-7L12 2zM12 22v-6.5"/></svg>
            <span className="text-sm font-medium text-[var(--text-secondary)]">Pendidikan Berkualitas</span>
          </div>
          <h1 className="text-[2.5rem] md:text-[4rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)] leading-tight mb-6">
            Program <span className="gemini-text-gradient">Akademik</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto leading-relaxed">
            Sistem pembelajaran di SMA Nusantara Bangsa dirancang untuk membekali siswa dengan pengetahuan akademik yang kuat dan keterampilan hidup abad 21.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="order-2 lg:order-1 flex flex-col gap-6">
            <h2 className="text-[2rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)]">Fokus Kurikulum</h2>
            {kurikulum.map((k) => (
              <div key={k.nama} className="bg-[var(--bg-secondary)] p-6 rounded-gemini gemini-border group">
                <h3 className="text-xl font-medium text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-blue)] transition-colors">{k.nama}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed text-[0.9375rem]">{k.text}</p>
              </div>
            ))}
          </div>
          <div className="order-1 lg:order-2 rounded-gemini overflow-hidden shadow-elevated">
            <Image src="https://placehold.co/800x800/DADCE0/1F1F1F?text=Kegiatan+Belajar" alt="Kegiatan Belajar Mengajar" width={800} height={800} className="w-full aspect-square object-cover" />
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-[2.5rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)]">Program Unggulan</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { t: "Bilingual Class", d: "Kelas khusus dengan pengantar bahasa Inggris untuk mata pelajaran Matematika dan Sains.", i: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
            { t: "Riset & Inovasi", d: "Program pembimbingan karya tulis ilmiah dan proyek inovasi teknologi bagi siswa berbakat.", i: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
            { t: "Olimpiade Club", d: "Persiapan intensif kompetisi sains nasional dan internasional dengan mentor berpengalaman.", i: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" }
          ].map((u) => (
            <div key={u.t} className="bg-white p-8 rounded-gemini gemini-border text-center gemini-card-hover group">
              <div className="w-16 h-16 mx-auto bg-[#F0F4F8] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#E8F0FE] transition-colors">
                <svg className="w-8 h-8 text-[var(--text-tertiary)] group-hover:text-[var(--accent-blue)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d={u.i}/></svg>
              </div>
              <h3 className="text-xl font-medium text-[var(--text-primary)] mb-3">{u.t}</h3>
              <p className="text-[var(--text-secondary)] text-[0.9375rem]">{u.d}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
