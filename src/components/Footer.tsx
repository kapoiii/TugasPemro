import Link from "next/link";

const footerMain = [
  { href: "/", label: "Beranda" },
  { href: "/profil", label: "Profil Sekolah" },
  { href: "/akademik", label: "Akademik" },
  { href: "/kesiswaan", label: "Kesiswaan" },
  { href: "/ppdb", label: "PPDB" },
];

const footerInfo = [
  { href: "/berita", label: "Berita" },
  { href: "/pengumuman", label: "Pengumuman" },
  { href: "/agenda", label: "Agenda" },
  { href: "/galeri", label: "Galeri" },
  { href: "/unduhan", label: "Unduhan" },
  { href: "/guru", label: "Guru & Staf" },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--bg-secondary)] pt-20 pb-8 mt-auto border-t border-[var(--border-light)]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4285f4] to-[#9b72cb] flex items-center justify-center flex-shrink-0 group-hover:shadow-md transition-all">
                <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
                  <path d="M20 8L32 15V25L20 32L8 25V15L20 8Z" fill="white" opacity="0.9"/>
                  <path d="M20 14L26 17.5V24.5L20 28L14 24.5V17.5L20 14Z" fill="white"/>
                  <circle cx="20" cy="21" r="3" fill="white"/>
                </svg>
              </div>
              <span className="font-[var(--font-outfit)] font-medium text-[1.0625rem] tracking-tight text-[var(--text-primary)]">
                Nusantara Bangsa
              </span>
            </Link>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6 max-w-xs">
              Mewujudkan generasi cerdas, berkarakter mulia, dan siap menghadapi tantangan masa depan.
            </p>
            <div className="flex gap-2">
              {[
                { label: "Instagram", path: "M2 2h20v20H2z M8 2v20 M16 2v20 M2 8h20 M2 16h20" },
                { label: "Facebook", path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
                { label: "YouTube", path: "M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z M9.75 15.02 15.5 12 9.75 8.98z" },
              ].map((s) => (
                <a key={s.label} href="#" aria-label={s.label} rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-[var(--border-color)] bg-white flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d={s.path}/>
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Navigasi Utama */}
          <div>
            <h3 className="font-medium text-[var(--text-primary)] mb-6 font-[var(--font-outfit)]">Navigasi Utama</h3>
            <ul className="flex flex-col gap-3">
              {footerMain.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[0.9375rem] text-[var(--text-secondary)] hover:text-[var(--accent-blue)] hover:underline transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informasi Khusus */}
          <div>
            <h3 className="font-medium text-[var(--text-primary)] mb-6 font-[var(--font-outfit)]">Informasi</h3>
            <ul className="flex flex-col gap-3">
              {footerInfo.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[0.9375rem] text-[var(--text-secondary)] hover:text-[var(--accent-blue)] hover:underline transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="font-medium text-[var(--text-primary)] mb-6 font-[var(--font-outfit)]">Kontak</h3>
            <ul className="flex flex-col gap-4">
              {[
                { icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10 a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", text: "Jl. Pendidikan No. 1, Kota Cerdas 12345" },
                { icon: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.15a16 16 0 006.92 6.92l1.52-1.52a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z", text: "(021) 1234-5678" },
                { icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6", text: "info@smanusantarabangsa.sch.id" },
              ].map((item, i) => (
                <li key={i} className="flex gap-3 items-start group">
                  <div className="w-8 h-8 rounded-full bg-white border border-[var(--border-color)] flex items-center justify-center flex-shrink-0 group-hover:border-[var(--accent-blue)] transition-colors">
                    <svg className="w-3.5 h-3.5 text-[var(--text-tertiary)] group-hover:text-[var(--accent-blue)] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d={item.icon}/>
                    </svg>
                  </div>
                  <span className="text-[0.9375rem] text-[var(--text-secondary)] pt-1">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border-light)] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[0.8125rem] text-[var(--text-tertiary)]">
          <p>&copy; {new Date().getFullYear()} SMA Nusantara Bangsa. Hak cipta dilindungi.</p>
          <div className="flex gap-4">
            <Link href="/kebijakan-privasi" className="hover:text-[var(--text-primary)] hover:underline">Privasi</Link>
            <Link href="/syarat-ketentuan" className="hover:text-[var(--text-primary)] hover:underline">Syarat &amp; Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
