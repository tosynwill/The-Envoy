/**
 * Envoy books worker.
 *
 *   POST /stripe-webhook  Stripe calls this after checkout (emails go out via Brevo):
 *                         - products with `ebook_file` metadata: the buyer is emailed a
 *                           signed, expiring download link;
 *                         - every other product is a printed book: the seller is emailed
 *                           the order and delivery address to fulfil by hand.
 *   GET  /download        Serves a file from the private R2 bucket if the link is valid.
 */

export interface Env {
  EBOOKS: R2Bucket
  STRIPE_SECRET_KEY: string
  STRIPE_WEBHOOK_SECRET: string
  BREVO_API_KEY: string
  DOWNLOAD_SECRET: string
  SENDER_EMAIL: string
  SENDER_NAME: string
  REPLY_TO: string
  /** Receives an email for every printed-book order. */
  ORDER_NOTIFY_EMAIL: string
  LINK_TTL_DAYS: string
  SITE_URL: string
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url)
    try {
      if (url.pathname === '/stripe-webhook' && request.method === 'POST') {
        return await handleStripeWebhook(request, env, url.origin)
      }
      if (url.pathname === '/download' && request.method === 'GET') {
        return await handleDownload(url, env)
      }
      if (url.pathname === '/') return new Response('ok')
      return new Response('Not found', { status: 404 })
    } catch (err) {
      console.error(err)
      // A 5xx makes Stripe retry the webhook later.
      return new Response('Internal error', { status: 500 })
    }
  },
} satisfies ExportedHandler<Env>

/* ------------------------------------------------------------------ Stripe */

type Address = {
  line1: string | null
  line2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
}

type ShippingDetails = { name: string | null; address: Address | null } | null

type CheckoutSession = {
  id: string
  livemode: boolean
  payment_status: 'paid' | 'unpaid' | 'no_payment_required'
  payment_intent: string | null
  amount_total: number | null
  currency: string | null
  customer_details: {
    email: string | null
    name: string | null
    phone: string | null
    address: Address | null
  } | null
  // Newer API versions put the shipping address here; older ones at the top level.
  collected_information?: { shipping_details: ShippingDetails } | null
  shipping_details?: ShippingDetails
}

type LineItem = {
  quantity: number
  amount_total: number
  price: { product: { name: string; metadata: Record<string, string> } }
}

async function handleStripeWebhook(request: Request, env: Env, origin: string) {
  const body = await request.text()
  const ok = await verifyStripeSignature(
    body,
    request.headers.get('Stripe-Signature'),
    env.STRIPE_WEBHOOK_SECRET,
  )
  if (!ok) {
    console.warn('Rejected webhook: bad or stale Stripe signature')
    return new Response('Bad signature', { status: 400 })
  }

  const event = JSON.parse(body) as { type: string; data: { object: CheckoutSession } }
  // `completed` fires for card payments; `async_payment_succeeded` for delayed
  // methods (e.g. bank debits) once the money actually arrives.
  const relevant =
    event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.async_payment_succeeded'
  const session = event.data.object
  console.log(`${event.type} ${session.id} payment_status=${session.payment_status}`)
  if (!relevant || session.payment_status !== 'paid') return new Response('Ignored')

  const email = session.customer_details?.email
  if (!email) throw new Error(`Session ${session.id} has no customer email`)

  const items = await getLineItems(session.id, env)
  const printed = items.filter((li) => !li.price.product.metadata.ebook_file)
  const ebooks = items
    .map((li) => ({ title: li.price.product.name, file: li.price.product.metadata.ebook_file }))
    .filter((b): b is { title: string; file: string } => Boolean(b.file))

  // Seller first: if the ebook email then fails, Stripe's retry may repeat this
  // notification, but a duplicate order email beats a missing one.
  if (printed.length > 0) {
    await sendOrderNotification(env, session, printed)
    console.log(`Notified seller of ${printed.length} printed item(s) in ${session.id}`)
  }

  if (ebooks.length > 0) {
    // Fail (and let Stripe retry) rather than email a link to a file that isn't there.
    for (const { file } of ebooks) {
      if (!(await env.EBOOKS.head(file))) throw new Error(`Ebook file not in R2: ${file}`)
    }
    const expires = Math.floor(Date.now() / 1000) + Number(env.LINK_TTL_DAYS) * 86_400
    const links = await Promise.all(
      ebooks.map(async (b) => ({
        ...b,
        url: `${origin}/download?${await signDownload(b.file, expires, env.DOWNLOAD_SECRET)}`,
      })),
    )
    await sendEbookEmail(env, { email, name: session.customer_details?.name ?? '' }, links)
    console.log(`Sent ${links.length} ebook link(s) for ${session.id}`)
  }

  return new Response('Sent')
}

