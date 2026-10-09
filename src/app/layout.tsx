import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import WhatsAppFloat from "@/components/WhatsAppFloat";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit", // Replaces poppins
  display: "swap",
});

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
    <html lang="id" className={`${inter.variable} ${outfit.variable}`}>
      <body className="bg-[var(--bg-primary)] text-[var(--text-primary)] font-[var(--font-inter)] selection:bg-[#E8F0FE] selection:text-[#1A73E8]">
        <Header />
        <main>{children}</main>
        <Footer />
        <BackToTop />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
