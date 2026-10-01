import { ArrowUpRight, Flame, Globe, Users } from 'lucide-react'
import { useNextGathering } from '../lib/schedule'
import { useScrollTo } from '../lib/smooth-scroll'
import { MaskLine, Reveal } from './Reveal'
import { ResponsiveImage } from './ResponsiveImage'

const PILLARS = [
  {
    icon: Flame,
    title: 'Fervent Intercession',
    body: 'We simply pray — taking one nation at a time before the Father.',
  },
  {
    icon: Globe,
    title: 'Territorial Light',
    body: 'Two-day missions that shine the light of God across cities and nations.',
  },
  {
    icon: Users,
    title: 'Believers Mobilized',
    body: 'Like-minded intercessors united across continents for the harvest.',
  },
]

function Badge({ children }: { children: string }) {
  return (
    <span className="mb-4 w-fit rounded-full border border-gold/35 bg-gold/12 px-3.5 py-1 font-mono text-[10px] tracking-[0.22em] text-gold-soft backdrop-blur-sm">
      {children}
    </span>
  )
}

export function EventsShowcase() {
  const { localLabel } = useNextGathering()
  const scrollTo = useScrollTo()

  return (
    <section id="events" data-testid="events-showcase-section" className="bg-ink py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.32em] text-gold-soft sm:text-xs">
            THE TWO OPERATIONS
          </p>
        </Reveal>
        <h2 className="mt-5 max-w-3xl font-heading text-[2.6rem] leading-[1.05] font-bold tracking-[-0.02em] text-ivory sm:text-6xl">
          <MaskLine>
            Where we gather, <span className="text-gold italic">and where we go.</span>
          </MaskLine>
        </h2>

        <div className="mt-14 grid gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-7" y={40}>
            <article
              data-testid="event-card-prayer"
              className="group relative h-full overflow-hidden rounded-3xl border border-line-2"
            >
              <ResponsiveImage
                name="one-nation"
                widths={[640, 960, 1440]}
                sizes="(min-width: 1280px) 720px, (min-width: 1024px) 58vw, 100vw"
                alt="Intercessors with raised hands in night prayer"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[linear-gradient(200deg,rgba(11,12,14,0.25)_0%,rgba(11,12,14,0.92)_75%)]" />
              <div className="relative flex min-h-[26rem] flex-col justify-end p-8 sm:p-10">
                <Badge>WEEKLY · ONLINE · PRIVATE</Badge>
                <h3 className="font-heading text-3xl font-bold text-ivory sm:text-4xl">
                  One Nation At A Time
                </h3>
                <p className="mt-3 max-w-md leading-relaxed text-sand sm:text-[1.05rem]">
                  A private online prayer and intercessory meeting where we simply pray. Will you
                  join in as we take the nations for God?
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-xs text-gold-soft">
                  <span className="rounded-lg border border-gold/35 bg-ink/40 px-3.5 py-2 tracking-[0.08em]">
                    MONDAYS — 9:00 PM UK
                  </span>
                  <span className="text-muted">{localLabel} your time</span>
                </div>
              </div>
            </article>
          </Reveal>

          <Reveal className="lg:col-span-5" y={40} delay={0.12}>
            <article
              data-testid="event-card-mission"
              className="group relative h-full overflow-hidden rounded-3xl border border-line-2"
            >
              <ResponsiveImage
                name="be-light"
                widths={[480, 800, 1100]}
                sizes="(min-width: 1280px) 520px, (min-width: 1024px) 42vw, 100vw"
                alt="An illuminated globe shining over a night city"
                className="absolute inset-0 h-full w-full object-cover object-[50%_45%] transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[linear-gradient(200deg,rgba(11,12,14,0.3)_0%,rgba(11,12,14,0.93)_78%)]" />
              <div className="relative flex min-h-[26rem] flex-col justify-end p-8 sm:p-10">
                <Badge>2-DAY · MISSION & OUTREACH</Badge>
                <h3 className="font-heading text-3xl font-bold text-ivory sm:text-4xl">
                  Let There Be Light
                </h3>
                <p className="mt-3 max-w-md leading-relaxed text-sand sm:text-[1.05rem]">
                  A 2-day mission and outreach operation shining the light of God in different
                  nations. The harvest is ripe and the labourers are few — we hope to be in your
                  city next.
                </p>
                <a
                  href="#register"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollTo('#register')
                  }}
                  className="mt-6 inline-flex w-fit items-center gap-1.5 text-sm text-gold-soft transition-colors hover:text-gold-hi"
                >
                  Bring a mission to your city
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </article>
          </Reveal>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {PILLARS.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 0.1}>
              <div className="h-full rounded-3xl border border-line-2 bg-surface/60 p-8 transition-colors duration-500 hover:border-gold/30 sm:p-10">
                <Icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
                <h4 className="mt-8 font-heading text-2xl text-ivory">{title}</h4>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
