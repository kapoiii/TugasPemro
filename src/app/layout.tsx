import type { Metadata } from "next";
import "./globals.css";
import PublicChrome from "@/components/PublicChrome";

export const metadata: Metadata = {
  metadataBase: new URL("https://smanusantarabangsa.sch.id"),
  title: {
    default: "SMA Nusantara Bangsa – Website Resmi Sekolah",
    template: "%s – SMA Nusantara Bangsa",
  },
  description:
    "Website resmi SMA Nusantara Bangsa: pusat informasi sekolah, PPDB, berita, pengumuman, profil, akademik, dan kontak.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&d)){document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark');}else{document.documentElement.classList.remove('dark');document.documentElement.setAttribute('data-theme','light');}}catch(e){}})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[#E8F0FE] selection:text-[#1A73E8]">
        <PublicChrome>{children}</PublicChrome>
      </body>
    </html>
  );
}
