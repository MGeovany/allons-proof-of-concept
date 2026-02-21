/** Imagen del banner en detalle (si no se define, se usa DEFAULT_BANNER) */
export const DEFAULT_BANNER = '/images/event-1.jpg'

export interface ProviderContacts {
  instagram?: string
  whatsapp?: string
  email?: string
}

export interface EventDetail {
  id: string
  title: string
  date: string
  day: string
  image: string
  /** Banner en página de detalle; si no se define, se usa DEFAULT_BANNER */
  bannerImage?: string
  /** Imagen en la sección Mis Tickets; si no se define, se usa bannerImage o image */
  ticketImage?: string
  organizer: string
  providerContacts?: ProviderContacts
  tags: string[]
  description: string
  venue: string
  time: string
  /** Precio en Lempiras por entrada general */
  price: number
  /** Fecha y hora para mostrar en reserva (ej. "Sábado, 15 de Junio, 8:00 pm") */
  displayDateTime: string
  /** Reservas disponibles hasta (ej. "13 de Junio, 2025") */
  reserveUntil: string
  reviews: { author: string; initial: string; text: string }[]
}

export const EVENTS: EventDetail[] = [
  {
    id: '3',
    title: 'Jeté Pilates On Mat',
    date: 'Feb',
    day: '24',
    image: '/images/jete-event.png',
    bannerImage: '/images/jete-event.png',
    ticketImage: '/images/jete-event.png',
    organizer: 'Jeté dance & fitness studio',
    tags: ['Wellness', 'Pilates', 'Fitness', 'Aire Libre'],
    description:
      'Disfruta de una clase de Pilates On Mat enfocada en fortalecer tu cuerpo, mejorar tu flexibilidad y conectar con tu respiración. Una experiencia ideal para moverte, relajarte y recargar energías.',
    venue: 'UNITEC, Tegucigalpa, Honduras',
    time: '3:30 pm',
    price: 0,
    displayDateTime: 'Martes, 24 de Febrero, 3:30 pm',
    reserveUntil: '24 de Febrero, 2026',
    reviews: [
      { author: 'Ana', initial: 'A', text: 'Clase súper completa, sales renovado.' },
      { author: 'David', initial: 'D', text: 'Buen ritmo y excelente guía durante toda la sesión.' },
      { author: 'Sofía', initial: 'S', text: 'Ideal para estirar y desconectarte un rato.' },
    ],
  },
  {
    id: '4',
    title: 'EXPERIENCIA VR BIODIVERSIDAD MUNDIAL',
    date: 'Feb',
    day: '24',
    image: '/images/bio-event.png',
    bannerImage: '/images/bio-event.png',
    ticketImage: '/images/bio-event.png',
    organizer: 'Smart Rabbit HN',
    tags: ['VR', 'Naturaleza', 'Tecnología'],
    description:
      'Explora la biodiversidad del mundo a través de una experiencia de Realidad Virtual inmersiva. Recorre distintos ecosistemas y conoce fascinantes especies animales en su hábitat natural mientras aprendes de forma interactiva.',
    venue: 'UNITEC, Tegucigalpa, Honduras',
    time: '3:30 pm',
    price: 50,
    displayDateTime: 'Martes, 24 de Febrero, 3:30 pm',
    reserveUntil: '24 de Febrero, 2026',
    reviews: [
      { author: 'Luis', initial: 'L', text: 'Muy inmersivo y educativo. Excelente experiencia.' },
      { author: 'Andrea', initial: 'A', text: 'Me encantó aprender mientras exploraba en VR.' },
      { author: 'Carlos', initial: 'C', text: 'Buen contenido y buena organización en el evento.' },
    ],
  },
]

export function getEventById(id: string): EventDetail | undefined {
  return EVENTS.find((e) => e.id === id)
}
