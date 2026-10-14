'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'
import BackToTop from './BackToTop'
import WhatsAppFloat from './WhatsAppFloat'

export default function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboardOrAuth = pathname.startsWith('/dashboard') || pathname.startsWith('/login')

  if (isDashboardOrAuth) {
    return <main className="min-h-screen">{children}</main>
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <BackToTop />
      <WhatsAppFloat />
    </>
  )
}
