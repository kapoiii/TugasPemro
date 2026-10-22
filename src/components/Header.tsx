"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { LogIn } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { href: "/", label: "Beranda" },
  {
    href: "/profil",
    label: "Profil",
    children: [
      { href: "/profil", label: "Profil Sekolah" },
      { href: "/guru", label: "Guru & Staf" },
    ],
  },
  { href: "/akademik", label: "Akademik" },
  { href: "/kesiswaan", label: "Kesiswaan" },
  { href: "/berita", label: "Berita" },
  { href: "/pengumuman", label: "Pengumuman" },
  { href: "/ppdb", label: "PPDB" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ role: string; username: string } | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setUser({ role: data.data.role, username: data.data.username });
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [pathname]);

  const toggleMenu = () => {
    const next = !menuOpen;
    setMenuOpen(next);
    document.body.style.overflow = next ? "hidden" : "";
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/login')) {
    return null;
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 px-4 pt-4 pb-2 transition-all duration-300 ${scrolled ? 'pt-2' : ''}`}>
      <header
        className={`max-w-[1240px] mx-auto rounded-gemini-full glass-effect transition-all duration-300 ${scrolled ? "shadow-md bg-white/95 dark:bg-slate-900/95 border-transparent dark:border-slate-800" : "bg-white/80 dark:bg-slate-900/80 border-[var(--border-color)] dark:border-slate-800"}`}
      >
        <div className="px-5 sm:px-6 flex items-center justify-between h-[60px] gap-2">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group" aria-label="Beranda SMA Nusantara Bangsa">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4285f4] to-[#9b72cb] flex items-center justify-center flex-shrink-0 group-hover:shadow-md transition-all">
              <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
                <path d="M20 8L32 15V25L20 32L8 25V15L20 8Z" fill="white" opacity="0.9"/>
                <path d="M20 14L26 17.5V24.5L20 28L14 24.5V17.5L20 14Z" fill="white"/>
                <circle cx="20" cy="21" r="3" fill="white"/>
              </svg>
            </div>
            <span className="font-[var(--font-outfit)] font-semibold text-[1.0625rem] tracking-tight text-[var(--text-primary)]">
              Nusantara Bangsa
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-1 bg-[var(--bg-tertiary)] px-1 py-1 rounded-full border border-[var(--border-light)]" aria-label="Menu Utama">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.href} className="relative group">
                  <Link
                    href={link.href}
                    className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[0.875rem] font-medium transition-colors relative ${isActive(link.href) ? "bg-white dark:bg-slate-800 text-[var(--text-primary)] shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
                  >
                    {link.label}
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" className="opacity-60"><path d="M6 8L2 4h8L6 8z"/></svg>
                  </Link>
                  <ul className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-48 bg-white dark:bg-slate-900 border border-[var(--border-color)] dark:border-slate-800 rounded-2xl p-2 shadow-lg opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200">
                    {link.children.map((child) => (
                      <li key={child.href}>
                        <Link href={child.href} className="block px-4 py-2 text-sm text-[var(--text-secondary)] rounded-xl hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-[0.875rem] font-medium transition-all ${isActive(link.href) ? "bg-white dark:bg-slate-800 text-[var(--text-primary)] shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Action Buttons: Kontak, Login, ThemeToggle, Daftar PPDB */}
          <div className="hidden lg:flex items-center gap-2.5">
             <Link href="/kontak" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-2 py-1">
               Kontak
             </Link>

             <ThemeToggle />

             {!user && (
               <Link
                 href="/login"
                 className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 rounded-full transition-all"
               >
                 <LogIn className="w-3.5 h-3.5" />
                 <span>Login</span>
               </Link>
             )}

             <Link href="/ppdb" className="btn-gemini btn-gemini-primary py-1.5 px-4 text-xs font-semibold shadow-xs">
               Daftar PPDB
             </Link>
          </div>

          {/* Hamburger and controls for mobile */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            {!user && (
              <Link
                href="/login"
                className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 border border-slate-200 text-slate-800"
              >
                <LogIn className="w-3 h-3" />
                <span>Login</span>
              </Link>
            )}

            <button
              onClick={toggleMenu}
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={menuOpen}
              aria-controls="mobileNav"
              className="flex flex-col gap-[4px] p-2 bg-[var(--bg-tertiary)] rounded-full border border-[var(--border-light)]"
            >
              <span className={`block w-4 h-[2px] bg-[var(--text-primary)] rounded-sm transition-transform duration-200 ${menuOpen ? "translate-y-[6px] rotate-45" : ""}`} />
              <span className={`block w-4 h-[2px] bg-[var(--text-primary)] rounded-sm transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-4 h-[2px] bg-[var(--text-primary)] rounded-sm transition-transform duration-200 ${menuOpen ? "-translate-y-[6px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      <div
        id="mobileNav"
        className={`lg:hidden fixed inset-0 top-[76px] bg-white dark:bg-slate-900 z-40 overflow-y-auto transition-all duration-300 ${menuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-4"}`}
      >
        <div className="px-6 py-8 flex flex-col gap-2">
          {navLinks.map((link) => (
            <div key={link.href}>
              <Link
                href={link.href}
                onClick={() => { setMenuOpen(false); document.body.style.overflow = ""; }}
                className={`block px-5 py-3.5 rounded-2xl text-[1.0625rem] font-medium transition-colors ${isActive(link.href) ? "bg-[#F0F4F8] dark:bg-slate-800 text-[var(--text-primary)] font-semibold" : "text-[var(--text-secondary)] hover:bg-[#F8F9FA] dark:hover:bg-slate-800/60"}`}
              >
                {link.label}
              </Link>
              {link.children?.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={() => { setMenuOpen(false); document.body.style.overflow = ""; }}
                  className="block px-9 py-2.5 mt-1 text-[0.9375rem] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {child.label}
                </Link>
              ))}
            </div>
          ))}
          <div className="mt-6 flex flex-col gap-3 px-5">
             {!user && (
               <Link
                 href="/login"
                 onClick={() => { setMenuOpen(false); document.body.style.overflow = ""; }}
                 className="btn-gemini bg-slate-900 hover:bg-slate-800 text-white w-full justify-center flex items-center gap-2 py-3"
               >
                 <LogIn className="w-4 h-4" />
                 <span>Masuk / Login Portal</span>
               </Link>
             )}
             <Link
               href="/kontak"
               onClick={() => { setMenuOpen(false); document.body.style.overflow = ""; }}
               className="btn-gemini btn-gemini-secondary w-full justify-center py-3"
             >
               Kontak Sekolah
             </Link>
             <Link
               href="/ppdb"
               onClick={() => { setMenuOpen(false); document.body.style.overflow = ""; }}
               className="btn-gemini btn-gemini-primary w-full justify-center py-3"
             >
               Daftar PPDB Sekarang
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
