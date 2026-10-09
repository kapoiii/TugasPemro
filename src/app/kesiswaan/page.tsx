import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Kesiswaan",
  description: "Kegiatan ekstrakurikuler, OSIS, dan prestasi siswa SMA Nusantara Bangsa.",
};

const ekskul = [
  { nama: "Pramuka", kategori: "Wajib", desc: "Membentuk kemandirian dan jiwa kepemimpinan.", img: "https://placehold.co/400x300/1A73E8/FFFFFF?text=Pramuka" },
  { nama: "Paskibra", kategori: "Kedisiplinan", desc: "Melatih kedisiplinan dan rasa nasionalisme.", img: "https://placehold.co/400x300/A152F9/FFFFFF?text=Paskibra" },
  { nama: "PMR", kategori: "Kemanusiaan", desc: "Palang Merah Remaja untuk aksi kemanusiaan.", img: "https://placehold.co/400x300/F748A5/FFFFFF?text=PMR" },
  { nama: "Basket", kategori: "Olahraga", desc: "Klub basket putra dan putri.", img: "https://placehold.co/400x300/FF8D50/FFFFFF?text=Basket" },
  { nama: "Futsal", kategori: "Olahraga", desc: "Pembinaan bakat olahraga futsal.", img: "https://placehold.co/400x300/34A853/FFFFFF?text=Futsal" },
  { nama: "Paduan Suara", kategori: "Kesenian", desc: "Pengembangan bakat vokal dan seni musik.", img: "https://placehold.co/400x300/EA4335/FFFFFF?text=Padus" },
  { nama: "Karya Ilmiah Remaja", kategori: "Akademik", desc: "Penelitian dan penulisan karya ilmiah.", img: "https://placehold.co/400x300/FBBC04/FFFFFF?text=KIR" },
  { nama: "Jurnalistik", kategori: "Keterampilan", desc: "Mading, buletin sekolah, dan fotografi.", img: "https://placehold.co/400x300/46BDC6/FFFFFF?text=Jurnalistik" },
];

export default function KesiswaanPage() {
  return (
    <>
      <div className="pt-32 pb-16 bg-[var(--bg-secondary)] border-b border-[var(--border-light)]">
        <div className="max-w-[1000px] mx-auto px-6 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-white gemini-border px-4 py-1.5 rounded-full shadow-sm mb-6">
            <svg className="w-4 h-4 text-[var(--accent-purple)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            <span className="text-sm font-medium text-[var(--text-secondary)]">Pengembangan Diri</span>
          </div>
          <h1 className="text-[2.5rem] md:text-[4rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)] leading-tight mb-6">
            Kesiswaan &amp; <span className="gemini-text-gradient">Ekstrakurikuler</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto leading-relaxed">
            Wadah bagi siswa untuk mengeksplorasi minat, bakat, dan mengasah jiwa kepemimpinan di luar kegiatan akademik.
          </p>
        </div>
      </div>

      {/* OSIS Section */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-[1fr_auto] gap-12 items-center">
          <div>
            <h2 className="text-[2rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)] mb-4">Organisasi Siswa Intra Sekolah (OSIS)</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed text-[1.0625rem] mb-6 max-w-2xl">
              OSIS SMA Nusantara Bangsa adalah organisasi penggerak utama kegiatan siswa. Melalui OSIS, siswa belajar berorganisasi, mengelola acara, dan menjadi perwakilan aspirasi seluruh peserta didik.
            </p>
            <ul className="flex flex-col gap-3 text-[var(--text-secondary)]">
              {["Menyelenggarakan event tahunan sekolah (Pentas Seni, Porseni).", "Mengelola program sosial dan bakti masyarakat.", "Menjadi jembatan komunikasi antara siswa dan pihak sekolah."].map(item => (
                <li key={item} className="flex gap-3 items-center">
                  <svg className="w-5 h-5 text-[var(--accent-blue)] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full md:w-[400px] aspect-square rounded-gemini-full overflow-hidden gemini-border shadow-elevated">
             <Image src="https://placehold.co/800x800/DADCE0/1F1F1F?text=Kegiatan+OSIS" alt="Kegiatan OSIS" width={400} height={400} className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Ekstrakurikuler */}
      <section className="py-20 bg-[var(--bg-secondary)]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-[2.5rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)] mb-4">Pilihan Ekstrakurikuler</h2>
            <p className="text-[var(--text-secondary)] text-lg">Pilih dari berbagai kegiatan untuk mengembangkan potensimu.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ekskul.map((eks) => (
              <div key={eks.nama} className="bg-white rounded-gemini overflow-hidden gemini-border gemini-card-hover group">
                <div className="relative aspect-[4/3] bg-[var(--bg-tertiary)] overflow-hidden">
                  <Image src={eks.img} alt={eks.nama} width={400} height={300} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-md text-[var(--text-primary)] text-[0.6875rem] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {eks.kategori}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-medium text-lg text-[var(--text-primary)] mb-1">{eks.nama}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{eks.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
