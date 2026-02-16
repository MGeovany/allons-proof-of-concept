const STORAGE_KEY = 'event-booking-reservations'

export interface Reservation {
  eventId: string
  quantity: number
  ticketHolderName: string
}

export function getReservations(): Reservation[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function hasReservation(eventId: string): boolean {
  return getReservations().some((r) => r.eventId === eventId)
}

export function getReservation(eventId: string): Reservation | undefined {
  return getReservations().find((r) => r.eventId === eventId)
}

export function setReservation(data: Reservation): void {
  const list = getReservations().filter((r) => r.eventId !== data.eventId)
  list.push(data)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}
