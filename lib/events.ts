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
  {
    id: '7',
    title: 'Volvamos a Volar: El Mundo de Studio Ghibli',
    date: 'Feb',
    day: '21',
    image: '/images/sonido-evento.png',
    bannerImage: '/images/sonido-evento.png',
    ticketImage: '/images/sonido-evento.png',
    organizer: 'El Sonido del Cine',
    providerContacts: { email: PROVIDER_CONTACT_EMAIL, instagram: PROVIDER_CONTACT_INSTAGRAM },
    tags: ['música', 'cultura', 'comunidad', 'familiar'],
    description:
      'Concierto sinfónico en vivo que rinde homenaje a las bandas sonoras más emblemáticas de Studio Ghibli, interpretadas por orquesta para recrear la emoción y la atmósfera de sus películas más queridas. Una experiencia audiovisual envolvente para amantes del cine y la música en San Pedro Sula.',
    venue: 'San Pedro Sula, Honduras',
    time: 'Por confirmar',
    price: 950,
    displayDateTime: 'Sábado 21 y Domingo 22 de Febrero, 2026',
    reserveUntil: '20 de Febrero, 2026',
    reviews: [
      { author: 'Lucía', initial: 'L', text: 'Un viaje al mundo Ghibli con la música en vivo. Inolvidable.' },
      { author: 'Miguel', initial: 'M', text: 'Ideal para ir en familia. El repertorio es precioso.' },
      { author: 'Elena', initial: 'E', text: 'El Sonido del Cine siempre trae algo especial.' },
    ],
  },
  {
    id: '8',
    title: 'Pintura Primitivista: Taller Infantil de Pintura',
    date: 'Feb',
    day: '21',
    image: '/images/pintura-evento.png',
    bannerImage: '/images/pintura-evento.png',
    ticketImage: '/images/pintura-evento.png',
    organizer: 'Museo de la Identidad Nacional',
    providerContacts: { email: PROVIDER_CONTACT_EMAIL, instagram: PROVIDER_CONTACT_INSTAGRAM },
    tags: ['arte', 'pintura', 'niños', 'familia'],
    description:
      'Taller infantil de pintura primitivista organizado por Museo de la Identidad Nacional, donde niñas y niños exploran color, formas y creatividad libre sin reglas. Actividad formativa y artística para edades de 6 a 12 años en Tegucigalpa.',
    venue: 'Museo de la Identidad Nacional, Tegucigalpa, Honduras',
    time: '3:00 pm',
    price: 100,
    displayDateTime: 'Sábado, 21 de Febrero, 3:00 pm',
    reserveUntil: '20 de Febrero, 2026',
    reviews: [
      { author: 'Carmen', initial: 'C', text: 'Mi hija disfrutó mucho. Muy bien organizado para niños.' },
      { author: 'Ricardo', initial: 'R', text: 'Excelente iniciativa del MIN. Ambiente muy acogedor.' },
      { author: 'Patricia', initial: 'P', text: 'Perfecto para una actividad en familia el fin de semana.' },
    ],
  },
]

export function getEventById(id: string): EventDetail | undefined {
  return EVENTS.find((e) => e.id === id)
}

/** Ciudades para filtros (multi-selección en pantalla Filtros) */
export const FILTER_CITIES = [
  { slug: 'tegucigalpa', label: 'Tegucigalpa' },
  { slug: 'san-pedro-sula', label: 'San Pedro Sula' },
  { slug: 'roatan', label: 'Roatán' },
  { slug: 'santa-barbara', label: 'Santa Bárbara' },
  { slug: 'santa-rosa-de-copan', label: 'Santa Rosa de Copán' },
  { slug: 'comayagua', label: 'Comayagua' },
  { slug: 'tela', label: 'Tela' },
  { slug: 'la-ceiba', label: 'La Ceiba' },
] as const

