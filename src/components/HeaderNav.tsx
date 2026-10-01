import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'
import { useLenis, useScrollTo } from '../lib/smooth-scroll'
// import { Logo } from './Logo'
import { EASE_OUT_EXPO } from './Reveal'

export const NAV_LINKS = [
  { label: 'The Mandate', href: '#scripture' },
  { label: 'The Operations', href: '#events' },
  { label: 'The Letter', href: '#letter' },
] as const

/** Tracks which section is currently in the middle band of the viewport. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(`#${e.target.id}`)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    const els = ids.map((id) => document.querySelector(id)).filter(Boolean) as Element[]
    els.forEach((el) => observer.observe(el))
    // Clear the highlight when we're back in the hero.
    const hero = document.querySelector('[data-section="hero"]')
    const heroObserver = new IntersectionObserver(
      ([e]) => e.isIntersecting && setActive(null),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    if (hero) heroObserver.observe(hero)
    return () => {
      observer.disconnect()
      heroObserver.disconnect()
    }
  }, [ids])
  return active
}

const SECTION_IDS = [...NAV_LINKS.map((l) => l.href), '#register']

export function HeaderNav() {
  const scrollTo = useScrollTo()
  const lenis = useLenis()
  const active = useActiveSection(SECTION_IDS)
  const [open, setOpen] = useState(false)

  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  // Lock page scroll while the mobile menu is open.
  useEffect(() => {
    if (open) lenis?.stop()
    else lenis?.start()
    document.documentElement.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, lenis])

  const go = (href: string, focusId?: string) => {
    setOpen(false)
    // Let the menu start closing before we glide away.
    requestAnimationFrame(() =>
      scrollTo(href, {
        onComplete: focusId
          ? () => document.getElementById(focusId)?.focus({ preventScroll: true })
          : undefined,
      }),
    )
  }

  return (
    <>
      <header
        data-testid="header-nav"
        className="fixed top-0 z-50 w-full border-b border-gold/15 bg-ink/85 backdrop-blur-xl backdrop-saturate-150"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              history.replaceState(null, '', ' ')
              lenis ? lenis.scrollTo(0, { duration: 1.8 }) : window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="flex items-center gap-3"
            aria-label="At Least A Nation — back to top"
          >
            {/* <Logo className="h-8 w-8 shrink-0" /> */}
            <img src='/images/alan.jpg' className='w-8 rounded-md p-1 bg-white'/>
            <span className="font-mono text-[11px] tracking-[0.32em] text-ivory whitespace-nowrap">
              AT LEAST A NATION
            </span>
          </button>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => {
              const isActive = active === link.href
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault()
                    go(link.href)
                  }}
                  aria-current={isActive ? 'true' : undefined}
                  className={`relative py-1 text-[0.95rem] transition-colors duration-300 ${
                    isActive ? 'text-ivory' : 'text-sand hover:text-ivory'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-0 -bottom-0.5 h-px bg-gold"
                      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                    />
                  )}
                </a>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go('#register', 'reg-name')}
              data-testid="nav-join-button"
              className="hidden h-7 items-center rounded-full bg-gold px-5 text-[0.8rem] font-medium whitespace-nowrap text-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold-hi hover:shadow-[0_8px_30px_rgba(230,184,106,0.35)] sm:inline-flex"
            >
              Join the Movement
            </button>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="relative -mr-2 grid h-10 w-10 place-items-center rounded-full md:hidden"
            >
              <span
                className={`absolute h-px w-5 bg-ivory transition-transform duration-500 ease-[var(--ease-out-expo)] ${
                  open ? 'rotate-45' : '-translate-y-[4px]'
                }`}
              />
              <span
                className={`absolute h-px w-5 bg-ivory transition-transform duration-500 ease-[var(--ease-out-expo)] ${
                  open ? '-rotate-45' : 'translate-y-[4px]'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Reading progress */}
        <motion.div
          aria-hidden
          style={{ scaleX: progress }}
          className="absolute inset-x-0 -bottom-px h-px origin-left bg-gradient-to-r from-gold/0 via-gold/80 to-gold"
        />
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
            className="fixed inset-0 z-40 flex flex-col bg-ink px-5 pt-28 pb-10 md:hidden"
          >
            <nav className="flex flex-col gap-2" aria-label="Mobile">
              {[...NAV_LINKS, { label: 'Register Interest', href: '#register' }].map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault()
                    go(link.href)
                  }}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.15 + i * 0.06 }}
                  className="flex items-baseline gap-4 border-b border-line py-4 font-heading text-4xl text-ivory"
                >
                  <span className="font-mono text-xs tracking-[0.2em] text-gold-soft">
                    0{i + 1}
                  </span>
                  {link.label}
                </motion.a>
              ))}
            </nav>
            <motion.button
              type="button"
              onClick={() => go('#register', 'reg-name')}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.45 }}
              className="mt-auto h-12 rounded-full bg-gold font-medium text-ink"
            >
              Join the Movement
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
