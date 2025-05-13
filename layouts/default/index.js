import { CustomHead } from '@studio-freight/compono'
import { useDebug } from '@studio-freight/hamo'
import cn from 'clsx'
import { Footer } from 'components/footer'
import { Header } from 'components/header'
import dynamic from 'next/dynamic'
import s from './layout.module.scss'

const Orchestra = dynamic(
  () => import('lib/orchestra').then(({ Orchestra }) => Orchestra),
  { ssr: false }
)

export function Layout({
  seo = {
    title: 'PHANTASY - 18+ NSFW AI Gaming & Entertainiment Studio',
    description:
      'Phantasy is an 18+ AI-powered chatbot that can help you with your fantasies`.',
    image: { url: 'https://studiofreight.com/sf-og.jpg' },
    keywords: [
      'freight',
      'studio',
      'UX',
      'UI',
      'userexperience',
      'webdesign',
      'webdeveloper',
      'design',
      'codedesign',
      'code',
      'hashtag',
      'development',
      'website',
      'websitedevelopment',
      'webservices',
      'art direction',
      'strategy',
      'web',
      'murals',
      'illustration',
      'photography',
      'signage',
      'video',
    ],
  },
  children,
  theme = 'dark',
  className,
  principles,
  footerLinks,
  studioInfo,
  contactData,
}) {
  const debug = useDebug()

  return (
    <>
      <CustomHead {...seo} />
      <div className={cn(`theme-${theme}`, s.layout, className)}>
        <Header
          title="PHANTASY"
          principles={principles}
          contact={contactData}
          titleClassName="husky-font"
        />
        <main className={s.main}>{children}</main>
        <Footer links={footerLinks} studioInfo={studioInfo} />
      </div>
      {debug && (
        <>
          <Orchestra />
        </>
      )}
    </>
  )
}
