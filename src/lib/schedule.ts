import { useEffect, useState } from 'react'

/** The weekly "One Nation At A Time" prayer call: Mondays, 9:00 PM UK time. */
export const GATHERING = {
  timeZone: 'Europe/London',
  weekday: 'Mon',
  hour: 21,
  minute: 0,
  /** How long the call is considered "live" after it starts. */
  durationMinutes: 90,
} as const

export const WORLD_CITIES = [
  { city: 'London', timeZone: 'Europe/London' },
  { city: 'New York', timeZone: 'America/New_York' },
  { city: 'Lagos', timeZone: 'Africa/Lagos' },
  { city: 'Nairobi', timeZone: 'Africa/Nairobi' },
  { city: 'Singapore', timeZone: 'Asia/Singapore' },
  { city: 'Sydney', timeZone: 'Australia/Sydney' },
] as const

type ZonedParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  weekday: string
}

const partsFormatters = new Map<string, Intl.DateTimeFormat>()

function zonedParts(date: Date, timeZone: string): ZonedParts {
  let fmt = partsFormatters.get(timeZone)
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    partsFormatters.set(timeZone, fmt)
  }
  const out: Record<string, string> = {}
  for (const p of fmt.formatToParts(date)) out[p.type] = p.value
  return {
    year: +out.year,
    month: +out.month,
    day: +out.day,
    hour: +out.hour,
    minute: +out.minute,
    second: +out.second,
    weekday: out.weekday,
  }
}

/** Offset (ms) of `timeZone` from UTC at the given instant. */
function offsetMs(date: Date, timeZone: string) {
  const p = zonedParts(date, timeZone)
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  return asUtc - Math.floor(date.getTime() / 1000) * 1000
}

/** Converts a wall-clock time in `timeZone` to a real instant (DST-safe). */
function zonedToDate(y: number, m: number, d: number, h: number, min: number, timeZone: string) {
  const guess = Date.UTC(y, m - 1, d, h, min)
  const first = offsetMs(new Date(guess), timeZone)
  let ts = guess - first
  const second = offsetMs(new Date(ts), timeZone)
  if (second !== first) ts = guess - second
  return new Date(ts)
}

export function getNextGathering(now = new Date()) {
  const { timeZone, weekday, hour, minute, durationMinutes } = GATHERING
  for (let i = 0; i <= 8; i++) {
    const probe = new Date(now.getTime() + i * 86_400_000)
    const p = zonedParts(probe, timeZone)
    if (p.weekday !== weekday) continue
    const start = zonedToDate(p.year, p.month, p.day, hour, minute, timeZone)
    const end = start.getTime() + durationMinutes * 60_000
    if (end > now.getTime()) return { start, live: now >= start }
  }
  // Unreachable in practice – a Monday always exists within 8 days.
  return { start: now, live: false }
}

export function formatCountdown(ms: number) {
  if (ms <= 60_000) return 'moments'
  const totalMin = Math.floor(ms / 60_000)
  const d = Math.floor(totalMin / 1440)
  const h = Math.floor((totalMin % 1440) / 60)
  const m = totalMin % 60
  return [d && `${d}d`, (d || h) && `${h}h`, `${m}m`].filter(Boolean).join(' ')
}

const timeFmt = (timeZone?: string) =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

/** e.g. "4:00 pm" in the given zone. */
export function formatTimeIn(date: Date, timeZone?: string) {
  return timeFmt(timeZone).format(date).toLowerCase()
}

/** Short weekday of `date` in `timeZone`, e.g. "Tue". */
export function weekdayIn(date: Date, timeZone?: string) {
  return new Intl.DateTimeFormat('en-GB', { timeZone, weekday: 'short' }).format(date)
}

/** e.g. "Monday, 9:00 pm GMT+1" in the visitor's own timezone. */
export function formatLocal(date: Date) {
  const day = new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(date)
  let zone = ''
  try {
    zone =
      new Intl.DateTimeFormat('en-GB', { timeZoneName: 'shortOffset' })
        .formatToParts(date)
        .find((p) => p.type === 'timeZoneName')?.value ?? ''
  } catch {
    // older engines without shortOffset – just omit the zone name
  }
  return `${day}, ${formatTimeIn(date)}${zone ? ` ${zone}` : ''}`
}

/** Live-updating view of the next gathering. Re-renders every 20 seconds. */
export function useNextGathering() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 20_000)
    const onVisible = () => document.visibilityState === 'visible' && setNow(new Date())
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])
  const { start, live } = getNextGathering(now)
  return {
    start,
    live,
    countdown: formatCountdown(start.getTime() - now.getTime()),
    localLabel: formatLocal(start),
  }
}
