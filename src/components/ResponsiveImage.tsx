import { useState } from 'react'

type Props = {
  /** Base name of the generated files in /public/images, e.g. "hero". */
  name: string
  widths: number[]
  sizes: string
  alt: string
  className?: string
  priority?: boolean
}

const srcSet = (name: string, widths: number[], ext: 'webp' | 'jpg') =>
  widths.map((w) => `/images/${name}-${w}.${ext} ${w}w`).join(', ')

/**
 * <picture> with WebP + JPEG fallbacks at several widths, lazy by default,
 * that fades in once decoded so it never "pops" in half-painted.
 */
export function ResponsiveImage({ name, widths, sizes, alt, className = '', priority }: Props) {
  const [loaded, setLoaded] = useState(false)
  const fallback = widths[Math.min(1, widths.length - 1)]

  return (
    <picture>
      <source type="image/webp" srcSet={srcSet(name, widths, 'webp')} sizes={sizes} />
      <img
        src={`/images/${name}-${fallback}.jpg`}
        srcSet={srcSet(name, widths, 'jpg')}
        sizes={sizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        ref={(img) => {
          // Handles images already complete from cache before hydration.
          if (img?.complete && img.naturalWidth > 0 && !loaded) setLoaded(true)
        }}
        onLoad={() => setLoaded(true)}
        className={`${className} transition-opacity duration-[1200ms] ease-out ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </picture>
  )
}
