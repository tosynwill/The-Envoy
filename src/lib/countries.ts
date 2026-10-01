// Builds an English country list from the browser's own Intl data,
// so we don't ship a hard-coded list of ~250 names.
const NOT_COUNTRIES = new Set([
  'EU', 'EZ', 'UN', 'QO', 'XA', 'XB', 'ZZ',
  // historic / deprecated codes
  'AN', 'BU', 'CS', 'DD', 'DY', 'FX', 'HV', 'NH', 'RH', 'SU', 'TP', 'YD', 'YU', 'ZR',
])

let cache: string[] | null = null

export function getCountries(): string[] {
  if (cache) return cache
  const names = new Set<string>()
  try {
    const dn = new Intl.DisplayNames(['en'], { type: 'region', fallback: 'none' })
    for (let a = 65; a <= 90; a++) {
      for (let b = 65; b <= 90; b++) {
        const code = String.fromCharCode(a, b)
        if (NOT_COUNTRIES.has(code)) continue
        try {
          const name = dn.of(code)
          if (name && name !== code) names.add(name)
        } catch {
          // invalid code for this engine – skip
        }
      }
    }
  } catch {
    // Intl.DisplayNames unsupported – the field still works as free text
  }
  cache = [...names].sort((x, y) => x.localeCompare(y))
  return cache
}
