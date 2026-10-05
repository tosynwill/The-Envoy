/**
 * The bookstore catalogue.
 *
 * Each format's `link` is a Stripe Payment Link (https://buy.stripe.com/…). Leave it
 * empty and the button shows "Coming soon" instead. Ebook delivery is handled by the
 * worker in /worker: the ebook's Stripe product needs `ebook_file` metadata.
 */

export type BookFormat = {
  kind: 'Paperback' | 'Hardcover' | 'Ebook'
  /** USD. `null` while the price isn't set yet. */
  price: number | null
  link: string
}

export type Book = {
  id: string
  title: string
  subtitle: string
  /** Base name of the generated cover in /public/images. */
  cover: string
  coverWidths: number[]
  about: string
  formats: BookFormat[]
}

export const AUTHOR = {
  name: 'Tosin Williams',
  bio: [
    'Tosin Williams is the president of The Envoy Ministries International, Houston, TX, United States, with mission networks in the United Kingdom, Africa, and Asia.',
    'In line with his God-given mandate, he travels the nations preaching the Word of faith, igniting the fire of revival. He currently facilitates an online Intercessory Prayer Session for the Nations, #AtLeastANation, on Zoom, Facebook, YouTube and Instagram, alongside a prayer session for students, #WhenStudentsPray, on Zoom (US time zone).',
    'Tosin is married to Titilayo, and they are blessed with three children.',
  ],
}

export const BOOKS: Book[] = [
  {
    id: 'all-about-you',
    title: 'All About You',
    subtitle: 'Unveiling Your Identity from God’s Perspective',
    cover: 'book-all-about-you',
    coverWidths: [434],
    about:
      'This book is a direct exploration of a Christian identity and responsibility. Instead of passive faith or religious clichés, it challenges believers to understand who they truly are in Christ and to live with purpose, courage, and accountability. Through short, powerful chapters grounded in Scripture, it confronts excuses, exposes shallow thinking, and calls readers to mature faith. Each chapter focuses on identity, such as You are the light of the world, You are God’s temple, You are supernatural, and more, showing how faith must translate into action. Written in a bold, discussion-style tone, this book invites readers to stop complaining or comparing, start leading, and live as the people God created them to be.',
    formats: [
      { kind: 'Paperback', price: 15, link: 'https://buy.stripe.com/test_6oU8wOdG177rgdMdDIf3a01' },
      { kind: 'Ebook', price: null, link: '' },
    ],
  },
  {
    id: 'day-one',
    title: 'Day One',
    subtitle: 'A 10-Day Journey of Faith, Courage, and Action',
    cover: 'book-day-one',
    coverWidths: [360, 720],
    about:
      'Day One is a short, powerful Christian motivational guide about turning “someday” decisions into action today. Through ten reflective chapters, the book explores themes like change, forgiveness, healing, courage, leadership, service, and rebuilding life after setbacks. Each chapter combines biblical insights, real-life style examples, reflective questions, and practical action steps to help readers move forward spiritually and personally. Rather than waiting for the perfect moment, the book encourages readers to declare today as their Day One: the starting point for transformation, faith, and purposeful living. It’s a devotional-style read designed to inspire believers to take immediate steps toward growth.',
    formats: [
      { kind: 'Paperback', price: 15, link: 'https://buy.stripe.com/test_fZu00igSdbnH1iSeHMf3a02' },
      { kind: 'Ebook', price: null, link: '' },
    ],
  },
  {
    id: 'purpose',
    title: 'Purpose',
    subtitle: '30 Essential Things You Need to Know',
    cover: 'book-purpose',
    coverWidths: [360, 720],
    about:
      'Purpose makes the life of any man colourful. This book highlights just how to do that by revealing what purpose is. The author not only expounds on what your expectations should be in your quest towards fulfilling your God-given purpose, but also how to acquire the resources required to complete it, with topics such as: Purpose is not coincidental. Your purpose has a time tag. Purpose needs a plan. Purpose affects priority. Purpose determined when you showed up here. Purpose comes before pleasure… and much more. You were created for a purpose and called for a purpose. Don’t live another day without it!',
    formats: [
      { kind: 'Hardcover', price: 25, link: 'https://buy.stripe.com/test_00w9ASdG18bv9Po1V0f3a03' },
      { kind: 'Ebook', price: null, link: '' },
    ],
  },
  {
    id: 'just-one-word',
    title: 'Just One Word',
    subtitle: '31 Days Daily Devotional: A Daily Guide for Wholesome Living',
    cover: 'book-just-one-word',
    coverWidths: [360, 720],
    about:
      'Just One Word is a 31-day Christian devotional designed to help readers encounter God’s Word, strengthen their faith, and live with greater purpose. Drawing from Scripture and practical spiritual insight, Tosin Williams explores identity, obedience, divine direction, creativity, wisdom, stewardship, courage, comfort, and the power of confession. Each daily reflection encourages believers to trust God’s promises, recognize their gifts, follow His instructions, overcome challenges, and represent Christ in everyday life. With its accessible messages and faith-filled declarations, this devotional invites you to meditate deeply, act, and grow daily: one word, one day, and one transformative encounter with God at a time.',
    formats: [
      { kind: 'Paperback', price: 9.99, link: 'https://buy.stripe.com/test_aFa5kC7hD9fz8Lk2Z4f3a04' },
      { kind: 'Ebook', price: null, link: '' },
    ],
  },
]

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export const formatPrice = (price: number) =>
  Number.isInteger(price) ? usd.format(price).replace('.00', '') : usd.format(price)
