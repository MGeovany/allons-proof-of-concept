'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { updateProfile } from '@/lib/profile-actions'
import type { ProfileForEdit } from '@/lib/profile-actions'

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase() || '?'
}

export function EditProfileForm({ profile }: { profile: ProfileForEdit | null }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imgError, setImgError] = useState(false)

  const name = profile?.name ?? ''
  const username = profile?.username ?? ''
  const location = profile?.location ?? ''
  const avatarUrl = profile?.avatar_url ?? ''
  const showAvatar = avatarUrl && !imgError

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)
    const form = e.currentTarget
    const formData = {
      name: (form.querySelector('[name="name"]') as HTMLInputElement)?.value ?? '',
      username: (form.querySelector('[name="username"]') as HTMLInputElement)?.value ?? '',
      location: (form.querySelector('[name="location"]') as HTMLInputElement)?.value ?? '',
      avatar_url: (form.querySelector('[name="avatar_url"]') as HTMLInputElement)?.value ?? '',
    }
    const result = await updateProfile(formData)
    setPending(false)
    if (result.error) {
      setError(result.error)
      return
    }
    router.push('/home/profile')
    router.refresh()
  }

  return (
    <div className="flex flex-1 flex-col px-4 pb-24">
      <header className="flex items-center justify-between py-4">
        <Link
          href="/home/profile"
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground"
          aria-label="Volver"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-bold text-foreground">Editar perfil</h1>
        <div className="w-10" aria-hidden />
      </header>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
        {/* Avatar preview + URL */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
            {showAvatar ? (
              <Image
                src={avatarUrl}
                alt=""
                fill
                className="object-cover object-center"
                sizes="96px"
                onError={() => setImgError(true)}
                unoptimized={avatarUrl.includes('googleusercontent')}
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-orange-primary/20 text-2xl font-semibold text-orange-primary">
                {getInitials(name || '?')}
              </span>
            )}
          </div>
          <div className="w-full">
            <label htmlFor="avatar_url" className="block text-sm font-medium text-foreground">
              Foto (URL)
            </label>
            <input
              id="avatar_url"
              name="avatar_url"
              type="url"
              placeholder="https://..."
              defaultValue={avatarUrl}
              className="mt-1.5 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-orange-primary focus:outline-none focus:ring-1 focus:ring-orange-primary"
            />
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground">
            Nombre
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Tu nombre"
            defaultValue={name}
            className="mt-1.5 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-orange-primary focus:outline-none focus:ring-1 focus:ring-orange-primary"
          />
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-foreground">
            Usuario (opcional)
          </label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="@usuario"
            defaultValue={username}
            className="mt-1.5 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-orange-primary focus:outline-none focus:ring-1 focus:ring-orange-primary"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-foreground">
            Ubicación
          </label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="Ciudad o país"
            defaultValue={location}
            className="mt-1.5 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-orange-primary focus:outline-none focus:ring-1 focus:ring-orange-primary"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-orange-primary px-4 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
        >
          {pending ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
