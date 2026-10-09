"use client";
import { useEffect, useState } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Kembali ke atas"
      className={`fixed bottom-24 right-6 w-11 h-11 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center shadow-lg z-40 transition-all duration-200 hover:-translate-y-1 hover:bg-[#1E40AF] ${visible ? "opacity-100 visible" : "opacity-0 invisible"}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6"/></svg>
    </button>
  );
}
