import Lenis from 'lenis'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

const LenisContext = createContext<Lenis | null>(null)

/** Height of the fixed header, used as the offset when jumping to a section. */
export const HEADER_OFFSET = 64

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    // Respect users who prefer less motion – fall back to native scrolling.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const instance = new Lenis({
      // Lower lerp = heavier, more unhurried glide.
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
      autoRaf: true,
    })
    setLenis(instance)
    return () => {
      instance.destroy()
      setLenis(null)
    }
  }, [])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}

export const useLenis = () => useContext(LenisContext)

/** Smoothly scrolls to a section selector like "#register". */
export function useScrollTo() {
  const lenis = useLenis()
  return useCallback(
    (target: string, options: { onComplete?: () => void; immediate?: boolean } = {}) => {
      const el = document.querySelector<HTMLElement>(target)
      if (!el) return
      if (target.startsWith('#')) history.replaceState(null, '', target)

      if (lenis) {
        lenis.scrollTo(el, {
          // Header offset comes from `scroll-padding-top` in index.css.
          duration: 1.8,
          easing: easeOutQuart,
          immediate: options.immediate,
          onComplete: options.onComplete,
        })
      } else {
        const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        window.scrollTo({ top, behavior: reduce || options.immediate ? 'auto' : 'smooth' })
        options.onComplete?.()
      }
    },
    [lenis],
  )
}
