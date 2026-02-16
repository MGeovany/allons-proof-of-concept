'use client'

import { usePathname } from 'next/navigation'
import { BottomNav } from '@/components/bottom-nav'

export function HomeLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isEventDetail = pathname.startsWith('/home/event/')

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">{children}</div>
      {!isEventDetail && <BottomNav />}
    </div>
  )
}
