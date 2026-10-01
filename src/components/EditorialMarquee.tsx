const PHRASES = [
  'One Nation At A Time',
  'Let There Be Light',
  'Psalms 2:8 — Ask of Me',
  'The Harvest Is Ripe',
  'The Labourers Are Few',
  'The Ends of The Earth',
]

function Row({ hidden }: { hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {PHRASES.map((phrase) => (
        <li key={phrase} className="flex items-center">
          <span className="px-10 font-heading text-2xl whitespace-nowrap text-gold/90 italic sm:px-14 sm:text-[1.9rem]">
            {phrase}
          </span>
          <span className="h-1.5 w-1.5 rotate-45 bg-gold" aria-hidden />
        </li>
      ))}
    </ul>
  )
}

export function EditorialMarquee() {
  return (
    <div
      data-testid="editorial-marquee"
      className="marquee-mask overflow-hidden border-y border-gold/12 bg-ink py-5 sm:py-6"
    >
      {/* Two identical rows + translate(-50%) = seamless loop */}
      <div className="marquee-track flex w-max animate-marquee">
        <Row />
        <Row hidden />
      </div>
    </div>
  )
}
