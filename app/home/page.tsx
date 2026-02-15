import { AllonsLogo } from '@/components/allons-logo'
import { SearchBar } from '@/components/home/search-bar'
import { CategoryChips } from '@/components/home/category-chips'
import { EventCard } from '@/components/home/event-card'

const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Jungla: Rock en Espanol',
    date: 'Jun',
    day: '13',
    image: '/images/event-1.jpg',
  },
  {
    id: '2',
    title: 'Rawayana Concierto 2025',
    date: 'Jun',
    day: '14',
    image: '/images/event-2.jpg',
  },
  {
    id: '3',
    title: 'Festival Gastronomico',
    date: 'Jun',
    day: '20',
    image: '/images/event-3.jpg',
  },
  {
    id: '4',
    title: 'Liga Gaming Tournament',
    date: 'Jul',
    day: '05',
    image: '/images/event-4.jpg',
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col gap-5 px-4 pb-4 pt-6">
      <AllonsLogo size="sm" variant="orange" />

      <SearchBar />

      <CategoryChips />

      <section>
        <h2 className="mb-3 text-lg font-bold text-foreground">
          Top Eventos Cerca
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {MOCK_EVENTS.slice(0, 2).map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              date={event.date}
              day={event.day}
              image={event.image}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-foreground">
          Proximos Eventos
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {MOCK_EVENTS.slice(2).map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              date={event.date}
              day={event.day}
              image={event.image}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
