import { motion, type HTMLMotionProps } from 'motion/react'
import type { ReactNode } from 'react'

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

const viewport = { once: true, margin: '0px 0px -12% 0px' } as const

/** Fades + lifts its content into place the first time it scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  ...rest
}: { children: ReactNode; delay?: number; y?: number } & HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 1.1, ease: EASE_OUT_EXPO, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/** A line of text that slides up from behind a mask. */
export function MaskLine({
  children,
  delay = 0,
  onMount = false,
  className = '',
}: {
  children: ReactNode
  delay?: number
  /** Animate immediately (hero) instead of on scroll. */
  onMount?: boolean
  className?: string
}) {
  // The outer (visible) mask watches the viewport; the inner line is hidden
  // below it, so it could never intersect on its own.
  return (
    <motion.span
      className={`block overflow-hidden pb-[0.1em] mb-[-0.1em] ${className}`}
      initial="hidden"
      {...(onMount ? { animate: 'shown' } : { whileInView: 'shown', viewport })}
    >
      <motion.span
        className="block will-change-transform"
        variants={{ hidden: { y: '110%' }, shown: { y: '0%' } }}
        transition={{ duration: 1.25, ease: EASE_OUT_EXPO, delay }}
      >
        {children}
      </motion.span>
    </motion.span>
  )
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`font-mono text-[11px] uppercase tracking-[0.32em] text-gold-soft sm:text-xs ${className}`}
    >
      {children}
    </p>
  )
}
