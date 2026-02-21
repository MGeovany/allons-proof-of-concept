"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
interface EventCardProps {
  id: string;
  title: string;
  date: string;
  day: string;
  image: string;
}

export function EventCard({ id, title, date, day, image }: EventCardProps) {
  return (
    <motion.div
      className="flex w-full flex-col overflow-hidden rounded-xl"
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative h-40">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute left-2 top-2 flex flex-col items-center rounded-lg bg-background/80 px-2 py-1 backdrop-blur-sm">
          <span className="text-[10px] font-semibold leading-tight text-orange-primary">
            {date}
          </span>
          <span className="text-sm font-bold leading-tight text-foreground">
            {day}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-3 pt-8">
          <p className="text-sm font-semibold leading-tight text-foreground">
            {title}
          </p>
        </div>
      </div>
      <motion.div whileHover={{ opacity: 0.9 }} whileTap={{ scale: 0.99 }}>
        <Link
          href={`/home/event/${id}`}
          className="block border border-border bg-secondary py-2 text-center text-xs font-medium text-foreground transition-colors hover:bg-accent"
        >
          Ver detalles
        </Link>
      </motion.div>
    </motion.div>
  );
}
