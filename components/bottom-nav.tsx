'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, TicketIcon, Bell, User } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/home', icon: Home, label: 'Inicio' },
  { href: '/home/tickets', icon: TicketIcon, label: 'Tickets' },
  { href: '/home/notifications', icon: Bell, label: 'Alertas' },
  { href: '/home/profile', icon: User, label: 'Perfil' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="sticky bottom-0 z-50 mx-4 mb-4 rounded-2xl bg-orange-primary px-2 py-2">
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 transition-colors ${
                isActive
                  ? 'text-white'
                  : 'text-white/70'
              }`}
              aria-label={label}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.5} />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
