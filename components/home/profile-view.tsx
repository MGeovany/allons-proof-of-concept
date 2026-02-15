'use client'

import { User, LogOut } from 'lucide-react'
import { signOut } from '@/lib/auth-actions'

export function ProfileView() {
  return (
    <div className="flex flex-1 flex-col items-center gap-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
        <User className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="text-xl font-bold text-foreground">Mi Perfil</h1>

      <form action={signOut} className="w-full pt-8">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesion
        </button>
      </form>
    </div>
  )
}
