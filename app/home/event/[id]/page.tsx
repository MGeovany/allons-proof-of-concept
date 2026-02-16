"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Share2, CalendarDays, QrCode } from "lucide-react";
import { getEventById, DEFAULT_BANNER } from "@/lib/events";
import { hasReservationForEvent } from "@/lib/reservation-actions";
import { staggerContainer, staggerItem, transitionSmooth } from "@/lib/motion-variants";

type Tab = "evento" | "galeria";

const GALLERY_IMAGES = [
  "/images/raw-event/image.png",
  "/images/raw-event/image-1.png",

  "/images/raw-event/image-3.png",
  "/images/raw-event/image-4.png",

  "/images/raw-event/image-6.png",
  "/images/raw-event/image-7.png",
];

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("evento");
  const [isReserved, setIsReserved] = useState(false);
  const event = getEventById(params.id as string);
  const isJungla = event?.id === "1";

  useEffect(() => {
    if (!event?.id) return;
    hasReservationForEvent(event.id).then(setIsReserved);
  }, [event?.id]);

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
    );
  }

  return (
    <motion.div
      className="flex min-h-dvh flex-col bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={transitionSmooth}
    >
      {/* Área de imagen con gradiente inferior */}
      <motion.div
        className="relative h-52 w-full shrink-0 sm:h-64"
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${event.bannerImage ?? DEFAULT_BANNER})`,
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent"
          aria-hidden
        />
        <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-4 pt-2">
          <motion.button
            type="button"
            onClick={() => router.push("/home")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm"
            aria-label="Volver"
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="h-6 w-6" />
          </motion.button>
          <div className="flex items-center gap-2">
            {isReserved && (
              <motion.div whileTap={{ scale: 0.9 }}>
                <Link
                  href={`/home/event/${event.id}/codigo`}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-neutral-900 backdrop-blur-sm"
                  aria-label="Ver código QR"
                >
                  <QrCode className="h-5 w-5" strokeWidth={2} />
                </Link>
              </motion.div>
            )}
            <motion.button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm"
              aria-label="Compartir"
              whileTap={{ scale: 0.9 }}
            >
              <Share2 className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Contenido con esquinas redondeadas superiores */}
      <div className="-mt-6 flex flex-1 flex-col rounded-t-2xl bg-background px-0 pt-5 pb-4">
        <motion.div
          className="mb-5 overflow-hidden rounded-2xl bg-secondary/60"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ...transitionSmooth }}
        >
          <div className="grid grid-cols-2">
            <motion.button
              type="button"
              onClick={() => setTab("evento")}
              className={`py-4 text-center text-sm font-medium transition-colors ${
                tab === "evento"
                  ? "bg-background/80 font-semibold text-foreground"
                  : "text-foreground/80"
              }`}
              whileTap={{ scale: 0.98 }}
            >
              Evento
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setTab("galeria")}
              className={`py-4 text-center text-sm font-medium transition-colors ${
                tab === "galeria"
                  ? "bg-background/80 font-semibold text-foreground"
                  : "text-foreground/80"
              }`}
              whileTap={{ scale: 0.98 }}
            >
              Galería
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {tab === "evento" ? (
            <motion.div
              key="evento"
              className="px-4"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={transitionSmooth}
            >
            {/* Título del evento */}
            <h2 className="mb-4 text-xl font-bold leading-tight text-foreground">
              {event.title}
            </h2>

            {/* Pills / tags - fondo gris ligeramente más claro */}
            <div className="mb-6 flex flex-wrap gap-2">
              <span className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground">
                Organizado por : {event.organizer}
              </span>
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Descripción de evento */}
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              Descripción de evento
            </h3>

            <div className="px-4">
              {/* Hora y Lugar - ícono + etiqueta, luego lugar y hora */}
              <div className="mb-2 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 shrink-0 text-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Hora y Lugar
                </span>
              </div>
              <p className="mb-1 text-sm text-foreground">{event.venue}</p>
              <p className="mb-6 text-sm font-medium text-foreground">
                {event.time}
              </p>
            </div>

            {/* Descripción texto (opcional, si hay) */}
            {event.description && (
              <p className="mb-6 text-sm text-muted-foreground">
                {event.description}
              </p>
            )}

            {/* Reseñas del organizador - scroll horizontal con swipe en móvil */}
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Reseñas del organizador
            </h3>
            <motion.div
              className="flex gap-3 overflow-x-auto overflow-y-hidden pb-24 scrollbar-none snap-x snap-mandatory"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
            >
              {event.reviews.map((review, i) => (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  className="flex w-64 shrink-0 snap-start flex-col gap-2 rounded-xl bg-secondary/80 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-primary/25 text-sm font-semibold text-orange-primary">
                      {review.initial}
                    </div>
                    <p className="truncate text-sm font-medium text-foreground">
                      {review.author}
                    </p>
                  </div>
                  <p className="line-clamp-3 text-sm text-foreground">
                    {review.text}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="galeria"
            className="px-4"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={transitionSmooth}
          >
            {/* Título y tags (igual que en Evento) */}
            <h2 className="mb-4 text-xl font-bold leading-tight text-foreground">
              {event.title}
            </h2>
            <div className="mb-6 flex flex-wrap gap-2">
              <span className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground">
                Organizado por : {event.organizer}
              </span>
              {event.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
            {/* Grid galería 3 columnas */}
            {isJungla ? (
              <div className="pb-24">
                <div className="grid grid-cols-3 gap-1.5">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-secondary"
                    >
                      <span className="px-2 text-center text-[10px] font-medium text-muted-foreground">
                        Próximamente
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-center text-sm text-muted-foreground">
                  Aún no hay imágenes. Pronto el proveedor agregará más fotos
                  del evento.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 pb-24">
                {GALLERY_IMAGES.map((src, i) => (
                  <div
                    key={i}
                    className="relative aspect-square overflow-hidden rounded-lg bg-secondary"
                  >
                    <Image
                      src={src}
                      alt={`Foto del evento ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 430px) 33vw, 140px"
                    />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      <motion.div
        className="fixed bottom-0 left-0 right-0 z-20 flex gap-3 border-t border-border bg-background px-4 py-4 w-full max-w-[430px] mx-auto rounded-b-[1.5rem] min-[431px]:rounded-b-[2rem]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, ...transitionSmooth }}
      >
        <motion.div whileTap={{ scale: 0.98 }} className="flex flex-1">
          <Link
            href={`/home/event/${event.id}/proveedor`}
            className="flex flex-1 items-center justify-center rounded-2xl border border-border bg-white py-3.5 text-sm font-semibold text-black"
          >
            Contactar proveedor
          </Link>
        </motion.div>
        <motion.div whileTap={{ scale: 0.98 }} className="flex flex-1">
          <Link
            href={`/home/event/${event.id}/reservar`}
            className="flex flex-1 items-center justify-center rounded-2xl bg-orange-primary py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {isReserved ? "Editar Reserva" : "Reservar"}
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
