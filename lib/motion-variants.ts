/** Variantes reutilizables para Motion (motion/react) */

export const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
}

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
}

/** Transición suave para la mayoría de elementos */
export const transitionFast = { type: 'tween' as const, duration: 0.2 }
export const transitionSmooth = { type: 'tween' as const, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }
export const transitionSpring = { type: 'spring' as const, stiffness: 400, damping: 30 }
