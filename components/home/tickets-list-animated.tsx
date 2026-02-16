"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import type { EventDetail } from "@/lib/events";
import { staggerContainer, staggerItem, transitionSmooth } from "@/lib/motion-variants";

type Item = { event: EventDetail; quantity: number };

export function TicketsListAnimated({ items }: { items: Item[] }) {
  return (
    <motion.div
      className="flex flex-col gap-4 pb-28"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      transition={transitionSmooth}
    >
      {items.map(({ event, quantity }) => (
        <motion.div key={event.id} variants={staggerItem}>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }}>
            <Link
              href={`/home/event/${event.id}/codigo`}
              className="relative block h-32 overflow-hidden rounded-2xl"
              aria-label={`Ticket de ${event.title}`}
            >
              <Image
                src={event.ticketImage ?? event.bannerImage ?? event.image}
                alt={event.title}
                fill
                className="object-cover"
                sizes="(max-width: 430px) 100vw, 430px"
                priority
              />
              <div className="absolute inset-0 bg-black/35" aria-hidden />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-lg font-semibold text-white">{event.title}</p>
                <p className="mt-1 text-xs text-white/80">
                  {quantity} {quantity === 1 ? "ticket" : "tickets"}
                </p>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
}
