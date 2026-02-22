/** Imagen del banner en detalle (si no se define, se usa DEFAULT_BANNER) */
export const DEFAULT_BANNER = '/images/event-1.jpg'

/** Contacto Allons para proveedor en todos los eventos */
export const PROVIDER_CONTACT_EMAIL = 'allonsapp@outlook.com'
export const PROVIDER_CONTACT_INSTAGRAM = 'allons.hn'

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
  /** Límite de personas (cupos). Si no se define, sin límite. */
  capacity?: number
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
    providerContacts: { email: PROVIDER_CONTACT_EMAIL, instagram: PROVIDER_CONTACT_INSTAGRAM },
    tags: ['Wellness', 'Pilates', 'Fitness', 'Aire Libre'],
    description:
      'Disfruta de una clase de Pilates On Mat enfocada en fortalecer tu cuerpo, mejorar tu flexibilidad y conectar con tu respiración. Una experiencia ideal para moverte, relajarte y recargar energías.',
    venue: 'UNITEC, Tegucigalpa, Honduras',
    time: '3:30 pm',
    price: 0,
    displayDateTime: 'Martes, 24 de Febrero, 3:30 pm',
    reserveUntil: '24 de Febrero, 2026',
    capacity: 10,
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
    providerContacts: { email: PROVIDER_CONTACT_EMAIL, instagram: PROVIDER_CONTACT_INSTAGRAM },
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
  {
    id: '5',
    title: 'Capital Run Fest II',
    date: 'Abr',
    day: '19',
    image: '/images/capital-event.png',
    bannerImage: '/images/capital-event.png',
    ticketImage: '/images/capital-event.png',
    organizer: 'New Life Run Club',
    providerContacts: { email: PROVIDER_CONTACT_EMAIL, instagram: PROVIDER_CONTACT_INSTAGRAM },
    tags: ['Deportes', 'Comunidad', 'Running', '+13'],
    description:
      'Segunda edición de la carrera insignia de New Life Run Club. Parte de las ganancias irán destinadas al hogar de ancianos Salvador Aguirre.',
    venue: 'Hotel Clarion, Tegucigalpa, Honduras',
    time: '4:00 pm',
    price: 600,
    displayDateTime: 'Domingo, 19 de Abril, 4:00 pm',
    reserveUntil: '18 de Abril, 2026',
    reviews: [
      { author: 'María', initial: 'M', text: 'Una carrera con causa. Muy bien organizada.' },
      { author: 'Pedro', initial: 'P', text: 'Ambiente familiar y gran experiencia.' },
      { author: 'Laura', initial: 'L', text: 'Repetiré el próximo año sin dudarlo.' },
    ],
  },
  {
    id: '6',
    title: 'Der Blitz',
    date: 'Mar',
    day: '27',
    image: '/images/der-event.png',
    bannerImage: '/images/der-event.png',
    ticketImage: '/images/der-event.png',
    organizer: 'Gods Gym',
    providerContacts: { email: PROVIDER_CONTACT_EMAIL, instagram: PROVIDER_CONTACT_INSTAGRAM },
    tags: ['Deportes', 'Comunidad', 'Fisicoculturismo natural', 'Torneo', '+17'],
    description:
      'Segunda edición del torneo de fisicoculturismo natural más grande de Honduras. Un evento para incentivar a toda la comunidad en la búsqueda de una mejor salud. Una convergencia entre arte, deporte y cultura.',
    venue: 'Hotel Honduras Maya, Tegucigalpa, Honduras',
    time: 'Por confirmar',
    price: 600,
    displayDateTime: 'Viernes 27 y Sábado 28 de Marzo, 2026',
    reserveUntil: '26 de Marzo, 2026',
    reviews: [
      { author: 'Carlos', initial: 'C', text: 'El torneo natural más grande del país. Nivel altísimo.' },
      { author: 'Andrea', initial: 'A', text: 'Gran ambiente y organización de Gods Gym.' },
      { author: 'Roberto', initial: 'R', text: 'Motivador ver tanto talento en un solo lugar.' },
    ],
  },
]

export function getEventById(id: string): EventDetail | undefined {
  return EVENTS.find((e) => e.id === id)
}
