import { ArrowLeft, ArrowUpRight, Check, Mail, Truck } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { AUTHOR, BOOKS, formatPrice, type Book, type BookFormat } from '../lib/books'
import { EASE_OUT_EXPO, Eyebrow, MaskLine, Reveal } from './Reveal'
import { ResponsiveImage } from './ResponsiveImage'

function useTitle(title: string) {
  useEffect(() => {
    document.title = title
  }, [title])
}

function BuyButton({ format, primary }: { format: BookFormat; primary: boolean }) {
  const ready = Boolean(format.link) && format.price !== null
  const label = (
    <>
      <span>{format.kind}</span>
      <span className="opacity-60">·</span>
      <span className="tabular-nums">{ready ? formatPrice(format.price!) : 'Coming soon'}</span>
    </>
  )
  const base =
    'inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-[0.9rem] font-medium whitespace-nowrap transition-all duration-300'

  if (!ready) {
    return (
      <span
        aria-disabled
        className={`${base} cursor-not-allowed border border-line-2 text-dim`}
        title="Not available to order yet"
      >
        {label}
      </span>
    )
  }
  return (
    <a
      href={format.link}
      // Same tab: Stripe brings buyers back to /books/thanks after paying.
      rel="noopener"
      className={`${base} ${
        primary
          ? 'bg-gold text-ink hover:-translate-y-0.5 hover:bg-gold-hi hover:shadow-[0_10px_36px_rgba(230,184,106,0.3)]'
          : 'border border-gold/40 text-gold-soft hover:border-gold hover:bg-gold/10'
      }`}
    >
      {label}
      <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
    </a>
  )
}

function BookCard({ book, index }: { book: Book; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const aboutId = `about-${book.id}`

  return (
    <Reveal delay={Math.min(index, 1) * 0.08} y={40}>
      <article
        id={book.id}
        className="flex flex-col gap-7 rounded-3xl border border-line-2 bg-ink/50 p-6 sm:flex-row sm:gap-10 sm:p-8 lg:p-10"
      >
        {/* <picture> is display:contents so the cover's max-size is measured against this frame. */}
        <div className="mx-auto flex aspect-2/3 w-44 shrink-0 items-center justify-center sm:mx-0 sm:w-48 lg:w-56 [&>picture]:contents">
          <ResponsiveImage
            name={book.cover}
            widths={book.coverWidths}
            sizes="(min-width: 1024px) 224px, 192px"
            alt={`${book.title} by ${AUTHOR.name}, book cover`}
            className="max-h-full max-w-full rounded-[3px] object-contain shadow-[0_24px_60px_-12px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.06)]"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="font-heading text-3xl leading-tight font-bold text-ivory sm:text-4xl">
            {book.title}
          </h2>
          <p className="mt-1.5 text-[0.95rem] text-gold-soft italic sm:text-base">{book.subtitle}</p>

          {/* Full description from sm up (the card is wide enough); clamped on phones. */}
          <p
            id={aboutId}
            className={`mt-4 leading-relaxed text-muted ${expanded ? '' : 'line-clamp-4 sm:line-clamp-none'}`}
          >
            {book.about}
          </p>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls={aboutId}
            className="mt-2 w-fit text-sm text-gold-soft underline-offset-4 hover:underline sm:hidden"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>

          <div className="mt-auto flex flex-wrap gap-3 pt-6">
            {book.formats.map((f, i) => (
              <BuyButton key={f.kind} format={f} primary={i === 0} />
            ))}
          </div>
          <p className="mt-3 text-xs text-dim">{book.formats[0].kind} price includes delivery.</p>
        </div>
      </article>
    </Reveal>
  )
}

export function BooksPage() {
  useTitle('Books by Tosin Williams — At Least A Nation')

  return (
    <>
      <section className="relative overflow-hidden bg-ink pt-36 pb-16 sm:pt-44 sm:pb-20">
        <div aria-hidden className="gold-beam pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <Eyebrow>THE BOOKSTORE</Eyebrow>
          </Reveal>
          <h1 className="mt-5 max-w-4xl font-heading text-[2.8rem] leading-[1.03] font-bold tracking-[-0.02em] text-ivory sm:text-7xl">
            <MaskLine onMount>Words to build</MaskLine>
            <MaskLine onMount delay={0.08}>
              <span className="text-gold italic">your faith on.</span>
            </MaskLine>
          </h1>
          <Reveal delay={0.15}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Books by {AUTHOR.name} on identity, purpose and daily devotion. Order a printed copy
              delivered to your door, or an ebook sent straight to your inbox.
            </p>
          </Reveal>
          <Reveal delay={0.22}>
            <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-sand">
              <li className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-gold" strokeWidth={1.75} /> Delivery included in
                every printed book price
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold" strokeWidth={1.75} /> Ebooks emailed instantly
                after payment
              </li>
            </ul>
          </Reveal>
        </div>
      </section>

      <section aria-label="Books" className="bg-ink pb-24 sm:pb-32">
        <div className="mx-auto grid max-w-5xl gap-6 px-5 sm:px-8">
          {BOOKS.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} />
          ))}
        </div>
      </section>

      <section aria-labelledby="author-heading" className="border-t border-line bg-ink-3 py-24 sm:py-28">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <Reveal>
            <Eyebrow>ABOUT THE AUTHOR</Eyebrow>
          </Reveal>
          <h2
            id="author-heading"
            className="mt-5 font-heading text-4xl font-bold tracking-[-0.02em] text-ivory sm:text-5xl"
          >
            <MaskLine>{AUTHOR.name}</MaskLine>
          </h2>
          <Reveal delay={0.1}>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted">
              {AUTHOR.bio.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}

export function BooksThanksPage() {
  useTitle('Thank you — At Least A Nation')

  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-ink pt-32 pb-24">
      <div aria-hidden className="gold-beam pointer-events-none absolute inset-0" />
      <div className="relative mx-auto flex max-w-xl flex-col items-center px-5 text-center sm:px-8">
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.15 }}
          className="grid h-16 w-16 place-items-center rounded-full border border-gold/40 bg-gold/10"
        >
          <Check className="h-7 w-7 text-gold" strokeWidth={1.75} />
        </motion.span>
        <h1 className="mt-8 font-heading text-4xl font-bold text-ivory sm:text-5xl">
          <MaskLine onMount delay={0.1}>
            Thank you for your order.
          </MaskLine>
        </h1>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.3 }}
          className="mt-6 space-y-4 leading-relaxed text-muted"
        >
          <p>A receipt is on its way to your email.</p>
          <p>
            <strong className="font-medium text-sand">Ebook?</strong> Your download link arrives by
            email within a few minutes. Please check your spam folder if you don’t see it.
          </p>
          <p>
            <strong className="font-medium text-sand">Printed book?</strong> We’ll post it to the
            address you gave at checkout.
          </p>
          <p>God bless you.</p>
        </motion.div>
        <motion.a
          href="/books"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="mt-10 inline-flex items-center gap-2 text-sm text-gold-soft underline-offset-4 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} /> Back to the bookstore
        </motion.a>
      </div>
    </section>
  )
}
