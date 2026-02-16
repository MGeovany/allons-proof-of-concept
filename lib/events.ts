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
    id: '1',
    title: 'Jungla: Rock en Español',
    date: 'Jun',
    day: '13',
    image: '/images/jungla.png',
    ticketImage: '/images/jungla-ti.png',
    organizer: 'BM TICKETS',
    providerContacts: {
      instagram: 'bmtickets',
      whatsapp: '9695-0443',
      email: 'bmtickets@bm.com',
    },
    tags: ['Música en vivo', 'Venta de Bebidas', '+18', 'Energético'],
    description: 'Concierto de rock en español con Jungla. Una noche inolvidable de música en vivo.',
    venue: 'Coliseum de los Ingenieros, Tegucigalpa, Honduras',
    time: '8:00 pm',
    price: 150,
    displayDateTime: 'Sábado, 15 de Junio, 8:00 pm',
    reserveUntil: '13 de Junio, 2025',
    reviews: [
      { author: 'Humberto', initial: 'H', text: 'Todos tienen que ir a este concierto yaaa.' },
      { author: 'María', initial: 'M', text: 'Increíble ambiente y sonido.' },
      { author: 'Carlos', initial: 'C', text: 'Súper recomendado.' },
    ],
  },
  {
    id: '2',
    title: 'Rawayana: Concierto 2025',
    date: 'Jun',
    day: '14',
    image: '/images/rawi.png',
    bannerImage: '/images/bg-rawi.png',
    organizer: 'BM TICKETS',
    providerContacts: {
      instagram: 'bmtickets',
      whatsapp: '9695-0443',
      email: 'bmtickets@bm.com',
    },
    tags: ['Música en vivo', 'Venta de Bebidas', '+16', 'Alegre, Emocionante', 'Estacionamiento Limitado', 'No Fumar'],
    description: 'Rawayana en concierto. Ven a vivir una experiencia única con la banda venezolana.',
    venue: 'Coliseum de los Ingenieros, Tegucigalpa, Honduras',
    time: '8:00 pm',
    price: 150,
    displayDateTime: 'Sábado, 15 de Junio, 8:00 pm',
    reserveUntil: '13 de Junio, 2025',
    reviews: [
      { author: 'Humberto', initial: 'H', text: 'Todos tienen que ir a este concierto yaaa.' },
      { author: 'Joseph Reyes', initial: 'J', text: 'No caminen, corran a ver a Rawi' },
      { author: 'R', initial: 'R', text: 'Súper recomendado.' },
    ],
  },
]

export function getEventById(id: string): EventDetail | undefined {
  return EVENTS.find((e) => e.id === id)
}
