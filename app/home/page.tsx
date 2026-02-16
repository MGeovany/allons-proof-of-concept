import { SearchBar } from "@/components/home/search-bar";
import { CategoryChips } from "@/components/home/category-chips";
import { EventCard } from "@/components/home/event-card";
import Image from "next/image";
import { EVENTS } from "@/lib/events";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-5 px-4 pb-4 pt-6">
      <Image
        src="/images/logo-orange.png"
        alt="Allons"
        width={200}
        height={64}
        className="h-auto w-40 object-contain sm:w-48"
      />

      <SearchBar />

      <CategoryChips />

      <section>
        <h2 className="mb-3 text-lg font-bold text-foreground">
          Top Eventos Cerca
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {EVENTS.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.title}
              date={event.date}
              day={event.day}
              image={event.image}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
