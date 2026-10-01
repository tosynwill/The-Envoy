import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'
import { Eyebrow, Reveal } from './Reveal'

const VERSE: { text: string; gold?: boolean }[] = [
  { text: '“Ask of Me, and I will give You' },
  { text: 'the nations', gold: true },
  { text: 'for Your inheritance, and' },
  { text: 'the ends of the earth', gold: true },
  { text: 'for Your possession.”' },
]

const WORDS = VERSE.flatMap((seg) => seg.text.split(' ').map((w) => ({ w, gold: seg.gold })))

function Word({
  children,
  gold,
  progress,
  range,
}: {
  children: string
  gold?: boolean
  progress: MotionValue<number>
  range: [number, number]
}) {
  const opacity = useTransform(progress, range, [0.16, 1])
  return (
    <motion.span style={{ opacity }} className={gold ? 'text-gold italic' : undefined}>
      {children}{' '}
    </motion.span>
  )
}

export function ScriptureAltar() {
  const quoteRef = useRef<HTMLQuoteElement>(null)
  // Words light up one by one as the verse travels up the screen.
  const { scrollYProgress } = useScroll({
    target: quoteRef,
    offset: ['start 88%', 'end 55%'],
  })

  return (
    <section
      id="scripture"
      data-testid="scripture-altar-section"
      className="relative overflow-hidden bg-ink-2 py-28 sm:py-40"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%] bg-[radial-gradient(50%_60%_at_50%_0%,rgba(230,184,106,0.12),transparent_70%)]"
      />
      <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-8">
        <Reveal>
          <Eyebrow>THE MANDATE — PSALMS 2 : 8</Eyebrow>
        </Reveal>

        <blockquote
          ref={quoteRef}
          className="mt-10 font-heading text-[2.1rem] leading-[1.28] text-ivory sm:text-5xl sm:leading-[1.25] lg:text-[3.65rem]"
        >
          <p className="sr-only">
            Ask of Me, and I will give You the nations for Your inheritance, and the ends of the
            earth for Your possession.
          </p>
          <p aria-hidden>
            {WORDS.map(({ w, gold }, i) => {
              const start = i / WORDS.length
              return (
                <Word
                  key={i}
                  gold={gold}
                  progress={scrollYProgress}
                  range={[start, start + 1 / WORDS.length]}
                >
                  {w}
                </Word>
              )
            })}
          </p>
        </blockquote>

        <Reveal delay={0.1} className="mt-12 flex items-center justify-center gap-6">
          <span className="h-px w-16 bg-gold/30 sm:w-20" />
          <span className="h-2 w-2 rotate-45 bg-gold" />
          <span className="h-px w-16 bg-gold/30 sm:w-20" />
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mt-12 text-lg text-muted sm:text-xl">
            There is an urgent need for us to take the nations for Jesus in prayers.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
