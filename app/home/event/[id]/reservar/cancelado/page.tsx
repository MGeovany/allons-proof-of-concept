"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getEventById } from "@/lib/events";

export default function ReservaCanceladaPage() {
  const params = useParams();
  const event = getEventById(params.id as string);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6">
      <Image
        src="/images/logo-orange.png"
        alt="Allons"
        width={300}
        height={300}
        className="w-[200px]"
      />
      <h2 className="mt-10 text-center text-xl font-bold text-foreground">
        Tu reserva ha sido
        <br />
        cancelada.
      </h2>
      <p className="mt-4 text-center text-foreground">
        ¡Te esperamos a la próxima!
      </p>
      <div className="mt-10 flex w-full flex-col gap-3">
        <Link
          href={event ? `/home/event/${event.id}` : "/home"}
          className="rounded-2xl bg-orange-primary w-full py-4 text-center text-base font-semibold text-white transition-opacity hover:opacity-90"
        >
          {event ? "Ver evento" : "Ir al inicio"}
        </Link>
        <Link
          href="/home/tickets"
          className="rounded-2xl border border-border bg-transparent w-full py-4 text-center text-base font-semibold text-foreground transition-opacity hover:opacity-90"
        >
          Mis Tickets
        </Link>
      </div>
    </div>
  );
}
