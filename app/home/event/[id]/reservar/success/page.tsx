"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getEventById } from "@/lib/events";
import Image from "next/image";

export default function ReservarSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const event = getEventById(params.id as string);

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
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6">
      <Image
        src="/images/isotipo.png"
        alt="Logo"
        width={300}
        height={300}
        className="w-[300px]"
      />
      <h2 className="text-center text-xl font-bold text-foreground">
        ¡Gracias por tu reservación!
      </h2>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        Te enviamos tu código QR a tu correo electrónico.
      </p>
      <p className="mt-1 text-center text-sm text-muted-foreground">
        Mantente al tanto de las novedades de tu evento.
      </p>
      <div className="mt-10 flex flex-col gap-3">
        <Link
          href={`/home/event/${event.id}/codigo`}
          className="rounded-2xl bg-orange-primary px-8 py-3.5 text-center text-base font-semibold text-white transition-opacity hover:opacity-90"
        >
          Ver mi código QR
        </Link>
        <Link
          href={`/home/event/${event.id}`}
          className="rounded-2xl border border-border bg-transparent px-8 py-3.5 text-center text-base font-semibold text-foreground transition-opacity hover:opacity-90"
        >
          Ver detalle del evento
        </Link>
      </div>
    </div>
  );
}
