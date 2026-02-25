"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ImageIcon } from "lucide-react";
import { DEFAULT_BANNER } from "@/lib/events";

interface EventListCardProps {
  id: string;
  title: string;
  image: string;
}

export function EventListCard({ id, title, image }: EventListCardProps) {
  const usePlaceholder = image === DEFAULT_BANNER || !image;
  const [imgError, setImgError] = useState(false);
  const showPlaceholder = usePlaceholder || imgError;

  return (
    <Link href={`/home/event/${id}`} className="block w-full">
      <motion.div
        className="flex w-full items-center gap-3 rounded-xl border border-border bg-secondary/80 p-3 transition-colors hover:bg-secondary"
        whileTap={{ scale: 0.99 }}
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
          {showPlaceholder ? (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground/60" />
            </div>
          ) : (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              sizes="64px"
              onError={() => setImgError(true)}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-tight text-foreground line-clamp-2">
            {title}
          </p>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            Detalles de evento
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
