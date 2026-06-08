import type { ReactNode } from 'react'
import { PublicNav } from './public-nav'
import { Footer } from './footer'

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