async function getLineItems(sessionId: string, env: Env): Promise<LineItem[]> {
  const res = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${sessionId}/line_items?limit=100&expand[]=data.price.product`,
    { headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` } },
  )
  if (!res.ok) throw new Error(`Stripe line_items ${res.status}: ${await res.text()}`)
  return ((await res.json()) as { data: LineItem[] }).data
}

/** https://docs.stripe.com/webhooks#verify-manually */
async function verifyStripeSignature(body: string, header: string | null, secret: string) {
  if (!header) return false
  const parts = header.split(',').map((p) => p.split('='))
  const timestamp = parts.find(([k]) => k === 't')?.[1]
  const signatures = parts.filter(([k]) => k === 'v1').map(([, v]) => v)
  if (!timestamp || signatures.length === 0) return false
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false
  const expected = toHex(await hmac(secret, `${timestamp}.${body}`))
  return signatures.some((sig) => timingSafeEqual(sig, expected))
}

/* ---------------------------------------------------------------- Download */

async function signDownload(file: string, expires: number, secret: string) {
  const sig = toBase64Url(await hmac(secret, `${file}\n${expires}`))
  return new URLSearchParams({ f: file, e: String(expires), s: sig }).toString()
}

async function handleDownload(url: URL, env: Env) {
  const file = url.searchParams.get('f') ?? ''
  const expires = Number(url.searchParams.get('e'))
  const sig = url.searchParams.get('s') ?? ''
  const expected = toBase64Url(await hmac(env.DOWNLOAD_SECRET, `${file}\n${expires}`))
  if (!file || !timingSafeEqual(sig, expected)) {
    return linkProblemPage(env, 'This download link isn’t valid.')
  }
  if (Date.now() / 1000 > expires) {
    return linkProblemPage(env, 'This download link has expired.')
  }

  const object = await env.EBOOKS.get(file)
  if (!object) return linkProblemPage(env, 'This book is temporarily unavailable.')

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  if (!headers.has('Content-Type')) headers.set('Content-Type', contentTypeFor(file))
  const filename = file.split('/').pop()!.replace(/["\\]/g, '')
  headers.set('Content-Disposition', `attachment; filename="${filename}"`)
  headers.set('Cache-Control', 'private, no-store')
  return new Response(object.body, { headers })
}

function contentTypeFor(file: string) {
  if (file.endsWith('.pdf')) return 'application/pdf'
  if (file.endsWith('.epub')) return 'application/epub+zip'
  return 'application/octet-stream'
}

function linkProblemPage(env: Env, message: string) {
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Download</title>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0c0e;color:#f5f3ef;font-family:system-ui,sans-serif;padding:24px;text-align:center">
<div><p style="font-size:18px">${escapeHtml(message)}</p>
<p style="color:#a8a29a">Reply to your purchase email or write to
<a style="color:#e6b86a" href="mailto:${escapeHtml(env.REPLY_TO)}">${escapeHtml(env.REPLY_TO)}</a>
and we’ll send you a new link.</p></div></body>`
  return new Response(html, { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

/* ------------------------------------------------------------------- Brevo */

async function sendEbookEmail(
  env: Env,
  to: { email: string; name: string },
  books: { title: string; url: string }[],
) {
  const firstName = to.name.trim().split(/\s+/)[0] || 'friend'
  const buttons = books
    .map(
      (b) => `
      <tr><td style="padding:10px 0">
        <div style="font-size:16px;color:#1a1a1a;margin-bottom:8px"><strong>${escapeHtml(b.title)}</strong></div>
        <a href="${escapeHtml(b.url)}" style="display:inline-block;background:#e6b86a;color:#0b0c0e;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600">Download</a>
        <div style="margin-top:8px;font-size:12px;color:#777">If the button doesn’t work, copy this link into your browser:<br>
          <span style="word-break:break-all;color:#555">${escapeHtml(b.url)}</span></div>
      </td></tr>`,
    )
    .join('')

  const htmlContent = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Arial,sans-serif;font-size:15px;line-height:1.6;color:#333;max-width:560px">
    <p>Hi ${escapeHtml(firstName)},</p>
    <p>Thank you for your purchase. Your ${books.length > 1 ? 'ebooks are' : 'ebook is'} ready to download:</p>
    <table role="presentation" style="margin:8px 0 16px">${buttons}</table>
    <p style="color:#777;font-size:13px">
      ${books.length > 1 ? 'These links work' : 'This link works'} for ${Number(env.LINK_TTL_DAYS)} days,
      so please save the file to your device. If it expires, just reply to this email.
    </p>
    <p>God bless you,<br>${escapeHtml(env.SENDER_NAME)}<br>
      <a href="${escapeHtml(env.SITE_URL)}" style="color:#b8893a">${escapeHtml(env.SITE_URL.replace(/^https?:\/\//, ''))}</a></p>
  </div>`

  await sendBrevo(env, {
    to,
    replyTo: env.REPLY_TO,
    subject: books.length > 1 ? 'Your ebooks are ready' : `Your ebook: ${books[0].title}`,
    htmlContent,
  })
}

/** Emails the seller everything needed to post a printed-book order. */
async function sendOrderNotification(env: Env, session: CheckoutSession, items: LineItem[]) {
  const c = session.customer_details
  const ship = session.collected_information?.shipping_details ?? session.shipping_details ?? null
  const money = (cents: number | null) =>
    cents === null
      ? '—'
      : new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: (session.currency ?? 'usd').toUpperCase(),
        }).format(cents / 100)

  const address = ship?.address ?? c?.address
  const addressLines = address
    ? [
        address.line1,
        address.line2,
        [address.city, address.state, address.postal_code].filter(Boolean).join(', '),
        address.country && countryName(address.country),
      ].filter(Boolean)
    : ['No delivery address was collected. Contact the buyer.']

  const stripeUrl = session.payment_intent
    ? `https://dashboard.stripe.com/${session.livemode ? '' : 'test/'}payments/${session.payment_intent}`
    : null
  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 16px 4px 0;color:#888;vertical-align:top;white-space:nowrap">${label}</td><td style="padding:4px 0">${value}</td></tr>`

  const htmlContent = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Arial,sans-serif;font-size:15px;line-height:1.6;color:#333;max-width:560px">
    ${session.livemode ? '' : '<p style="background:#fff4d6;padding:8px 12px;border-radius:6px"><strong>TEST ORDER</strong> (Stripe sandbox, no real payment)</p>'}
    <p>A new book order has been paid. Please arrange delivery to the address below.</p>
    <h3 style="margin:20px 0 6px">Books</h3>
    <table role="presentation" style="border-collapse:collapse">
      ${items.map((li) => row(`${li.quantity} ×`, `${escapeHtml(li.price.product.name)} <span style="color:#888">(${money(li.amount_total)})</span>`)).join('')}
      ${row('Total paid', `<strong>${money(session.amount_total)}</strong>`)}
    </table>
    <h3 style="margin:20px 0 6px">Deliver to</h3>
    <p style="margin:0">${[ship?.name ?? c?.name, ...addressLines].filter(Boolean).map((l) => escapeHtml(l!)).join('<br>')}</p>
    <h3 style="margin:20px 0 6px">Buyer</h3>
    <table role="presentation" style="border-collapse:collapse">
      ${row('Name', escapeHtml(c?.name ?? '—'))}
      ${row('Email', c?.email ? `<a href="mailto:${escapeHtml(c.email)}">${escapeHtml(c.email)}</a>` : '—')}
      ${row('Phone', escapeHtml(c?.phone ?? '—'))}
    </table>
    ${stripeUrl ? `<p style="margin-top:20px"><a href="${stripeUrl}">View this payment in Stripe</a></p>` : ''}
    <p style="color:#888;font-size:13px">Reply to this email to contact the buyer.</p>
  </div>`

  const titles = items.map((li) => `${li.quantity}× ${li.price.product.name}`).join(', ')
  await sendBrevo(env, {
    to: { email: env.ORDER_NOTIFY_EMAIL, name: '' },
    replyTo: c?.email ?? env.REPLY_TO,
    subject: `${session.livemode ? '' : '[TEST] '}New book order: ${titles}`,
    htmlContent,
  })
}

async function sendBrevo(
  env: Env,
  msg: { to: { email: string; name: string }; replyTo: string; subject: string; htmlContent: string },
) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { email: env.SENDER_EMAIL, name: env.SENDER_NAME },
      // Brevo rewrites links through its click tracker, which breaks download links.
      // Declining tracking consent per recipient stops that; the plain-text URL in the
      // ebook email is the fallback if it ever doesn't.
      to: [
        {
          email: msg.to.email,
          ...(msg.to.name && { name: msg.to.name }),
          contactPixelTrackingConsent: false,
        },
      ],
      replyTo: { email: msg.replyTo },
      subject: msg.subject,
      htmlContent: msg.htmlContent,
    }),
  })
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`)
}

/* ----------------------------------------------------------------- Helpers */

/** "NG" → "Nigeria" (falls back to the code if the runtime doesn't know it). */
function countryName(code: string) {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code
  } catch {
    return code
  }
}

async function hmac(secret: string, message: string) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(message)))
}

const toHex = (bytes: Uint8Array) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')

const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
