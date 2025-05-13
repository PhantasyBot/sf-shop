import { RealViewport } from '@studio-freight/compono'
import { useLenis } from '@studio-freight/react-lenis'
import { raf } from '@studio-freight/tempus'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { useInitCart } from 'hooks/use-cart'
import { GTM_ID } from 'lib/analytics'
import { useStore } from 'lib/store'
import { ProjectProvider, RafDriverProvider } from 'lib/theatre'
import logger from 'lib/utils/logger'
import dynamic from 'next/dynamic'
import Script from 'next/script'
import { useEffect } from 'react'
import 'styles/global.scss'

const Noise = dynamic(
  () => import('components/noise').then(({ Noise }) => Noise),
  {
    ssr: false,
  }
)

// Direct console log for debugging environment variables
console.log('DIRECT LOG - Environment variables:')
console.log(
  'NEXT_PUBLIC_SHOPIFY_DOMAIN:',
  process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN
)
console.log('NEXT_PUBLIC_LOG_LEVEL:', process.env.NEXT_PUBLIC_LOG_LEVEL)

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
  ScrollTrigger.defaults({ markers: process.env.NODE_ENV === 'development' })

  // merge rafs
  gsap.ticker.lagSmoothing(0)
  gsap.ticker.remove(gsap.updateRoot)
  raf.add((time) => {
    gsap.updateRoot(time / 1000)
  }, 0)

  // reset scroll position
  window.scrollTo(0, 0)
  window.history.scrollRestoration = 'manual'
}

function MyApp({ Component, pageProps }) {
  const lenis = useLenis(ScrollTrigger.update)
  useEffect(ScrollTrigger.refresh, [lenis])
  useInitCart()
  const navIsOpened = useStore(({ navIsOpened }) => navIsOpened)

  useEffect(() => {
    // Test if logger is working in useEffect
    console.log('DIRECT LOG - Testing logger in useEffect')
    logger.debug('DEBUG LOG - Testing logger debug level')
    logger.info('INFO LOG - Testing logger info level')
    logger.warn('WARN LOG - Testing logger warn level')
    logger.error('ERROR LOG - Testing logger error level')

    // Test direct console.log with Shopify credentials
    console.log(
      'DIRECT LOG - Shopify domain:',
      process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN
    )
    console.log(
      'DIRECT LOG - Has Shopify token:',
      !!process.env.NEXT_SHOPIFY_STOREFRONT_ACCESS_TOKEN
    )

    if (navIsOpened) {
      lenis?.stop()
    } else {
      lenis?.start()
    }
  }, [lenis, navIsOpened])

  return (
    <>
      {/* Google Tag Manager - Global base code */}
      {process.env.NODE_ENV !== 'development' && (
        <>
          <Script
            async
            strategy="worker"
            src={`https://www.googletagmanager.com/gtag/js?id=${GTM_ID}`}
          />
          <Script
            id="gtm-base"
            strategy="worker"
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GTM_ID}');`,
            }}
          />
        </>
      )}
      <RealViewport />
      <Noise />
      <ProjectProvider
        id="Satus"
        config="/config/Satus-2023-04-17T12_55_21.json"
      >
        <RafDriverProvider id="default">
          <Component {...pageProps} />
        </RafDriverProvider>
      </ProjectProvider>
    </>
  )
}

export default MyApp
