'use client'

import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'

const CATEGORIES = [
  'Musica',
  'Comida',
  'Deporte',
  'Arte',
  'Tech',
  'Fiestas',
]

export function CategoryChips() {
  const [active, setActive] = useState<string | null>(null)

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 gap-2 overflow-x-auto scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActive(active === cat ? null : cat)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              active === cat
                ? 'border-orange-primary bg-orange-primary text-white'
                : 'border-border bg-secondary text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="shrink-0 rounded-lg p-1.5 text-foreground transition-colors hover:bg-secondary"
        aria-label="Filtros"
      >
        <SlidersHorizontal className="h-5 w-5" />
      </button>
    </div>
  )
}
