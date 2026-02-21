import { Suspense } from "react";
import { HomeContentAnimated } from "@/components/home/home-content-animated";
import { EVENTS } from "@/lib/events";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex min-h-0 flex-1 items-center justify-center px-4"><p className="text-muted-foreground">Cargando…</p></div>}>
      <HomeContentAnimated events={EVENTS} />
    </Suspense>
  );
}
