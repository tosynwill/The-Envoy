import { ArrowDown } from 'lucide-react'
import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import placeholders from '../generated/placeholders.json'
import { useNextGathering } from '../lib/schedule'
import { useScrollTo } from '../lib/smooth-scroll'
import { EASE_OUT_EXPO, MaskLine } from './Reveal'
import { ResponsiveImage } from './ResponsiveImage'

export function HeroSection() {
  const ref = useRef<HTMLElement>(null)
  const scrollTo = useScrollTo()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '12%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])

  return (
    <section
      ref={ref}
      data-section="hero"
      data-testid="hero-section"
      className="relative flex min-h-svh items-end overflow-hidden"
    >
      {/* Background: blurred inline placeholder → full image, with slow zoom-in + parallax */}
      <motion.div
        aria-hidden
        className="absolute inset-0 will-change-transform"
        style={{ y: bgY }}
      >
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${placeholders.hero})` }}
          initial={{ scale: 1.22 }}
          animate={{ scale: 1.1 }}
          transition={{ duration: 2.8, ease: EASE_OUT_EXPO }}
        >
          <ResponsiveImage
            name="hero"
            widths={[768, 1280, 1920, 2560]}
            sizes="100vw"
            alt=""
            priority
            className="h-full w-full object-cover"
          />
        </motion.div>
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,12,14,0.72)_0%,rgba(11,12,14,0.86)_55%,#0B0C0E_100%)]" />
      <div className="gold-beam absolute inset-0" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto w-full max-w-7xl px-5 pt-36 pb-16 sm:px-8 sm:pb-20"
      >
        <MaskLine onMount delay={0.2}>
          <p className="mb-6 font-mono text-[11px] tracking-[0.32em] text-gold-soft sm:text-xs">
            AN END-TIME GLOBAL MOVEMENT — INSPIRED BY G3:16
          </p>
        </MaskLine>

        <h1 className="font-heading leading-[0.92] font-bold tracking-[-0.03em] text-ivory">
          <MaskLine onMount delay={0.35}>
            <span className="block text-[15vw] sm:text-[11vw] lg:text-[8.5rem]">AT LEAST</span>
          </MaskLine>
          <MaskLine onMount delay={0.5}>
            <span className="block text-[15vw] text-gold italic sm:text-[11vw] lg:text-[8.5rem]">
              A NATION
            </span>
          </MaskLine>
        </h1>

        <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: EASE_OUT_EXPO, delay: 0.85 }}
            className="max-w-xl"
          >
            <p className="text-lg leading-relaxed text-sand sm:text-xl sm:leading-[1.65]">
              We invite like-minded believers who desire to see God move in the nations of the
              earth. The nations are our inheritance — will you ask of Him?
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4 sm:gap-5">
              <button
                type="button"
                data-testid="hero-register-button"
                onClick={() =>
                  scrollTo('#register', {
                    onComplete: () =>
                      document.getElementById('reg-name')?.focus({ preventScroll: true }),
                  })
                }
                className="inline-flex h-12 items-center rounded-full bg-gold px-9 font-medium text-ink transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-hi hover:shadow-[0_10px_36px_rgba(230,184,106,0.35)]"
              >
                Register Your Interest
              </button>
              <button
                type="button"
                onClick={() => scrollTo('#scripture')}
                className="group inline-flex h-12 items-center gap-3 rounded-full border border-line-2 bg-ink/40 px-9 text-ivory backdrop-blur transition-colors duration-300 hover:border-gold/50"
              >
                Psalms 2:8
                <ArrowDown
                  className="h-4 w-4 text-gold transition-transform duration-500 group-hover:translate-y-1"
                  strokeWidth={1.75}
                />
              </button>
            </div>
          </motion.div>

          <NextGatheringCard />
        </div>
      </motion.div>
    </section>
  )
}

function NextGatheringCard() {
  const { live, countdown, localLabel } = useNextGathering()
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: EASE_OUT_EXPO, delay: 1.05 }}
      data-testid="next-gathering-card"
      className="w-full rounded-2xl border border-line-2 bg-ink/55 p-6 backdrop-blur-md lg:max-w-md"
    >
      <div className="flex items-start gap-3">
        <span className="mt-1.25 h-2 w-2 shrink-0 animate-pulse-dot rounded-full bg-gold" />
        <p className="font-mono text-[11px] leading-relaxed tracking-[0.32em] text-gold-soft">
          {live ? 'HAPPENING NOW — ONE NATION AT A TIME' : 'NEXT GATHERING — ONE NATION AT A TIME'}
        </p>
      </div>
      <p className="mt-4 font-heading text-3xl text-ivory">Monday · 9:00 PM UK</p>
      <p className="mt-1.5 text-sm text-muted">
        {live ? (
          <>We are praying right now · {localLabel} your time</>
        ) : (
          <>
            in <span className="tabular-nums">{countdown}</span> · {localLabel} your time
          </>
        )}
      </p>
    </motion.div>
  )
}
