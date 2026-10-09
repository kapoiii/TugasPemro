import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Informasi kontak, lokasi, dan formulir pertanyaan SMA Nusantara Bangsa.",
};

export default function KontakPage() {
  return (
    <>
      <div className="pt-32 pb-16 bg-[var(--bg-secondary)] border-b border-[var(--border-light)]">
        <div className="max-w-[1000px] mx-auto px-6 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-white gemini-border px-4 py-1.5 rounded-full shadow-sm mb-6">
            <svg className="w-4 h-4 text-[var(--accent-blue)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            <span className="text-sm font-medium text-[var(--text-secondary)]">Pusat Bantuan</span>
          </div>
          <h1 className="text-[2.5rem] md:text-[4rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)] leading-tight mb-6">
            Hubungi <span className="gemini-text-gradient">Kami</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto leading-relaxed">
            Punya pertanyaan seputar akademik atau pendaftaran? Tim kami siap membantu Anda.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-[1fr_400px] gap-12 lg:gap-20">
          {/* Form */}
          <div>
            <h2 className="text-[2rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)] mb-8">Kirim Pesan</h2>
            <form className="bg-white p-8 rounded-gemini gemini-border shadow-subtle space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-medium text-[var(--text-primary)]">Nama Lengkap</label>
                  <input type="text" id="name" required className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-gemini-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)] focus:ring-1 focus:ring-[var(--accent-blue)] transition-all" placeholder="Masukkan nama" />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-medium text-[var(--text-primary)]">Email</label>
                  <input type="email" id="email" required className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-gemini-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)] focus:ring-1 focus:ring-[var(--accent-blue)] transition-all" placeholder="email@contoh.com" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="subject" className="text-sm font-medium text-[var(--text-primary)]">Subjek Pesan</label>
                <select id="subject" required className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-gemini-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)] focus:ring-1 focus:ring-[var(--accent-blue)] transition-all">
                  <option value="">Pilih topik</option>
                  <option value="ppdb">Informasi PPDB</option>
                  <option value="akademik">Akademik</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-sm font-medium text-[var(--text-primary)]">Isi Pesan</label>
                <textarea id="message" required rows={5} className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-gemini-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)] focus:ring-1 focus:ring-[var(--accent-blue)] transition-all resize-y" placeholder="Tulis pesan Anda di sini..."></textarea>
              </div>
              <button type="submit" className="btn-gemini btn-gemini-primary w-full py-4 text-base">
                Kirim Pesan Sekarang
              </button>
            </form>
          </div>

          {/* Info & Peta */}
          <div className="space-y-8">
            <h2 className="text-[2rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)]">Kontak & Lokasi</h2>
            <div className="flex flex-col gap-6">
              {[
                { label: "Alamat Sekolah", value: "Jl. Pendidikan No. 1, Kec. Maju Jaya, Kota Cerdas 12345", icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10a3 3 0 100-6 3 3 0 000 6z" },
                { label: "Telepon / WhatsApp", value: "(021) 1234-5678 / 0812-3456-7890", icon: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.15a16 16 0 006.92 6.92l1.52-1.52a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" },
                { label: "Email", value: "info@smanusantarabangsa.sch.id", icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" }
              ].map((c) => (
                <div key={c.label} className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0 text-[var(--accent-blue)]">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={c.icon}/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">{c.label}</p>
                    <p className="text-[0.9375rem] text-[var(--text-primary)] font-medium leading-relaxed">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full h-[250px] bg-[var(--bg-secondary)] rounded-gemini gemini-border overflow-hidden flex items-center justify-center text-[var(--text-secondary)]">
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto mb-2 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <p className="font-medium text-sm">Peta Interaktif (Google Maps iframe)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
