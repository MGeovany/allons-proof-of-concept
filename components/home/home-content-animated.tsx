"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import Image from "next/image";
import { CategoryChips } from "@/components/home/category-chips";
import { EventCard } from "@/components/home/event-card";
import { EventListCard } from "@/components/home/event-list-card";
import type { EventDetail } from "@/lib/events";
import {
  filterEventsByCities,
  filterEventsByTypes,
  getEventCitySlug,
  FILTER_CITIES,
} from "@/lib/events";
import { staggerContainer, staggerItem, transitionSmooth } from "@/lib/motion-variants";
import Link from "next/link";

type Props = { events: EventDetail[] };

function filterByQuery(events: EventDetail[], q: string): EventDetail[] {
  const term = q.trim().toLowerCase();
  if (!term) return events;
  return events.filter(
    (e) =>
      e.title.toLowerCase().includes(term) ||
      e.organizer.toLowerCase().includes(term) ||
      e.description.toLowerCase().includes(term) ||
      e.tags.some((t) => t.toLowerCase().includes(term)),
  );
}

function getCityLabel(slug: string): string {
  if (slug === "otros") return "Otros";
  const found = FILTER_CITIES.find((c) => c.slug === slug);
  return found ? found.label : slug;
}

export function HomeContentAnimated({ events }: Props) {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const cityParam = searchParams.get("city") ?? "";
  const typeParam = searchParams.get("type") ?? "";
  const citySlugs = cityParam ? cityParam.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const typeSlugs = typeParam ? typeParam.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const filteredEvents = useMemo(
    () =>
      filterEventsByTypes(
        filterEventsByCities(filterByQuery(events, q), citySlugs),
        typeSlugs,
      ),
    [events, q, citySlugs, typeSlugs],
  );

  const hasFilters = q || citySlugs.length > 0 || typeSlugs.length > 0;
  const eventsByCity = useMemo(() => {
    const map = new Map<string, EventDetail[]>();
    for (const e of filteredEvents) {
      const slug = getEventCitySlug(e.venue) || "otros";
      if (!map.has(slug)) map.set(slug, []);
      map.get(slug)!.push(e);
    }
    const order = FILTER_CITIES.map((c) => c.slug)
    const sorted = new Map<string, EventDetail[]>()
    for (const slug of order) {
      if (map.has(slug)) sorted.set(slug, map.get(slug)!)
    }
    if (map.has("otros")) sorted.set("otros", map.get("otros")!)
    return sorted
  }, [filteredEvents]);

  const showGroupedByCity = hasFilters && eventsByCity.size > 0

  return (
    <motion.div
      className="flex flex-col gap-5 px-4 pb-4 pt-6"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      <motion.div variants={staggerItem}>
        <Image
          src="/images/logo-orange.png"
          alt="Allons"
          width={200}
          height={64}
          className="h-auto w-40 object-contain sm:w-48"
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <Link
          href="/home/search"
          className="relative flex w-full items-center rounded-lg bg-white px-4 py-3 pr-10 text-left text-sm text-neutral-900 placeholder:text-neutral-500"
          aria-label="Abrir búsqueda"
        >
          <span className="text-neutral-500">Búsqueda</span>
          <svg className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </Link>
      </motion.div>

      <motion.div variants={staggerItem}>
        <CategoryChips filterHref={`/home/filters?${searchParams.toString()}`} />
      </motion.div>

      <motion.section variants={staggerItem}>
        <h2 className="mb-3 text-lg font-bold text-foreground">
          {hasFilters
            ? `Resultados de Búsqueda${filteredEvents.length ? "" : " (ninguno)"}`
            : "Top Eventos Cerca"}
        </h2>

        {showGroupedByCity ? (
          <div className="flex flex-col gap-6 pb-2">
            {Array.from(eventsByCity.entries()).map(([slug, cityEvents]) => (
              <div key={slug}>
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                  {getCityLabel(slug)}
                </h3>
                <motion.ul
                  className="flex flex-col gap-2"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  transition={{ ...transitionSmooth, delayChildren: 0.05 }}
                >
                  {cityEvents.map((event) => (
                    <motion.li key={event.id} variants={staggerItem}>
                      <EventListCard
                        id={event.id}
                        title={event.title}
                        image={event.image}
                      />
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 gap-3 pb-2 sm:grid-cols-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            transition={{ ...transitionSmooth, delayChildren: 0.1 }}
          >
            {filteredEvents.map((event) => (
              <motion.div key={event.id} variants={staggerItem}>
                <EventCard
                  id={event.id}
                  title={event.title}
                  date={event.date}
                  day={event.day}
                  image={event.image}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.section>
    </motion.div>
  );
}
