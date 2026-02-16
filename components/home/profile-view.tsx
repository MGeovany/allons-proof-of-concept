'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Clock, LogOut, TicketIcon } from 'lucide-react'
import { signOut } from '@/lib/auth-actions'
import { staggerContainer, staggerItem, transitionSmooth } from '@/lib/motion-variants'

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase() || '?'
}

export function ProfileView({
  displayName,
  email,
  location,
  interests,
  avatarUrl,
}: {
  displayName: string
  email: string
  location: string
  interests: string[]
  avatarUrl?: string | null
}) {
  const [imgError, setImgError] = useState(false)
  const showImage = avatarUrl && !imgError
  const showInitials = !showImage

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      transition={transitionSmooth}
    >
      {/* Tarjeta usuario */}
      <motion.div
        className="rounded-2xl bg-secondary p-4"
        variants={staggerItem}
      >
        <div className="flex gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
            {showInitials ? (
              <span className="flex h-full w-full items-center justify-center bg-orange-primary/20 text-lg font-semibold text-orange-primary">
                {getInitials(displayName)}
              </span>
            ) : (
              <Image
                src={avatarUrl!}
                alt=""
                fill
                className="object-cover object-center"
                sizes="64px"
                onError={() => setImgError(true)}
                unoptimized={avatarUrl.includes('googleusercontent')}
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-foreground">{displayName}</h2>
            {email ? (
              <p className="mt-0.5 text-sm text-muted-foreground">{email}</p>
            ) : null}
            <p className="mt-0.5 text-sm text-muted-foreground">
              {location}
            </p>
            {interests.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {interests.slice(0, 5).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-orange-primary px-2.5 py-0.5 text-xs font-medium text-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tabs Intereses / Mi galería */}
      <motion.div
        className="mt-6 grid grid-cols-2 gap-3"
        variants={staggerItem}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            href="/interests?redirect=/home/profile"
            className="flex items-center justify-center rounded-2xl border border-border bg-card py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Intereses
          </Link>
        </motion.div>
        <motion.button
          type="button"
          className="flex items-center justify-center rounded-2xl border border-border bg-card py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Mi galería
        </motion.button>
      </motion.div>

      {/* Preferencias */}
      <motion.h3
        className="mt-8 text-base font-semibold text-foreground"
        variants={staggerItem}
      >
        Preferencias
      </motion.h3>
      <ul className="mt-3 space-y-1">
        <motion.li variants={staggerItem}>
          <motion.button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-foreground transition-colors hover:bg-secondary"
          >
            <Clock className="h-5 w-5 text-muted-foreground" />
            Historial de eventos
          </motion.button>
        </motion.li>
        <motion.li variants={staggerItem}>
          <motion.div whileTap={{ scale: 0.99 }}>
            <Link
              href="/home/tickets"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-foreground transition-colors hover:bg-secondary"
            >
              <TicketIcon className="h-5 w-5 text-muted-foreground" />
              Mis tickets
            </Link>
          </motion.div>
        </motion.li>
        <motion.li variants={staggerItem}>
          <form action={signOut} className="w-full">
            <motion.button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-foreground transition-colors hover:bg-secondary"
              whileTap={{ scale: 0.99 }}
            >
              <LogOut className="h-5 w-5 text-muted-foreground" />
              Cerrar Sesión
            </motion.button>
          </form>
        </motion.li>
      </ul>
    </motion.div>
  )
}
