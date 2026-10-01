import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { formatTimeIn, useNextGathering, weekdayIn, WORLD_CITIES } from '../lib/schedule'
import { useScrollTo } from '../lib/smooth-scroll'
import { Logo } from './Logo'
import { Reveal } from './Reveal'

const EXPLORE = [
  { label: 'The Mandate', href: '#scripture' },
  { label: 'The Operations', href: '#events' },
  { label: 'Register Interest', href: '#register' },
]

const PARTNERS = [
  { name: 'Tosin Williams World Outreach', image: 'logo-twwo' },
  { name: 'The Envoy', image: 'logo-envoy' },
  { name: 'Glory Embassy International Church', image: 'logo-glory' },
]

function FooterHeading({ children }: { children: string }) {
  return (
    <p className="font-mono text-[11px] tracking-[0.32em] text-gold-soft sm:text-xs">{children}</p>
  )
}

export function Footer() {
  const scrollTo = useScrollTo()
  const { start } = useNextGathering()
  const wordmarkRef = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: wordmarkRef, offset: ['start end', 'end end'] })
  const wordmarkY = useTransform(scrollYProgress, [0, 1], ['30%', '0%'])

  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  return (
    <footer data-testid="footer" className="overflow-hidden border-t border-line bg-ink pt-16">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 md:grid-cols-3">
        <Reveal>
          <div className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <span className="font-mono text-[11px] tracking-[0.32em] text-ivory">
              AT LEAST A NATION
            </span>
          </div>
          <p className="mt-6 max-w-sm leading-relaxed text-muted">
            An end-time global movement inspired by God — asking the Father for the nations, one
            nation at a time.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <FooterHeading>EXPLORE</FooterHeading>
          <ul className="mt-6 space-y-4">
            {EXPLORE.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollTo(link.href)
                  }}
                  className="text-sand transition-colors duration-300 hover:text-gold-soft"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.16}>
          <FooterHeading>MONDAY PRAYER — AROUND THE WORLD</FooterHeading>
          <ul className="mt-6 space-y-3">
            {WORLD_CITIES.map(({ city, timeZone }) => {
              const day = weekdayIn(start, timeZone)
              return (
                <li key={city} className="flex items-baseline justify-between gap-4">
                  <span className="text-sand">{city}</span>
                  <span className="font-mono text-sm text-muted tabular-nums">
                    {day !== 'Mon' && <span className="mr-2 text-[11px] text-faint">{day}</span>}
                    {formatTimeIn(start, timeZone)}
                  </span>
                </li>
              )
            })}
            {!WORLD_CITIES.some((c) => c.timeZone === localZone) && (
              <li className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
                <span className="text-gold-soft">Your time</span>
                <span className="font-mono text-sm text-gold-soft tabular-nums">
                  <span className="mr-2 text-[11px] opacity-70">{weekdayIn(start)}</span>
                  {formatTimeIn(start)}
                </span>
              </li>
            )}
          </ul>
        </Reveal>
      </div>

      <div data-testid="footer-powered-by" className="mx-auto mt-16 max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col items-center gap-7 border-t border-line-3 pt-12">
          <p className="font-mono text-[11px] tracking-[0.32em] text-dim">POWERED BY</p>
          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8">
            {PARTNERS.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.08} y={16}>
                <picture>
                  <source type="image/webp" srcSet={`/images/${p.image}-256.webp`} />
                  <img
                    src={`/images/${p.image}-256.jpg`}
                    alt={p.name}
                    title={p.name}
                    width={96}
                    height={96}
                    loading="lazy"
                    decoding="async"
                    className="h-20 w-20 rounded-2xl bg-white object-contain p-1.5 ring-1 ring-gold/25 transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-105 sm:h-24 sm:w-24"
                  />
                </picture>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <motion.p
        ref={wordmarkRef}
        aria-hidden
        data-testid="footer-wordmark"
        style={{ y: wordmarkY }}
        className="mt-16 text-center font-heading text-[12.5vw] leading-[0.85] font-bold tracking-[-0.02em] text-[#16171B] select-none"
      >
        AT LEAST A NATION
      </motion.p>

      <div className="border-t border-line-3 px-5 py-6 text-center font-mono text-[11px] tracking-[0.18em] text-faint">
        © {new Date().getFullYear()} AT LEAST A NATION MOVEMENT · PSALMS 2:8
      </div>
    </footer>
  )
}
