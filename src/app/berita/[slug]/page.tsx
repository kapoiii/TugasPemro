import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { berita } from "@/lib/data";

export function generateStaticParams() {
  return berita.map((b) => ({ slug: b.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = berita.find((b) => b.id === slug);
  if (!article) return { title: "Berita tidak ditemukan" };
  return {
    title: article.judul,
    description: article.ringkasan,
  };
}

export default async function BeritaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = berita.find((b) => b.id === slug);
  if (!article) notFound();

  const related = berita.filter((b) => b.id !== slug && b.kategori === article.kategori).slice(0, 3);

  return (
    <>
      <div className="pt-32 pb-16 bg-[var(--bg-secondary)] border-b border-[var(--border-light)]">
        <div className="max-w-[1000px] mx-auto px-6 animate-fade-up">
          <Link href="/berita" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6 text-sm font-medium">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Kembali ke Berita
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-white border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-semibold px-3 py-1.5 rounded-full">{article.kategori}</span>
            <span className="text-[var(--text-tertiary)] text-sm font-medium">{article.tanggal}</span>
          </div>
          <h1 className="text-[2rem] md:text-[3rem] font-[var(--font-outfit)] font-medium text-[var(--text-primary)] leading-tight">{article.judul}</h1>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-[1fr_320px] gap-12 lg:gap-16">
          {/* Article */}
          <article>
            <div className="rounded-gemini overflow-hidden mb-10 gemini-border shadow-subtle bg-[var(--bg-tertiary)]">
              <Image src={article.gambar} alt={article.judul} width={800} height={450} className="w-full object-cover aspect-video" />
            </div>
            <div className="prose prose-slate max-w-none prose-headings:font-[var(--font-outfit)] prose-headings:font-medium prose-p:text-[var(--text-secondary)] prose-p:leading-relaxed prose-a:text-[var(--accent-blue)] prose-img:rounded-gemini">
              <p className="text-[1.125rem] text-[var(--text-primary)] font-medium leading-relaxed mb-6">{article.ringkasan}</p>
              <p>{article.isi}</p>
            </div>
          </article>

          {/* Sidebar – Related */}
          <aside className="lg:border-l lg:border-[var(--border-light)] lg:pl-8">
            <h2 className="text-xl font-medium font-[var(--font-outfit)] text-[var(--text-primary)] mb-6">Berita Terkait</h2>
            <div className="flex flex-col gap-6">
              {related.length === 0 ? (
                <p className="text-sm text-[var(--text-tertiary)]">Tidak ada berita terkait.</p>
              ) : related.map((b) => (
                <Link key={b.id} href={`/berita/${b.id}`} className="group flex flex-col gap-3">
                  <div className="aspect-[4/3] rounded-gemini-sm overflow-hidden gemini-border bg-[var(--bg-tertiary)] relative">
                    <Image src={b.gambar} alt={b.judul} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div>
                    <span className="text-xs text-[var(--text-tertiary)] block mb-1">{b.tanggal}</span>
                    <h3 className="text-[0.9375rem] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] transition-colors leading-snug line-clamp-2">{b.judul}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
