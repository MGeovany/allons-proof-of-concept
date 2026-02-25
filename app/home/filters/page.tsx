import { Suspense } from "react";
import { FiltersForm } from "@/components/home/filters-form";

export default function FiltersPage() {
  return (
    <Suspense fallback={<div className="flex min-h-0 flex-1 items-center justify-center px-4"><p className="text-muted-foreground">Cargando filtros…</p></div>}>
      <FiltersForm />
    </Suspense>
  );
}
