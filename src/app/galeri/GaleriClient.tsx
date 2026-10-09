"use client";
import { useState } from "react";
import Image from "next/image";

type GaleriItem = { id: number; judul: string; album: string; foto: string };

export default function GaleriClient({ items }: { items: GaleriItem[] }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const open  = (i: number) => { setLightboxIdx(i); document.body.style.overflow = "hidden"; };
  const close = () => { setLightboxIdx(null); document.body.style.overflow = ""; };
  const prev  = () => setLightboxIdx((i) => ((i ?? 0) - 1 + items.length) % items.length);
  const next  = () => setLightboxIdx((i) => ((i ?? 0) + 1) % items.length);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        {items.map((g, i) => (
          <button
            key={g.id}
            onClick={() => open(i)}
            className="relative rounded-2xl overflow-hidden group cursor-pointer aspect-[4/3] w-full"
            aria-label={`Lihat foto ${g.judul}`}
          >
            <Image src={g.foto} alt={g.judul} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
              <p className="text-white font-semibold text-sm">{g.judul}</p>
              <p className="text-white/70 text-xs">{g.album}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={close}>
          <div className="relative flex items-center gap-4 max-w-5xl w-full px-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={prev} aria-label="Sebelumnya" className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/25 flex items-center justify-center text-2xl transition-colors">&#8249;</button>
            <div className="flex-1 relative">
              <div className="relative aspect-video rounded-2xl overflow-hidden">
                <Image src={items[lightboxIdx].foto} alt={items[lightboxIdx].judul} fill className="object-contain" />
              </div>
              <p className="text-center text-white font-semibold mt-4">{items[lightboxIdx].judul}</p>
              <p className="text-center text-white/60 text-sm">{items[lightboxIdx].album}</p>
            </div>
            <button onClick={next} aria-label="Berikutnya" className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/25 flex items-center justify-center text-2xl transition-colors">&#8250;</button>
          </div>
          <button onClick={close} aria-label="Tutup" className="fixed top-5 right-5 w-11 h-11 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/25 flex items-center justify-center text-xl transition-colors">&times;</button>
          <p className="fixed bottom-5 left-1/2 -translate-x-1/2 text-white/50 text-sm">{lightboxIdx + 1} / {items.length}</p>
        </div>
      )}
    </>
  );
}
