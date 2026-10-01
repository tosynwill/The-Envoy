import { Check, Loader2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useId, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { toast } from 'sonner'
import { getCountries } from '../lib/countries'
import { EASE_OUT_EXPO, Eyebrow, MaskLine, Reveal } from './Reveal'

const INTERESTS = [
  { id: 'prayer', label: 'One Nation At A Time — Weekly Prayer' },
  { id: 'mission', label: 'Let There Be Light — 2-Day Mission' },
  { id: 'host', label: 'Host or join a mission in my city' },
] as const

type Fields = {
  name: string
  email: string
  country: string
  city: string
  phone: string
  interests: string[]
  note: string
  /** Honeypot – real people never see or fill this. */
  company: string
}

const EMPTY: Fields = {
  name: '',
  email: '',
  country: '',
  city: '',
  phone: '',
  interests: [],
  note: '',
  company: '',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(f: Fields) {
  const errors: Partial<Record<keyof Fields, string>> = {}
  if (f.name.trim().length < 2) errors.name = 'Please share your name.'
  if (!EMAIL_RE.test(f.email.trim())) errors.email = 'Please enter a valid email address.'
  if (!f.country.trim()) errors.country = 'Which country are you in?'
  if (f.interests.length === 0) errors.interests = 'Choose at least one.'
  return errors
}

const EMAILJS = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined,
}

async function submitRegistration(f: Fields) {
  // EmailJS templates take flat string values – reference these as {{name}}, {{email}}, etc.
  const params = {
    name: f.name.trim(),
    email: f.email.trim(),
    country: f.country.trim(),
    city: f.city.trim() || '—',
    phone: f.phone.trim() || '—',
    interests: f.interests
      .map((id) => INTERESTS.find((i) => i.id === id)?.label ?? id)
      .join(', '),
    note: f.note.trim() || '—',
    time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    submitted_at: new Date().toUTCString(),
  }
  const { serviceId, templateId, publicKey } = EMAILJS
  if (!serviceId || !templateId || !publicKey) {
    // EmailJS not configured yet – see .env.example.
    console.warn('[register] EmailJS env vars are not set. Submission not sent:', params)
    await new Promise((r) => setTimeout(r, 900))
    return
  }
  // Loaded on demand so the SDK isn't in the initial bundle.
  const { default: emailjs } = await import('@emailjs/browser')
  await emailjs.send(serviceId, templateId, params, { publicKey })
}

const inputCls =
  'h-11 w-full rounded-lg border bg-[#16161a] px-3.5 text-[15px] text-cream placeholder:text-faint transition-[border-color,box-shadow] duration-200 outline-none focus:border-gold/60 focus:ring-4 focus:ring-gold/10'

function Field({
  label,
  required,
  error,
  htmlFor,
  className = '',
  children,
}: {
  label: string
  required?: boolean
  error?: string
  htmlFor: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-2 block text-[15px] text-sand">
        {label}
        {required && <span className="text-gold-soft"> *</span>}
      </label>
      {children}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={`${htmlFor}-error`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-1.5 text-xs text-danger"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

export function RegistrationForm() {
  const [fields, setFields] = useState<Fields>(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const countries = useMemo(getCountries, [])
  const listId = useId()

  const errors = submitted ? validate(fields) : {}
  const set = <K extends keyof Fields>(key: K, value: Fields[K]) =>
    setFields((f) => ({ ...f, [key]: value }))

  const toggleInterest = (id: string) =>
    set(
      'interests',
      fields.interests.includes(id)
        ? fields.interests.filter((x) => x !== id)
        : [...fields.interests, id],
    )

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    const errs = validate(fields)
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0]
      document.getElementById(`reg-${first}`)?.focus()
      return
    }
    if (fields.company) {
      setStatus('done') // bot – pretend success
      return
    }
    setStatus('sending')
    try {
      await submitRegistration(fields)
      setStatus('done')
      toast.success('Welcome to the movement', {
        description: 'We’ll be in touch with meeting links and mission dates.',
      })
    } catch {
      setStatus('idle')
      toast.error('We couldn’t send that just now', {
        description: 'Please check your connection and try again.',
      })
    }
  }

  const aria = (key: keyof Fields) =>
    errors[key]
      ? { 'aria-invalid': true as const, 'aria-describedby': `reg-${key}-error` }
      : {}
  const border = (key: keyof Fields) => (errors[key] ? 'border-danger/70' : 'border-line-2')

  return (
    <section id="register" data-testid="registration-section" className="bg-ink-3 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5 lg:pt-2">
          <Reveal>
            <Eyebrow>REGISTER YOUR INTEREST</Eyebrow>
          </Reveal>
          <h2 className="mt-5 font-heading text-[2.6rem] leading-[1.05] font-bold tracking-[-0.02em] text-ivory sm:text-6xl">
            <MaskLine>Take your place</MaskLine>
            <MaskLine delay={0.08}>
              <span className="text-gold italic">in the harvest.</span>
            </MaskLine>
          </h2>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
              To be part of the At Least A Nation Movement, kindly register your interest below. We
              will reach out with meeting links, mission dates, and city announcements.
            </p>
          </Reveal>
        </div>

        <Reveal className="lg:col-span-7" delay={0.1} y={40}>
          <div className="relative overflow-hidden rounded-3xl border border-line-2 bg-ink/50 p-6 sm:p-10">
            <AnimatePresence mode="wait" initial={false}>
              {status === 'done' ? (
                <motion.div
                  key="thanks"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
                  className="flex min-h-[28rem] flex-col items-center justify-center text-center"
                  role="status"
                >
                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.15 }}
                    className="grid h-16 w-16 place-items-center rounded-full border border-gold/40 bg-gold/10"
                  >
                    <Check className="h-7 w-7 text-gold" strokeWidth={1.75} />
                  </motion.span>
                  <h3 className="mt-8 font-heading text-3xl text-ivory sm:text-4xl">
                    Thank you, {fields.name.trim().split(' ')[0]}.
                  </h3>
                  <p className="mt-4 max-w-sm leading-relaxed text-muted">
                    Your interest has been received. We’ll reach out with meeting links, mission
                    dates and city announcements. God bless you.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFields(EMPTY)
                      setSubmitted(false)
                      setStatus('idle')
                    }}
                    className="mt-8 text-sm text-gold-soft underline-offset-4 hover:underline"
                  >
                    Register someone else
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                  onSubmit={onSubmit}
                  noValidate
                  className="grid gap-5 sm:grid-cols-2 sm:gap-x-6"
                >
                  <Field label="Full name" required htmlFor="reg-name" error={errors.name}>
                    <input
                      id="reg-name"
                      autoComplete="name"
                      placeholder="Your name"
                      value={fields.name}
                      onChange={(e) => set('name', e.target.value)}
                      className={`${inputCls} ${border('name')}`}
                      {...aria('name')}
                    />
                  </Field>
                  <Field label="Email address" required htmlFor="reg-email" error={errors.email}>
                    <input
                      id="reg-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={fields.email}
                      onChange={(e) => set('email', e.target.value)}
                      className={`${inputCls} ${border('email')}`}
                      {...aria('email')}
                    />
                  </Field>
                  <Field label="Country" required htmlFor="reg-country" error={errors.country}>
                    <input
                      id="reg-country"
                      autoComplete="country-name"
                      list={listId}
                      placeholder="e.g. United Kingdom"
                      value={fields.country}
                      onChange={(e) => set('country', e.target.value)}
                      className={`${inputCls} ${border('country')}`}
                      {...aria('country')}
                    />
                    <datalist id={listId}>
                      {countries.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </Field>
                  <Field label="City" htmlFor="reg-city">
                    <input
                      id="reg-city"
                      autoComplete="address-level2"
                      placeholder="Your city"
                      value={fields.city}
                      onChange={(e) => set('city', e.target.value)}
                      className={`${inputCls} border-line-2`}
                    />
                  </Field>
                  <Field label="Phone / WhatsApp" htmlFor="reg-phone" className="sm:col-span-2">
                    <input
                      id="reg-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+44 …"
                      value={fields.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      className={`${inputCls} border-line-2`}
                    />
                  </Field>

                  <fieldset
                    className="sm:col-span-2"
                    aria-describedby={errors.interests ? 'reg-interests-error' : undefined}
                  >
                    <legend className="mb-3 text-[15px] text-sand">
                      I’m interested in<span className="text-gold-soft"> *</span>
                    </legend>
                    <div className="flex flex-col items-start gap-3">
                      {INTERESTS.map(({ id, label }, i) => {
                        const on = fields.interests.includes(id)
                        return (
                          <button
                            key={id}
                            id={i === 0 ? 'reg-interests' : undefined}
                            type="button"
                            role="checkbox"
                            aria-checked={on}
                            onClick={() => toggleInterest(id)}
                            className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-5 py-2.5 text-left text-[15px] transition-all duration-300 ${
                              on
                                ? 'border-gold bg-gold/15 text-gold-soft'
                                : 'border-line-2 text-sand hover:border-gold/40 hover:text-ivory'
                            }`}
                          >
                            <span
                              className={`grid overflow-hidden transition-all duration-300 ${on ? 'w-4 opacity-100' : 'w-0 opacity-0'}`}
                            >
                              <Check className="h-4 w-4" strokeWidth={2} />
                            </span>
                            {label}
                          </button>
                        )
                      })}
                    </div>
                    <AnimatePresence initial={false}>
                      {errors.interests && (
                        <motion.p
                          id="reg-interests-error"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-2 text-xs text-danger"
                        >
                          {errors.interests}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </fieldset>

                  <Field label="A note or prayer request" htmlFor="reg-note" className="sm:col-span-2">
                    <textarea
                      id="reg-note"
                      rows={3}
                      placeholder="Anything you’d like us to know…"
                      value={fields.note}
                      onChange={(e) => set('note', e.target.value)}
                      data-lenis-prevent
                      className={`${inputCls} h-auto min-h-[5.5rem] resize-y border-line-2 py-3`}
                    />
                  </Field>

                  {/* Honeypot */}
                  <input
                    type="text"
                    name="company"
                    tabIndex={-1}
                    autoComplete="off"
                    value={fields.company}
                    onChange={(e) => set('company', e.target.value)}
                    className="absolute -left-[9999px] h-0 w-0 opacity-0"
                    aria-hidden
                  />

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    data-testid="register-submit"
                    className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gold font-medium text-ink transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-hi hover:shadow-[0_10px_36px_rgba(230,184,106,0.3)] disabled:translate-y-0 disabled:opacity-70 sm:col-span-2"
                  >
                    {status === 'sending' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                      </>
                    ) : (
                      'Register My Interest'
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
