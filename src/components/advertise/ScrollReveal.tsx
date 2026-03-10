'use client';

import { motion, type TargetAndTransition } from 'framer-motion';
import { type ReactNode } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  /** Fraction of element visible before triggering (0-1) */
  threshold?: number;
}

const offsets: Record<Direction, TargetAndTransition> = {
  up: { opacity: 0, y: 50 },
  down: { opacity: 0, y: -50 },
  left: { opacity: 0, x: -60 },
  right: { opacity: 0, x: 60 },
  scale: { opacity: 0, scale: 0.85 },
  none: { opacity: 0 },
};

export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.7,
  className = '',
  threshold = 0.25,
}: ScrollRevealProps) {
  return (
    <motion.div
      className={className}
      initial={offsets[direction]}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: threshold }}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 120,
        delay,
        duration,
      }}
    >
      {children}
    </motion.div>
  );
}
