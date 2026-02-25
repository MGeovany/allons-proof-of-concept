'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SlidersHorizontal } from 'lucide-react'

const CATEGORIES = [
  'Musica',
  'Comida',
  'Deporte',
  'Arte',
  'Tech',
  'Fiestas',
]

type Props = { filterHref?: string }

export function CategoryChips({ filterHref = '/home/filters' }: Props) {
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
      <Link
        href={filterHref}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-foreground transition-colors hover:bg-accent"
        aria-label="Filtros por ciudad y tipo de evento"
      >
        <SlidersHorizontal className="h-4 w-4" />
      </Link>
    </div>
  )
}
