'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Clock, LogOut, TicketIcon } from 'lucide-react'
import { signOut } from '@/lib/auth-actions'

const DEFAULT_LOCATION = 'San Pedro Sula'
const PLACEHOLDER_AVATAR = '/placeholder-user.jpg'

export function ProfileView({
  displayName,
  interests,
  avatarUrl,
}: {
  displayName: string
  interests: string[]
  avatarUrl?: string | null
}) {
  const src = avatarUrl || PLACEHOLDER_AVATAR

  return (
    <>
      {/* Tarjeta usuario */}
      <div className="rounded-2xl bg-secondary p-4">
        <div className="flex gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-foreground">{displayName}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {DEFAULT_LOCATION}
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
      </div>

      {/* Tabs Intereses / Mi galería */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link
          href="/interests?redirect=/home/profile"
          className="flex items-center justify-center rounded-2xl border border-border bg-card py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
        >
          Intereses
        </Link>
        <button
          type="button"
          className="flex items-center justify-center rounded-2xl border border-border bg-card py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
        >
          Mi galería
        </button>
      </div>

      {/* Preferencias */}
      <h3 className="mt-8 text-base font-semibold text-foreground">
        Preferencias
      </h3>
      <ul className="mt-3 space-y-1">
        <li>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-foreground transition-colors hover:bg-secondary"
          >
            <Clock className="h-5 w-5 text-muted-foreground" />
            Historial de eventos
          </button>
        </li>
        <li>
          <Link
            href="/home/tickets"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-foreground transition-colors hover:bg-secondary"
          >
            <TicketIcon className="h-5 w-5 text-muted-foreground" />
            Mis tickets
          </Link>
        </li>
        <li>
          <form action={signOut} className="w-full">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-foreground transition-colors hover:bg-secondary"
            >
              <LogOut className="h-5 w-5 text-muted-foreground" />
              Cerrar Sesión
            </button>
          </form>
        </li>
      </ul>
    </>
  )
}