/** Tipo de evento para filtros (slug → label); se matchea con tags del evento */
export const FILTER_EVENT_TYPES = [
  { slug: 'cine', label: 'Cine y proyecciones' },
  { slug: 'festivales-culturales', label: 'Festivales culturales' },
  { slug: 'arte', label: 'Exhibiciones de Arte' },
  { slug: 'musica', label: 'Música' },
  { slug: 'ciencia-tecnologia', label: 'Ciencia y tecnología' },
  { slug: 'comic-con', label: 'Comic-Cons' },
  { slug: 'conciertos', label: 'Conciertos' },
  { slug: 'fitness', label: 'Fitness y entrenamiento' },
  { slug: 'deportes', label: 'Partidos y torneos' },
  { slug: 'conferencias', label: 'Conferencias' },
  { slug: 'hackathons', label: 'Hackathons' },
  { slug: 'catas', label: 'Catas de vino o cerveza' },
  { slug: 'gastronomia', label: 'Festivales gastronómicos' },
  { slug: 'raves', label: 'Raves' },
  { slug: 'gaming', label: 'Gaming y e-sports' },
  { slug: 'ferias', label: 'Ferias y convenciones' },
] as const

/** Slug de ciudad a partir del venue */
export function getEventCitySlug(venue: string): string {
  const v = venue.toLowerCase()
  if (v.includes('san pedro sula') || v.includes('sps')) return 'san-pedro-sula'
  if (v.includes('tegucigalpa') || v.includes('tgu')) return 'tegucigalpa'
  if (v.includes('roatan') || v.includes('roatán')) return 'roatan'
  if (v.includes('santa bárbara') || v.includes('santa barbara')) return 'santa-barbara'
  if (v.includes('santa rosa') || v.includes('copán')) return 'santa-rosa-de-copan'
  if (v.includes('comayagua')) return 'comayagua'
  if (v.includes('tela')) return 'tela'
  if (v.includes('la ceiba')) return 'la-ceiba'
  return ''
}

/** Filtra eventos por uno o más slugs de ciudad (vacío = no filtrar por ciudad) */
export function filterEventsByCities(events: EventDetail[], citySlugs: string[]): EventDetail[] {
  const set = new Set(citySlugs.filter(Boolean))
  if (set.size === 0) return events
  return events.filter((e) => set.has(getEventCitySlug(e.venue)))
}

/** Slug de tipo de evento que matchea con tags del evento (normalizado) */
function eventMatchesType(event: EventDetail, typeSlug: string): boolean {
  const tags = event.tags.map((t) => t.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, ''))
  const title = event.title.toLowerCase()
  const desc = event.description.toLowerCase()
  const slug = typeSlug.toLowerCase()
  if (slug === 'musica' || slug === 'conciertos') return tags.some((t) => t.includes('música') || t.includes('musica')) || title.includes('concierto') || desc.includes('concierto')
  if (slug === 'arte') return tags.some((t) => t.includes('arte') || t.includes('pintura'))
  if (slug === 'fitness') return tags.some((t) => t.includes('fitness') || t.includes('pilates') || t.includes('wellness'))
  if (slug === 'deportes') return tags.some((t) => t.includes('deporte') || t.includes('running') || t.includes('torneo'))
  if (slug === 'ferias') return tags.some((t) => t.includes('feria') || t.includes('convencion'))
  if (slug === 'gaming') return tags.some((t) => t.includes('gaming') || t.includes('esport'))
  if (slug === 'raves') return tags.some((t) => t.includes('rave'))
  if (slug === 'cine') return tags.some((t) => t.includes('cine')) || desc.includes('cine') || desc.includes('proyección')
  if (slug === 'festivales-culturales') return tags.some((t) => t.includes('cultura') || t.includes('festival'))
  if (slug === 'ciencia-tecnologia') return tags.some((t) => t.includes('tecnología') || t.includes('vr'))
  if (slug === 'conferencias') return desc.includes('conferencia')
  if (slug === 'hackathons') return tags.some((t) => t.includes('hackathon')) || title.includes('hackathon')
  if (slug === 'catas') return tags.some((t) => t.includes('cata') || t.includes('vino') || t.includes('cerveza'))
  if (slug === 'gastronomia') return tags.some((t) => t.includes('gastronomía') || t.includes('gastronomia') || t.includes('comida'))
  if (slug === 'comic-con') return tags.some((t) => t.includes('comic') || t.includes('con'))
  return false
}

/** Filtra eventos por uno o más slugs de tipo (vacío = no filtrar por tipo) */
export function filterEventsByTypes(events: EventDetail[], typeSlugs: string[]): EventDetail[] {
  const list = typeSlugs.filter(Boolean)
  if (list.length === 0) return events
  return events.filter((e) => list.some((slug) => eventMatchesType(e, slug)))
}
