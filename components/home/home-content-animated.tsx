"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { SearchBar } from "@/components/home/search-bar";
import { CategoryChips } from "@/components/home/category-chips";
import { EventCard } from "@/components/home/event-card";
import type { EventDetail } from "@/lib/events";
import { staggerContainer, staggerItem, transitionSmooth } from "@/lib/motion-variants";

type Props = { events: EventDetail[] };

export function HomeContentAnimated({ events }: Props) {
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
        <SearchBar />
      </motion.div>

      <motion.div variants={staggerItem}>
        <CategoryChips />
      </motion.div>

      <motion.section variants={staggerItem}>
        <h2 className="mb-3 text-lg font-bold text-foreground">
          Top Eventos Cerca
        </h2>
        <motion.div
          className="flex gap-3 justify-between overflow-x-auto pb-2 scrollbar-none"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          transition={{ ...transitionSmooth, delayChildren: 0.1 }}
        >
          {events.map((event, i) => (
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
      </motion.section>
    </motion.div>
  );
}
