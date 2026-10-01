import { MotionConfig } from 'motion/react'
import { useEffect } from 'react'
import { Toaster } from 'sonner'
import { ApostleEndorsement } from './components/ApostleEndorsement'
import { EditorialMarquee } from './components/EditorialMarquee'
import { EventsShowcase } from './components/EventsShowcase'
import { Footer } from './components/Footer'
import { HeaderNav } from './components/HeaderNav'
import { HeroSection } from './components/HeroSection'
import { RegistrationForm } from './components/RegistrationForm'
import { ScriptureAltar } from './components/ScriptureAltar'
import { SmoothScroll, useScrollTo } from './lib/smooth-scroll'

/** Honour deep links like /#register once the page has laid out. */
function InitialHash() {
  const scrollTo = useScrollTo()
  useEffect(() => {
    const hash = window.location.hash
    if (hash.length > 1) requestAnimationFrame(() => scrollTo(hash, { immediate: true }))
  }, [])
  return null
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        <InitialHash />
        <div className="grain min-h-screen bg-ink text-cream antialiased">
          <a
            href="#register"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-ink"
          >
            Skip to registration
          </a>
          <HeaderNav />
          <main>
            <HeroSection />
            <EditorialMarquee />
            <ScriptureAltar />
            <EventsShowcase />
            <RegistrationForm />
            <ApostleEndorsement />
          </main>
          <Footer />
        </div>
        <Toaster
          theme="dark"
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#16161a',
              border: '1px solid #2E2B25',
              color: '#F5F3EF',
              fontFamily: 'var(--font-sans)',
            },
          }}
        />
      </SmoothScroll>
    </MotionConfig>
  )
}
