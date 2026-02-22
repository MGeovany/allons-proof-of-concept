'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Minus, Plus } from 'lucide-react'
import { getEventById } from '@/lib/events'
import { createReservation, cancelReservation, getReservationForEvent } from '@/lib/reservation-actions'

function formatPrice(amount: number) {
  return `L. ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

export default function ReservarPage() {
  const params = useParams()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const event = getEventById(params.id as string)

  useEffect(() => {
    if (!event?.id) return
    getReservationForEvent(event.id).then((r) => {
      if (r?.quantity != null) setQuantity(r.quantity)
    })
  }, [event?.id])

  if (!event) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">Evento no encontrado</p>
        <Link
          href="/home"
          className="rounded-2xl bg-orange-primary px-6 py-2.5 text-sm font-semibold text-white"
        >
          Volver al inicio
        </Link>
      </div>
    )
  }

  const total = event.price * quantity
  const isCancel = quantity === 0

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex shrink-0 items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
          aria-label="Volver"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="min-w-0 flex-1 text-center text-lg font-semibold leading-tight text-foreground">
          {event.title}
        </h1>
        <div className="w-10 shrink-0" aria-hidden />
      </header>

      <div className="flex min-h-0 flex-1 flex-col justify-between px-4 py-3 pb-5">
        <div className="flex flex-col gap-3">
        {/* Card selección de entradas */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-neutral-900">Entrada general</p>
              <p className="mt-1 text-lg font-semibold text-neutral-900">
                {formatPrice(event.price)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(0, q - 1))}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 transition-colors hover:bg-neutral-100"
                aria-label="Menos"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[2ch] text-center text-base font-medium text-neutral-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 transition-colors hover:bg-neutral-100"
                aria-label="Más"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Reservas disponibles hasta el {event.reserveUntil}
        </p>
        {event.capacity != null && (
          <p className="mt-1 text-sm text-muted-foreground">
            Límite: {event.capacity} personas
          </p>
        )}
        </div>

        {/* Resumen y botón */}
        <div className="flex shrink-0 flex-col gap-3 pt-2">
          {!isCancel && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground">{event.displayDateTime}</span>
              <span className="font-semibold text-foreground">
                {formatPrice(total)}
              </span>
            </div>
          )}
          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setLoading(true)
              if (isCancel) {
                const { error } = await cancelReservation(event.id)
                if (error) {
                  alert(error)
                  setLoading(false)
                  return
                }
                router.push(`/home/event/${event.id}/reservar/cancelado`)
              } else {
                const { error, emailSent } = await createReservation(event.id, quantity)
                if (error) {
                  alert(error)
                  setLoading(false)
                  return
                }
                router.push(
                  `/home/event/${event.id}/reservar/success?sent=${emailSent ? '1' : '0'}`,
                )
              }
            }}
            className={`flex w-full items-center justify-center rounded-2xl py-3.5 text-base font-semibold transition-opacity hover:opacity-90 ${
              isCancel
                ? 'border border-red-500 bg-transparent text-red-500 hover:bg-red-500/10'
                : 'bg-orange-primary text-white'
            }`}
          >
            {isCancel ? 'Cancelar reserva' : 'Reservar, Pago en el local'}
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            ¿Vas con amigos? <Link href="/home/messages" className="text-orange-primary hover:underline">Coordina en Mensajes</Link>; próximamente podrás comprar entradas en grupo.
          </p>
        </div>
      </div>
    </div>
  )
}
