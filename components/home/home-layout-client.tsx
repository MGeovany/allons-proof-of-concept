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
  const isChatConversation = pathname.match(/^\/home\/messages\/[^/]+$/)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {children}
      </div>
      {!isEventDetail && !isChatConversation && <BottomNav />}
    </div>
  )
}
