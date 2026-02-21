"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { CalendarImage } from "lucide-react";
import { DEFAULT_BANNER } from "@/lib/events";

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  day: string;
  image: string;
}

export function EventCard({ id, title, date, day, image }: EventCardProps) {
  const usePlaceholder =
    image === DEFAULT_BANNER || !image;
  const [imgError, setImgError] = useState(false);
  const showPlaceholder = usePlaceholder || imgError;

  return (
    <Link href={`/home/event/${id}`} className="block w-full">
      <motion.div
        className="flex w-full flex-col overflow-hidden rounded-xl border border-border bg-secondary"
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative h-40">
          {showPlaceholder ? (
            <div
              className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/80"
              aria-hidden
            >
              <CalendarImage className="h-12 w-12 shrink-0 text-muted-foreground/60" />
              <span className="text-xs font-medium text-muted-foreground">
                Sin imagen
              </span>
            </div>
          ) : (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={() => setImgError(true)}
            />
          )}
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
        <div className="rounded-b-xl border-t border-border bg-secondary py-2 text-center text-xs font-medium text-foreground transition-colors hover:bg-accent">
          Ver detalles
        </div>
      </motion.div>
    </Link>
  );
}
