'use client'

import Link from 'next/link'
import { Search } from 'lucide-react'

export function SearchBar() {
  return (
    <Link
      href="/home/search"
      className="relative flex w-full items-center rounded-lg bg-input px-4 py-3 pr-10 text-left text-sm text-input-foreground"
      aria-label="Abrir búsqueda"
    >
      <span className="text-muted-foreground">Búsqueda</span>
      <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
    </Link>
  )
}
