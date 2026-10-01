import { motion } from 'motion/react'
import { EASE_OUT_EXPO, Eyebrow, Reveal } from './Reveal'

export function ApostleEndorsement() {
  return (
    <section id="letter" data-testid="apostle-signature-card" className="bg-ink py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <Reveal y={40}>
          <figure className="relative mt-8 rounded-3xl border border-line-2 bg-[linear-gradient(180deg,rgba(24,26,31,0.7),rgba(11,12,14,0.4))] px-6 pt-20 pb-16 text-center sm:px-16">
            <span className="absolute -top-8 left-1/2 grid h-16 w-16 -translate-x-1/2 place-items-center rounded-full border border-gold/40 bg-ink">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-gold/60">
                <svg viewBox="0 0 48 48" className="h-6 w-6" aria-hidden>
                  <path
                    d="M24 7c4.2 6.4 9.8 10.2 9.8 17.5a9.8 9.8 0 0 1-19.6 0c0-2.9 1.3-5.4 3.1-7.6.5 2.2 1.7 3.7 3.1 4.3-.8-5.1.7-9.9 3.6-14.2Z"
                    fill="#E6B86A"
                  />
                </svg>
              </span>
            </span>

            <Eyebrow>A PERSONAL WORD</Eyebrow>

            <blockquote className="mt-8 font-heading text-[1.6rem] leading-[1.5] text-ivory sm:text-[2.35rem] sm:leading-[1.45]">
              “Thank you for stopping by. There is an urgent need for us to ask for the nations from
              the Father — will you join us as we take the nations for God?”
            </blockquote>

            <figcaption className="mt-12">
              <p className="text-sm text-muted">God bless,</p>
              <p className="mt-3 font-heading text-4xl text-gold italic sm:text-5xl">
                Apostle Tosin Williams
              </p>
              <svg
                viewBox="0 0 240 12"
                className="mx-auto mt-2 w-48 sm:w-60"
                fill="none"
                aria-hidden
              >
                <motion.path
                  d="M2 9 C 60 2, 180 2, 238 7"
                  stroke="#E6B86A"
                  strokeOpacity="0.8"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                  transition={{ duration: 1.6, ease: EASE_OUT_EXPO, delay: 0.4 }}
                />
              </svg>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  )
}
