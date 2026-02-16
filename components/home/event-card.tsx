import Image from 'next/image'
import Link from 'next/link'

interface EventCardProps {
  id: string
  title: string
  date: string
  day: string
  image: string
}

export function EventCard({ id, title, date, day, image }: EventCardProps) {
  return (
    <div className="flex w-44 shrink-0 flex-col overflow-hidden rounded-xl">
      <div className="relative h-40">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
        <div className="absolute left-2 top-2 flex flex-col items-center rounded-lg bg-background/80 px-2 py-1 backdrop-blur-sm">
          <span className="text-[10px] font-semibold leading-tight text-orange-primary">
            {date}
          </span>
          <span className="text-sm font-bold leading-tight text-foreground">
            {day}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-3 pt-8">
          <p className="text-sm font-semibold leading-tight text-foreground">
            {title}
          </p>
        </div>
      </div>
      <Link
        href={`/home/event/${id}`}
        className="border border-border bg-secondary py-2 text-center text-xs font-medium text-foreground transition-colors hover:bg-accent"
      >
        Ver detalles
      </Link>
    </div>
  )
}
