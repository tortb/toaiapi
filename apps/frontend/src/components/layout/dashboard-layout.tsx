import type { ReactNode } from 'react'

interface DashboardLayoutProps {
  sidebar: ReactNode
  children: ReactNode
}

export function DashboardLayout({ sidebar, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {sidebar}
      <main className="flex-1 bg-[#FAFAFA]">{children}</main>
    </div>
  )
}
