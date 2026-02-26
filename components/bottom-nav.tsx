'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Home, TicketIcon, MessageCircle, User } from 'lucide-react'
import { useUnreadChatsCount } from '@/hooks/use-unread-chats-count'

const NAV_ITEMS = [
  { href: '/home', icon: Home, label: 'Inicio' },
  { href: '/home/tickets', icon: TicketIcon, label: 'Tickets' },
  { href: '/home/messages', icon: MessageCircle, label: 'Mensajes' },
  { href: '/home/profile', icon: User, label: 'Perfil' },
]

export function BottomNav() {
  const pathname = usePathname()
  const unreadChats = useUnreadChatsCount()

  return (
    <motion.nav
      className="sticky bottom-0 z-50 mx-4 mb-4 rounded-2xl bg-orange-primary px-2 py-2"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'tween', duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href
          const showUnreadDot = href === '/home/messages' && unreadChats > 0
          return (
            <motion.div key={href} whileTap={{ scale: 0.92 }} className="relative">
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 transition-colors ${
                  isActive ? 'text-white' : 'text-white/70'
                }`}
                aria-label={label}
              >
                <motion.span
                  animate={{ scale: isActive ? 1.05 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="relative inline-flex items-center justify-center"
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.5} />
                  {showUnreadDot && (
                    <motion.span
                      className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-orange-primary bg-white shadow-sm"
                      aria-hidden
                      animate={{ opacity: [1, 0.35, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                </motion.span>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </motion.nav>
  )
}
