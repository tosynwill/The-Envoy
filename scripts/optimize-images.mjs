// Generates responsive, compressed variants of the source images.
// Run with `npm run images` whenever an image in /source-images changes.
import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const SRC = 'source-images'
const OUT = 'public/images'

const jobs = [
  { src: 'heroBg.jpeg', name: 'hero', widths: [768, 1280, 1920, 2560], placeholder: true },
  { src: 'oneNation.jpeg', name: 'one-nation', widths: [640, 960, 1440] },
  // Portrait source – crop to the globe + skyline so we don't ship pixels the card never shows.
  { src: 'beLight.jpeg', name: 'be-light', widths: [480, 800, 1100], extract: { left: 0, top: 1100, width: 3333, height: 3500 } },
  { src: 'poweredBy1.png', name: 'logo-twwo', widths: [256], flatten: true },
  // The Envoy logo has a dark hairline along its top edge – trim it off.
  { src: 'poweredBy2.jpg', name: 'logo-envoy', widths: [256], extract: { left: 0, top: 8, width: 903, height: 820 } },
  { src: 'poweredBy3.jpg', name: 'logo-glory', widths: [256] },
  // Book covers. All About You's source is only 434px wide, so it gets a single size.
  { src: 'all_about_you.jpeg', name: 'book-all-about-you', widths: [434] },
  { src: 'day_one.jpeg', name: 'book-day-one', widths: [360, 720] },
  { src: 'purpose.jpeg', name: 'book-purpose', widths: [360, 720] },
  { src: 'just_one_word.jpeg', name: 'book-just-one-word', widths: [360, 720] },
]

await mkdir(OUT, { recursive: true })
await mkdir('src/generated', { recursive: true })
const placeholders = {}

for (const job of jobs) {
  const base = () => {
    let img = sharp(path.join(SRC, job.src)).rotate()
    if (job.extract) img = img.extract(job.extract)
    if (job.flatten) img = img.flatten({ background: '#ffffff' })
    return img
  }
  for (const w of job.widths) {
    await base().resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 74, effort: 6 }).toFile(path.join(OUT, `${job.name}-${w}.webp`))
    await base().resize({ width: w, withoutEnlargement: true })
      .jpeg({ quality: 76, mozjpeg: true, progressive: true }).toFile(path.join(OUT, `${job.name}-${w}.jpg`))
  }
  if (job.placeholder) {
    const buf = await base().resize({ width: 24 }).blur(1).webp({ quality: 40 }).toBuffer()
    placeholders[job.name] = `data:image/webp;base64,${buf.toString('base64')}`
  }
  console.log('✓', job.name)
}

await writeFile(
  'src/generated/placeholders.json',
  JSON.stringify(placeholders, null, 2) + '\n',
)
