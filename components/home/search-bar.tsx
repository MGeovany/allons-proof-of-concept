'use client'

import { Search } from 'lucide-react'

export function SearchBar() {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Busqueda"
        className="w-full rounded-lg bg-input px-4 py-3 pr-10 text-sm text-input-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-input-foreground" />
    </div>
  )
}
